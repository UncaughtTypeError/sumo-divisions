import { useState, useMemo, useEffect, useRef } from 'react';
import TorikumiList from './TorikumiList';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import { useTorikumiAutoRefresh } from '../../hooks/useTorikumiAutoRefresh';
import styles from './WrestlerSidebar.module.css';

const MIN_REFRESH_DISPLAY_MS = 1500;

function TorikumiTab({
  torikumiData,
  isLoading,
  isFetching,
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

  // ── Min-display refresh loader ──────────────────────────────────────────────
  // isFetching covers both initial loads and refetches.
  // During a refetch (data already present) we enforce a minimum display time
  // so the indicator is always visible long enough for the user to notice.
  const [showRefreshLoader, setShowRefreshLoader] = useState(false);
  const loaderStartRef = useRef(null);
  const loaderTimerRef = useRef(null);

  const isRefetch = isFetching && !!torikumiData;

  useEffect(() => {
    if (isRefetch) {
      setShowRefreshLoader(true);
      loaderStartRef.current = Date.now();
      clearTimeout(loaderTimerRef.current);
    } else if (showRefreshLoader) {
      const elapsed  = Date.now() - (loaderStartRef.current ?? 0);
      const remaining = Math.max(0, MIN_REFRESH_DISPLAY_MS - elapsed);
      loaderTimerRef.current = setTimeout(() => setShowRefreshLoader(false), remaining);
    }
    return () => clearTimeout(loaderTimerRef.current);
  }, [isRefetch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(loaderTimerRef.current), []);

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

  // Pass isFetching as isLoading so canRefresh is false during any in-flight request
  const {
    showRefreshButton,
    canRefresh,
    handleManualRefresh,
  } = useTorikumiAutoRefresh({
    bouts:     allBouts,
    day,
    maxDay,
    isLoading: isFetching,
    refetch,
    enabled:   true,
  });

  const showLoader = isLoading || showRefreshLoader;

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

      {showLoader && (
        <Loading
          message={isLoading ? 'Loading torikumi...' : 'Refreshing results...'}
          color={currentColor}
        />
      )}
      {error && !showLoader && <ErrorMessage error={error} />}

      {!showLoader && !error && (
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
