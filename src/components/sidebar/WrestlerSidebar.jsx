import { useMemo, useState, useEffect } from 'react';
import useDivisionStore from '../../store/divisionStore';
import useBanzuke from '../../hooks/useBanzuke';
import useBashoResults from '../../hooks/useBashoResults';
import { useAllRikishi } from '../../hooks/useRikishi';
import { getCurrentBashoId } from '../../utils/bashoId';
import { RANK_INFO } from '../../utils/constants';
import { getWrestlerAwards, buildRankLookup } from '../../utils/awards';
import WrestlerGrid from './WrestlerGrid';
import BashoSelector from './BashoSelector';
import BashoWinners from './BashoWinners';
import MatchHistoryModal from '../modal/MatchHistoryModal';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import NoDataMessage from '../common/NoDataMessage';
import styles from './WrestlerSidebar.module.css';

function WrestlerSidebar() {
  const {
    isSidebarOpen,
    selectedRank,
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

    // Helper to find wrestler rank by rikishiId
    const findRank = (rikishiId) => {
      const wrestler = allWrestlers.find((w) => w.rikishiID === rikishiId);
      return wrestler?.rank || null;
    };

    // Enrich yusho winners with ranks
    const enrichedYusho = bashoResults.yusho?.map((winner) => ({
      ...winner,
      rank: findRank(winner.rikishiId),
    }));

    // Enrich special prize winners with ranks
    const enrichedSpecialPrizes = bashoResults.specialPrizes?.map((prize) => ({
      ...prize,
      rank: findRank(prize.rikishiId),
    }));

    return {
      ...bashoResults,
      yusho: enrichedYusho,
      specialPrizes: enrichedSpecialPrizes,
    };
  }, [bashoResults, data, allWrestlers]);

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

  // Filter wrestlers by selected rank and enrich with awards
  const { eastWrestlers, westWrestlers } = useMemo(() => {
    if (!data || !selectedRank) {
      return { eastWrestlers: [], westWrestlers: [] };
    }

    // Filter function: check if wrestler's rank starts with selected rank
    const filterByRank = (wrestler) => {
      return wrestler.rank.startsWith(selectedRank);
    };

    // Enrich wrestler with awards
    const enrichWithAwards = (wrestler) => ({
      ...wrestler,
      awards: getWrestlerAwards(
        wrestler.rikishiID,
        bashoResults,
        selectedApiDivision,
      ),
    });

    const east = data.east?.filter(filterByRank).map(enrichWithAwards) || [];
    const west = data.west?.filter(filterByRank).map(enrichWithAwards) || [];

    // Sort by rankValue (lower is better)
    const sortByRank = (a, b) => a.rankValue - b.rankValue;

    return {
      eastWrestlers: east.sort(sortByRank),
      westWrestlers: west.sort(sortByRank),
    };
  }, [data, selectedRank, bashoResults, selectedApiDivision]);

  useEffect(() => {
    if (isSidebarOpen) {
      setIsVisible(true);
      setIsClosing(false);
      // Reset to current basho and clear search when sidebar opens
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
    }, 150); // Match the animation duration
  };

  const handleBashoChange = (newBashoId) => {
    setCurrentBashoId(newBashoId);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div
        className={`${styles.sidebarOverlay} ${
          isClosing ? styles.closing : ''
        }`}
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
              {selectedRank}
              {RANK_INFO[selectedRank] && (
                <span className={styles.rankKanji}>
                  {RANK_INFO[selectedRank].nameJp}
                </span>
              )}
            </h2>
            <BashoSelector
              selectedBashoId={currentBashoId}
              onBashoChange={handleBashoChange}
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
              <div className={styles.gridContainer}>
                <WrestlerGrid
                  wrestlers={filterAndSort(eastWrestlers)}
                  side="East"
                  onWrestlerClick={openModal}
                  color={selectedColor}
                  division={selectedApiDivision}
                  rikishiMap={rikishiMap}
                />
                <WrestlerGrid
                  wrestlers={filterAndSort(westWrestlers)}
                  side="West"
                  onWrestlerClick={openModal}
                  color={selectedColor}
                  division={selectedApiDivision}
                  rikishiMap={rikishiMap}
                />
              </div>
            </>
          )}

          {data &&
            !isLoading &&
            !error &&
            !data.isEmpty &&
            eastWrestlers.length === 0 &&
            westWrestlers.length === 0 && (
              <div className={styles.noData}>
                <p>No rikishi found for {selectedRank}</p>
              </div>
            )}
        </div>
      </div>

      {/* Modal */}
      <MatchHistoryModal />
    </>
  );
}

export default WrestlerSidebar;
