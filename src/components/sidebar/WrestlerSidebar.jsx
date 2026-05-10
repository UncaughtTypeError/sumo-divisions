import { useMemo, useState, useEffect } from 'react';
import useDivisionStore from '../../store/divisionStore';
import useBanzuke from '../../hooks/useBanzuke';
import useBashoResults from '../../hooks/useBashoResults';
import { useAllRikishi } from '../../hooks/useRikishi';
import { getCurrentBashoId } from '../../utils/bashoId';
import { RANKS, RANK_INFO, DIVISION_INFO } from '../../utils/constants';
import { getWrestlerAwards, buildRankLookup } from '../../utils/awards';
import WrestlerGrid from './WrestlerGrid';
import BashoSelector from './BashoSelector';
import BashoWinners from './BashoWinners';
import MatchHistoryModal from '../modal/MatchHistoryModal';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import NoDataMessage from '../common/NoDataMessage';
import styles from './WrestlerSidebar.module.css';

// Rank order within Makuuchi division (top to bottom)
const MAKUUCHI_RANK_ORDER = [
  RANKS.YOKOZUNA,
  RANKS.OZEKI,
  RANKS.SEKIWAKE,
  RANKS.KOMUSUBI,
  RANKS.MAEGASHIRA,
];

function WrestlerSidebar() {
  const {
    isSidebarOpen,
    isDivisionView,
    selectedRank,
    selectedDivision,
    selectedApiDivision,
    selectedColor,
    closeSidebar,
    openModal,
    setRankLookup,
    setAllWrestlers,
  } = useDivisionStore();

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentBashoId, setCurrentBashoId] = useState(getCurrentBashoId());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('rank-asc');

  const { data, isLoading, error, refetch } = useBanzuke(
    currentBashoId,
    selectedApiDivision,
    {
      enabled: isSidebarOpen && !!selectedApiDivision,
    },
  );

  // Fetch basho results (yusho winners and special prizes) - cached per bashoId
  const { data: bashoResults } = useBashoResults(currentBashoId, {
    enabled: isSidebarOpen,
  });

  // Fetch all rikishi data for heya and shusshin lookup (single API call)
  const { rikishiMap } = useAllRikishi({
    enabled: isSidebarOpen,
  });

  // All wrestlers from banzuke (for looking up full wrestler data)
  const allWrestlers = useMemo(() => {
    if (!data) return [];
    return [...(data.east || []), ...(data.west || [])];
  }, [data]);

  // Build and set rank lookup when data changes
  useEffect(() => {
    if (data) {
      const lookup = buildRankLookup(data.east, data.west);
      setRankLookup(lookup);
    }
  }, [data, setRankLookup]);

  // Sync all wrestlers into the store for opponent lookups in MatchGrid
  useEffect(() => {
    setAllWrestlers(allWrestlers);
  }, [allWrestlers, setAllWrestlers]);

  // Enrich basho results with rank data from banzuke
  const enrichedBashoResults = useMemo(() => {
    if (!bashoResults || !data) return bashoResults;

    const findRank = (rikishiId) => {
      const wrestler = allWrestlers.find((w) => w.rikishiID === rikishiId);
      return wrestler?.rank || null;
    };

    return {
      ...bashoResults,
      yusho: bashoResults.yusho?.map((winner) => ({ ...winner, rank: findRank(winner.rikishiId) })),
      specialPrizes: bashoResults.specialPrizes?.map((prize) => ({ ...prize, rank: findRank(prize.rikishiId) })),
    };
  }, [bashoResults, data, allWrestlers]);

  // Unified rank groups: multiple groups for division view, one group for single-rank view
  const rankGroups = useMemo(() => {
    if (!data || data.isEmpty) return [];

    const enrichWithAwards = (wrestler) => ({
      ...wrestler,
      awards: getWrestlerAwards(wrestler.rikishiID, bashoResults, selectedApiDivision),
    });
    const sortByRank = (a, b) => a.rankValue - b.rankValue;
    const buildGroup = (rank) => ({
      rank,
      rankInfo: RANK_INFO[rank],
      east: (data.east?.filter((w) => w.rank.startsWith(rank)).map(enrichWithAwards) || []).sort(sortByRank),
      west: (data.west?.filter((w) => w.rank.startsWith(rank)).map(enrichWithAwards) || []).sort(sortByRank),
    });

    return isDivisionView
      ? MAKUUCHI_RANK_ORDER.map(buildGroup)
      : [buildGroup(selectedRank)];
  }, [isDivisionView, data, selectedRank, bashoResults, selectedApiDivision]);

  // Filter by search and apply sort order
  const filterAndSort = (wrestlers) => {
    let result = wrestlers;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = wrestlers.filter((w) => w.shikonaEn.toLowerCase().includes(query));
    }
    const sorted = [...result];
    if (sortOrder === 'rank-asc') return sorted.sort((a, b) => a.rankValue - b.rankValue);
    if (sortOrder === 'rank-desc') return sorted.sort((a, b) => b.rankValue - a.rankValue);
    if (sortOrder === 'wins-asc') return sorted.sort((a, b) => a.wins - b.wins);
    if (sortOrder === 'wins-desc') return sorted.sort((a, b) => b.wins - a.wins);
    return sorted;
  };

  useEffect(() => {
    if (isSidebarOpen) {
      setIsVisible(true);
      setIsClosing(false);
      setCurrentBashoId(getCurrentBashoId());
      setSearchQuery('');
      setSortOrder('rank-asc');
    }
  }, [isSidebarOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      closeSidebar();
    }, 150);
  };

  if (!isVisible) {
    return null;
  }

  const headerLabel = isDivisionView ? selectedDivision : selectedRank;
  const headerInfo = isDivisionView ? DIVISION_INFO[selectedDivision] : RANK_INFO[selectedRank];

  return (
    <>
      <div
        className={`${styles.sidebarOverlay} ${isClosing ? styles.closing : ''}`}
        onClick={handleClose}
      />
      <div className={`${styles.sidebar} ${isClosing ? styles.closing : ''}`}>
        {/* Header */}
        <div
          className={styles.sidebarHeader}
          style={{ backgroundColor: `var(--color-${selectedColor})` }}
        >
          <div>
            <h2>
              {headerLabel}
              {headerInfo && (
                <span className={styles.rankKanji}>{headerInfo.nameJp}</span>
              )}
            </h2>
            <BashoSelector
              selectedBashoId={currentBashoId}
              onBashoChange={setCurrentBashoId}
              color={selectedColor}
              bashoResults={bashoResults}
            />
          </div>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.sidebarContent}>
          {isLoading && (
            <Loading message="Loading rikishi..." color={selectedColor} />
          )}

          {error && <ErrorMessage error={error} onRetry={refetch} />}

          {data && !isLoading && !error && data.isEmpty && (
            <NoDataMessage bashoId={currentBashoId} />
          )}

          {data && !isLoading && !error && !data.isEmpty && (
            <>
              <BashoWinners
                bashoResults={enrichedBashoResults}
                selectedRank={selectedRank}
                selectedApiDivision={selectedApiDivision}
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
              </div>
              <div className={isDivisionView ? styles.rankGroupsContainer : undefined}>
                {rankGroups.map((group, index) => (
                  <div key={group.rank} className={isDivisionView ? styles.rankSection : undefined}>
                    {isDivisionView && index > 0 && <div className={styles.rankDivider} />}
                    {isDivisionView && (
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
                        color={selectedColor}
                        division={selectedApiDivision}
                        rikishiMap={rikishiMap}
                      />
                      <WrestlerGrid
                        wrestlers={filterAndSort(group.west)}
                        side="West"
                        onWrestlerClick={openModal}
                        color={selectedColor}
                        division={selectedApiDivision}
                        rikishiMap={rikishiMap}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {!isDivisionView && rankGroups[0]?.east.length === 0 && rankGroups[0]?.west.length === 0 && (
                <div className={styles.noData}>
                  <p>No rikishi found for {selectedRank}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <MatchHistoryModal />
    </>
  );
}

export default WrestlerSidebar;
