import { useState, useCallback } from 'react';
import { computeRecordOnDay, isAbsentKyujo } from '../../utils/awards';
import WrestlerGrid from './WrestlerGrid';
import BashoWinners from './BashoWinners';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import NoDataMessage from '../common/NoDataMessage';
import styles from './WrestlerSidebar.module.css';

function BanzukeTab({
  data,
  isLoading,
  error,
  refetch,
  bashoResults,
  allWrestlers,
  rankGroups,
  maxDay,
  currentRank,
  currentColor,
  currentApiDivision,
  currentIsDivisionView,
  currentBashoId,
  rikishiMap,
  openModal,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder,   setSortOrder]   = useState('rank-asc');
  const [selectedDay, setSelectedDay] = useState(0);

  const filterAndSort = useCallback((wrestlers) => {
    let result = wrestlers
      .map((w) => {
        if (selectedDay > 0) {
          const dayResult = w.record?.[selectedDay - 1]?.result;
          if (!dayResult || dayResult === '') return null;
          const dayRecord = computeRecordOnDay(w.record, selectedDay);
          return { ...w, ...dayRecord, isKyujo: dayResult === 'absent' && isAbsentKyujo(w.record, selectedDay, currentApiDivision) };
        }
        return { ...w, isKyujo: false };
      })
      .filter(Boolean);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((w) => w.shikonaEn.toLowerCase().includes(q));
    }

    const sorted = [...result];
    if (sortOrder === 'rank-asc')  return sorted.sort((a, b) => a.rankValue - b.rankValue);
    if (sortOrder === 'rank-desc') return sorted.sort((a, b) => b.rankValue - a.rankValue);
    if (sortOrder === 'wins-asc')  return sorted.sort((a, b) => a.wins - b.wins);
    if (sortOrder === 'wins-desc') return sorted.sort((a, b) => b.wins - a.wins);
    return sorted;
  }, [selectedDay, searchQuery, sortOrder]);

  if (isLoading) return <Loading message="Loading rikishi..." color={currentColor} />;
  if (error)     return <ErrorMessage error={error} onRetry={refetch} />;
  if (data?.isEmpty) return <NoDataMessage bashoId={currentBashoId} />;
  if (!data)     return null;

  return (
    <>
      <BashoWinners
        bashoResults={bashoResults}
        selectedRank={currentRank}
        selectedApiDivision={currentApiDivision}
        allWrestlers={allWrestlers}
        onWrestlerClick={openModal}
      />

      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search rikishi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <select
          className={styles.sortSelect}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          aria-label="Sort order"
        >
          <option value="rank-asc">Rank ↑</option>
          <option value="rank-desc">Rank ↓</option>
          <option value="wins-asc">Wins ↑</option>
          <option value="wins-desc">Wins ↓</option>
        </select>
        {maxDay > 0 && (
          <select
            className={styles.sortSelect}
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            aria-label="Filter by day"
          >
            <option value={0}>Any day</option>
            {Array.from({ length: maxDay }, (_, i) => (
              <option key={i + 1} value={i + 1}>Day {i + 1}</option>
            ))}
          </select>
        )}
      </div>

      <div className={currentIsDivisionView ? styles.rankGroupsContainer : undefined}>
        {rankGroups.map((group, index) => (
          <div key={group.rank} className={currentIsDivisionView ? styles.rankSection : undefined}>
            {currentIsDivisionView && index > 0 && <div className={styles.rankDivider} />}
            {currentIsDivisionView && (
              <div className={styles.rankSectionHeader}>
                <h3 className={styles.rankSectionTitle}>{group.rank}</h3>
                {group.rankInfo && (
                  <span className={styles.rankSectionKanji}>{group.rankInfo.nameJp}</span>
                )}
              </div>
            )}
            <div className={styles.gridContainer}>
              <WrestlerGrid
                wrestlers={filterAndSort(group.east)}
                side="East"
                onWrestlerClick={openModal}
                color={currentColor}
                division={currentApiDivision}
                rikishiMap={rikishiMap}
              />
              <WrestlerGrid
                wrestlers={filterAndSort(group.west)}
                side="West"
                onWrestlerClick={openModal}
                color={currentColor}
                division={currentApiDivision}
                rikishiMap={rikishiMap}
              />
            </div>
          </div>
        ))}
      </div>

      {!currentIsDivisionView && rankGroups[0]?.east.length === 0 && rankGroups[0]?.west.length === 0 && (
        <div className={styles.noData}>
          <p>No rikishi found for {currentRank}</p>
        </div>
      )}
    </>
  );
}

export default BanzukeTab;
