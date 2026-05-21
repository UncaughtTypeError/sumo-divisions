import { useMemo, useState, useEffect, useCallback } from 'react';
import useDivisionStore from '../../store/divisionStore';
import { useAllDivisionsBanzuke } from '../../hooks/useAllDivisionsBanzuke';
import { useRikishiList } from '../../hooks/useRikishi';
import useBashoResults from '../../hooks/useBashoResults';
import { getCurrentBashoId } from '../../utils/bashoId';
import { RANK_ORDER, RANK_INFO, RANK_TO_API_DIVISION, RANK_COLORS } from '../../utils/constants';
import { getWrestlerAwards, computeRecordOnDay } from '../../utils/awards';
import { getPreviousBashoId, computeWrestlerRankIndicators } from '../../utils/rankMovement';
import WrestlerGrid from '../sidebar/WrestlerGrid';
import BashoSelector from '../sidebar/BashoSelector';
import MatchHistoryModal from '../modal/MatchHistoryModal';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import styles from '../sidebar/WrestlerSidebar.module.css';

function HeyaSidebar() {
  const {
    selectedHeya,
    selectedHeyaRikishiIds,
    isHeyaSidebarOpen,
    closeHeyaSidebar,
    openModal,
    setRankLookup,
    setAllWrestlers,
  } = useDivisionStore();

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentBashoId, setCurrentBashoId] = useState(getCurrentBashoId());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('rank-asc');
  const [selectedDay, setSelectedDay] = useState(0);

  const { allWrestlers: allBanzukeWrestlers, isLoading, isError } = useAllDivisionsBanzuke(
    currentBashoId,
    { enabled: isHeyaSidebarOpen }
  );

  const { data: bashoResults } = useBashoResults(currentBashoId, {
    enabled: isHeyaSidebarOpen,
  });

  // Filter banzuke wrestlers using the heya's rikishi IDs passed from the card click.
  // This avoids a circular dependency (rikishiMap needed to know heya → heya needed to fetch IDs).
  const heyaIdSet = useMemo(
    () => new Set(selectedHeyaRikishiIds),
    [selectedHeyaRikishiIds],
  );

  // Build rank lookup across ALL divisions so kinboshi calculation is accurate
  const rankLookupMap = useMemo(() => {
    const map = new Map();
    for (const w of allBanzukeWrestlers) {
      if (w.rikishiID && w.rank) map.set(w.rikishiID, w.rank);
    }
    return map;
  }, [allBanzukeWrestlers]);

  useEffect(() => {
    if (rankLookupMap.size > 0) setRankLookup(rankLookupMap);
  }, [rankLookupMap, setRankLookup]);

  // All banzuke wrestlers stored for MatchGrid opponent lookups
  useEffect(() => {
    setAllWrestlers(allBanzukeWrestlers);
  }, [allBanzukeWrestlers, setAllWrestlers]);

  // Filter banzuke wrestlers using the ID set populated when the heya card was clicked
  const heyaWrestlers = useMemo(() => {
    if (!allBanzukeWrestlers.length || !heyaIdSet.size) return [];
    return allBanzukeWrestlers.filter((w) => heyaIdSet.has(w.rikishiID));
  }, [allBanzukeWrestlers, heyaIdSet]);

  // Fetch individual rikishi records for this heya's wrestlers — no bulk-endpoint limits
  const heyaRikishiIds = useMemo(
    () => heyaWrestlers.map((w) => w.rikishiID).filter(Boolean),
    [heyaWrestlers],
  );
  const { rikishiMap, rankHistoryMap, isLoading: isRankDataLoading } = useRikishiList(heyaRikishiIds, {
    enabled: isHeyaSidebarOpen,
  });

  const previousBashoId = useMemo(() => getPreviousBashoId(currentBashoId), [currentBashoId]);

  // Group by rank, enriching with awards and rank movement indicators
  const rankGroups = useMemo(() => {
    if (!heyaWrestlers.length) return [];

    const enrichWithAwards = (w) => {
      const apiDivision = RANK_TO_API_DIVISION[w.rank?.split(' ')[0]] ?? w.rank?.split(' ')[0];
      return {
        ...w,
        awards: getWrestlerAwards(w.rikishiID, bashoResults, apiDivision),
        rankDataLoading: isRankDataLoading,
        ...computeWrestlerRankIndicators(
          w,
          rankHistoryMap.get(w.rikishiID) ?? null,
          currentBashoId,
          previousBashoId,
        ),
      };
    };

    const groups = [];
    for (const rank of RANK_ORDER) {
      const inRank = heyaWrestlers
        .filter((w) => w.rank?.startsWith(rank))
        .map(enrichWithAwards);

      if (inRank.length === 0) continue;

      const east = inRank
        .filter((w) => w.rank?.includes('East'))
        .sort((a, b) => a.rankValue - b.rankValue);
      const west = inRank
        .filter((w) => w.rank?.includes('West'))
        .sort((a, b) => a.rankValue - b.rankValue);

      groups.push({ rank, rankInfo: RANK_INFO[rank], east, west });
    }
    return groups;
  }, [heyaWrestlers, bashoResults, rankHistoryMap, currentBashoId, previousBashoId]);

  // Derive rank colour + API division from the wrestler's rank string so the
  // modal header and record-status badge render correctly for heya-view clicks.
  const handleWrestlerClick = useCallback((wrestler) => {
    const rankBase = wrestler.rank?.split(' ')[0];
    openModal(
      wrestler,
      RANK_COLORS[rankBase] ?? null,
      RANK_TO_API_DIVISION[rankBase] ?? null
    );
  }, [openModal]);

  // Highest day that has already occurred across heya wrestlers.
  const maxDay = useMemo(() => {
    if (!heyaWrestlers.length) return 0;
    return Math.max(
      0,
      ...heyaWrestlers.map((w) => {
        const records = w.record ?? [];
        return records.reduce((max, r, i) => (r.result !== '' ? i + 1 : max), 0);
      }),
    );
  }, [heyaWrestlers]);

  const filterAndSort = useCallback((wrestlers) => {
    let result = wrestlers
      .map((w) => {
        if (selectedDay > 0) {
          const dayResult = w.record?.[selectedDay - 1]?.result;
          if (!dayResult || dayResult === '') return null;
          const dayRecord = computeRecordOnDay(w.record, selectedDay);
          return { ...w, ...dayRecord, isKyujo: dayResult === 'absent' };
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

  useEffect(() => {
    if (isHeyaSidebarOpen) {
      setIsVisible(true);
      setIsClosing(false);
      setCurrentBashoId(getCurrentBashoId());
      setSearchQuery('');
      setSortOrder('rank-asc');
      setSelectedDay(0);
    }
  }, [isHeyaSidebarOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      closeHeyaSidebar();
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`${styles.sidebarOverlay} ${isClosing ? styles.closing : ''}`}
        onClick={handleClose}
      />
      <div className={`${styles.sidebar} ${isClosing ? styles.closing : ''}`}>
        <div className={styles.sidebarHeader} style={{ backgroundColor: 'var(--color-text)' }}>
          <div>
            <h2>{selectedHeya}</h2>
            <BashoSelector
              selectedBashoId={currentBashoId}
              onBashoChange={setCurrentBashoId}
              bashoResults={bashoResults}
            />
          </div>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="Close heya sidebar"
          >
            ✕
          </button>
        </div>

        <div className={styles.sidebarContent}>
          {isLoading && <Loading message="Loading heya rikishi..." />}

          {isError && !isLoading && (
            <ErrorMessage error={new Error('Failed to load banzuke data')} />
          )}

          {!isLoading && !isError && (
            <>
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

              {rankGroups.length === 0 && (
                <div className={styles.noData}>
                  <p>No rikishi found in {selectedHeya} for this basho</p>
                </div>
              )}

              <div className={styles.rankGroupsContainer}>
                {rankGroups.map((group, index) => (
                  <div key={group.rank} className={styles.rankSection}>
                    {index > 0 && <div className={styles.rankDivider} />}
                    <div className={styles.rankSectionHeader}>
                      <h3 className={styles.rankSectionTitle}>{group.rank}</h3>
                      {group.rankInfo && (
                        <span className={styles.rankSectionKanji}>
                          {group.rankInfo.nameJp}
                        </span>
                      )}
                    </div>
                    <div className={styles.gridContainer}>
                      <WrestlerGrid
                        wrestlers={filterAndSort(group.east)}
                        side="East"
                        onWrestlerClick={handleWrestlerClick}
                        color="text"
                        division={RANK_TO_API_DIVISION[group.rank]}
                        rikishiMap={rikishiMap}
                      />
                      <WrestlerGrid
                        wrestlers={filterAndSort(group.west)}
                        side="West"
                        onWrestlerClick={handleWrestlerClick}
                        color="text"
                        division={RANK_TO_API_DIVISION[group.rank]}
                        rikishiMap={rikishiMap}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <MatchHistoryModal />
    </>
  );
}

export default HeyaSidebar;
