import { useState, useMemo } from 'react';
import { useHeyaData } from '../../hooks/useHeyaData';
import { useAllDivisionsBanzuke } from '../../hooks/useAllDivisionsBanzuke';
import { getCurrentBashoId } from '../../utils/bashoId';
import { RANK_ORDER } from '../../utils/constants';
import { getIchimon } from '../../utils/ichimon';
import useLocalStorage from '../../hooks/useLocalStorage';
import HeyaGrid from './HeyaGrid';
import HeyaCardGrid from './HeyaCardGrid';
import HeyaSidebar from './HeyaSidebar';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import styles from './HeyaDashboard.module.css';

function HeyaDashboard() {
  // Prefetch all six divisions for the current basho as soon as the heya view
  // loads.  Same query keys as useBanzuke, so the cache is shared — by the time
  // the user clicks a heya card the data is already there.
  const [prefetchBashoId] = useState(getCurrentBashoId);
  useAllDivisionsBanzuke(prefetchBashoId);

  const [layout, setLayout] = useLocalStorage('sumo-heya-layout', 'card');
  const [heyaSearch, setHeyaSearch] = useState('');
  const [rikishiSearch, setRikishiSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const { heyaList, isLoading, error } = useHeyaData();

  const filteredAndSorted = useMemo(() => {
    let list = heyaList;

    if (heyaSearch.trim()) {
      const q = heyaSearch.toLowerCase();
      list = list.filter((h) => h.name.toLowerCase().includes(q));
    }

    if (rikishiSearch.trim()) {
      const q = rikishiSearch.toLowerCase();
      list = list.filter((h) =>
        h.rikishi.some((r) => r.shikonaEn?.toLowerCase().includes(q))
      );
    }

    const sorted = [...list];
    const dir = sortDir === 'asc' ? 1 : -1;

    if (sortKey === 'name') {
      sorted.sort((a, b) => dir * a.name.localeCompare(b.name));
    } else if (sortKey === 'total') {
      sorted.sort(
        (a, b) => dir * (a.total - b.total) || a.name.localeCompare(b.name)
      );
    } else if (sortKey === 'ichimon') {
      sorted.sort((a, b) => {
        const aI = getIchimon(a.name)?.name ?? '';
        const bI = getIchimon(b.name)?.name ?? '';
        return dir * aI.localeCompare(bI) || a.name.localeCompare(b.name);
      });
    } else {
      sorted.sort((a, b) => {
        const aCount = a.byRank[sortKey]?.length ?? 0;
        const bCount = b.byRank[sortKey]?.length ?? 0;
        return dir * (aCount - bCount) || a.name.localeCompare(b.name);
      });
    }

    return sorted;
  }, [heyaList, heyaSearch, rikishiSearch, sortKey, sortDir]);

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleCardSortChange = (e) => {
    const value = e.target.value;
    const lastDash = value.lastIndexOf('-');
    setSortKey(value.slice(0, lastDash));
    setSortDir(value.slice(lastDash + 1));
  };

  const cardSortValue = `${sortKey}-${sortDir}`;

  return (
    <div className={styles.dashboard}>
      <div className={styles.controls}>
        <div className={styles.searchGroup}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search heya..."
              value={heyaSearch}
              onChange={(e) => setHeyaSearch(e.target.value)}
              aria-label="Search by heya name"
            />
            {heyaSearch && (
              <button
                className={styles.clearSearch}
                onClick={() => setHeyaSearch('')}
                aria-label="Clear heya search"
              >
                ✕
              </button>
            )}
          </div>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by rikishi..."
              value={rikishiSearch}
              onChange={(e) => setRikishiSearch(e.target.value)}
              aria-label="Search by rikishi name"
            />
            {rikishiSearch && (
              <button
                className={styles.clearSearch}
                onClick={() => setRikishiSearch('')}
                aria-label="Clear rikishi search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className={styles.rightControls}>
          {layout === 'card' && (
            <select
              className={styles.sortSelect}
              value={cardSortValue}
              onChange={handleCardSortChange}
              aria-label="Sort order"
            >
              <option value="name-asc">Name ↑</option>
              <option value="name-desc">Name ↓</option>
              <option value="ichimon-asc">Ichimon ↑</option>
              <option value="ichimon-desc">Ichimon ↓</option>
              {RANK_ORDER.map((rank) => (
                <optgroup key={rank} label={rank}>
                  <option value={`${rank}-asc`}>{rank} ↑</option>
                  <option value={`${rank}-desc`}>{rank} ↓</option>
                </optgroup>
              ))}
              <option value="total-asc">Total ↑</option>
              <option value="total-desc">Total ↓</option>
            </select>
          )}

          <div className={styles.layoutToggle} role="group" aria-label="Layout">
            <button
              className={`${styles.layoutButton} ${layout === 'card' ? styles.layoutButtonActive : ''}`}
              onClick={() => setLayout('card')}
              aria-label="Card layout"
              aria-pressed={layout === 'card'}
            >
              ⊞
            </button>
            <button
              className={`${styles.layoutButton} ${layout === 'grid' ? styles.layoutButtonActive : ''}`}
              onClick={() => setLayout('grid')}
              aria-label="Grid layout"
              aria-pressed={layout === 'grid'}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {isLoading && <Loading message="Loading heya..." />}
      {error && !isLoading && <ErrorMessage error={error} />}

      {!isLoading && !error && (
        layout === 'card'
          ? <HeyaCardGrid heyaList={filteredAndSorted} />
          : (
            <HeyaGrid
              heyaList={filteredAndSorted}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
            />
          )
      )}

      <HeyaSidebar />
    </div>
  );
}

export default HeyaDashboard;
