import { useState, useMemo } from 'react';
import TorikumiList from './TorikumiList';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import { useTorikumiAutoRefresh } from '../../hooks/useTorikumiAutoRefresh';
import styles from './WrestlerSidebar.module.css';

function TorikumiTab({
  torikumiData,
  isLoading,
  error,
  refetch,
  torikumiMaxDay,
  maxDay,
  day,
  onDayChange,
  currentApiDivision,
  currentColor,
  currentIsDivisionView,
  currentRank,
  wrestlerById,
  openModal,
}) {
  const [filter, setFilter] = useState('');
  const [sort,   setSort]   = useState('asc');

  const allBouts = torikumiData?.bouts ?? [];

  const filteredBouts = useMemo(() => {
    let result = allBouts;

    if (!currentIsDivisionView && currentRank) {
      result = result.filter(
        (b) => b.eastRank?.startsWith(currentRank) || b.westRank?.startsWith(currentRank),
      );
    }

    if (filter.trim()) {
      const q = filter.toLowerCase();
      result = result.filter(
        (b) =>
          b.eastShikona?.toLowerCase().includes(q) ||
          b.westShikona?.toLowerCase().includes(q),
      );
    }

    return sort === 'desc' ? [...result].reverse() : result;
  }, [allBouts, filter, sort, currentIsDivisionView, currentRank]);

  const {
    showRefreshButton,
    canRefresh,
    handleManualRefresh,
  } = useTorikumiAutoRefresh({
    bouts:     allBouts,
    day,
    maxDay,
    isLoading,
    refetch,
    enabled:   true,
  });

  return (
    <>
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Filter by rikishi..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button
              className={styles.clearSearch}
              onClick={() => setFilter('')}
              aria-label="Clear filter"
            >
              ✕
            </button>
          )}
        </div>
        <select
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort torikumi"
        >
          <option value="asc">Bout ↑</option>
          <option value="desc">Bout ↓</option>
        </select>
        {torikumiMaxDay > 0 && (
          <select
            className={styles.sortSelect}
            value={day}
            onChange={(e) => onDayChange(Number(e.target.value))}
            aria-label="Select day"
          >
            {Array.from({ length: torikumiMaxDay }, (_, i) => (
              <option key={i + 1} value={i + 1}>Day {i + 1}</option>
            ))}
          </select>
        )}
        {showRefreshButton && (
          <button
            className={styles.refreshButton}
            onClick={handleManualRefresh}
            disabled={!canRefresh}
            aria-label="Refresh torikumi results"
            title={canRefresh ? 'Refresh results' : 'Refresh unavailable'}
          >
            ↻
          </button>
        )}
      </div>

      {isLoading && <Loading message="Loading torikumi..." color={currentColor} />}
      {error && <ErrorMessage error={error} />}

      {!isLoading && !error && (
        filteredBouts.length === 0 ? (
          <div className={styles.noData}>
            <p>No bouts found for Day {day}.</p>
          </div>
        ) : (
          <TorikumiList
            bouts={filteredBouts}
            wrestlerById={wrestlerById}
            day={day}
            division={currentApiDivision}
            onWrestlerClick={openModal}
          />
        )
      )}
    </>
  );
}

export default TorikumiTab;
