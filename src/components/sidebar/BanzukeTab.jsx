import { useState, useCallback } from 'react';
import { computeRecordOnDay, isAbsentKyujo, isWithdrawn } from '../../utils/records';
import useLocalStorage from '../../hooks/useLocalStorage';
import WrestlerGrid from './WrestlerGrid';
import WrestlerCompactGrid from './WrestlerCompactGrid';
import ViewToggle from './ViewToggle';
import BashoWinners from './BashoWinners';
import YushoArasoi from './YushoArasoi';
import WinLossChart from './WinLossChart';
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
  const [viewMode, setViewMode] = useLocalStorage('sumo-banzuke-layout', 'card');

  // Applies the day filter/enrichment shared by both the card and grid views —
  // kept separate from search/sort so the grid view (which pairs east/west by
  // rank rather than listing two independent columns) can enrich each side
  // for the selected day without also risking an index misalignment from an
  // independently-applied search filter.
  const enrichForDay = useCallback((wrestlers) => {
    return wrestlers
      .map((w) => {
        if (selectedDay > 0) {
          const dayResult = w.record?.[selectedDay - 1]?.result;
          if (!dayResult || dayResult === '') return null;
          const dayRecord = computeRecordOnDay(w.record, selectedDay, currentApiDivision);
          return { ...w, ...dayRecord, isKyujo: dayResult === 'absent' && isAbsentKyujo(w.record, selectedDay, currentApiDivision) };
        }
        return { ...w, isKyujo: isWithdrawn(w.record, currentApiDivision) };
      })
      .filter(Boolean);
  }, [selectedDay, currentApiDivision]);

  const filterAndSort = useCallback((wrestlers) => {
    let result = enrichForDay(wrestlers);

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
  }, [enrichForDay, searchQuery, sortOrder]);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    // Wins sorting can't apply to a rank-paired table — fall back to rank order.
    if (mode === 'grid' && sortOrder.startsWith('wins-')) setSortOrder('rank-asc');
  }, [setViewMode, sortOrder]);

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

      <YushoArasoi
        wrestlers={allWrestlers}
        maxDay={maxDay}
        division={currentApiDivision}
        bashoResults={bashoResults}
        onWrestlerClick={openModal}
      />

      <WinLossChart
        wrestlers={allWrestlers}
        division={currentApiDivision}
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
          {viewMode === 'card' && <option value="wins-asc">Wins ↑</option>}
          {viewMode === 'card' && <option value="wins-desc">Wins ↓</option>}
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
        <ViewToggle value={viewMode} onChange={handleViewModeChange} />
      </div>

      {viewMode === 'grid' ? (
        <WrestlerCompactGrid
          rankGroups={rankGroups}
          enrichForDay={enrichForDay}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          onWrestlerClick={openModal}
          color={currentColor}
          division={currentApiDivision}
          rikishiMap={rikishiMap}
        />
      ) : (
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
      )}

      {viewMode === 'card' && !currentIsDivisionView && rankGroups[0]?.east.length === 0 && rankGroups[0]?.west.length === 0 && (
        <div className={styles.noData}>
          <p>No rikishi found for {currentRank}</p>
        </div>
      )}
    </>
  );
}

export default BanzukeTab;
