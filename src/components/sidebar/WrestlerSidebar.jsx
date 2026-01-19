import { useMemo, useState, useEffect, useCallback } from 'react';
import useDivisionStore from '../../store/divisionStore';
import useBanzuke from '../../hooks/useBanzuke';
import useBashoResults from '../../hooks/useBashoResults';
import { getCurrentBashoId } from '../../utils/bashoId';
import { getWrestlerAwards } from '../../utils/awards';
import WrestlerGrid from './WrestlerGrid';
import BashoSelector from './BashoSelector';
import BashoWinners from './BashoWinners';
import MatchHistoryModal from '../modal/MatchHistoryModal';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import styles from './WrestlerSidebar.module.css';

function WrestlerSidebar() {
  const {
    isSidebarOpen,
    selectedRank,
    selectedApiDivision,
    selectedColor,
    closeSidebar,
    openModal,
  } = useDivisionStore();

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentBashoId, setCurrentBashoId] = useState(getCurrentBashoId());

  const { data, isLoading, error, refetch } = useBanzuke(
    currentBashoId,
    selectedApiDivision,
    {
      enabled: isSidebarOpen && !!selectedApiDivision,
    }
  );

  // Fetch basho results (yusho winners and special prizes) - cached per bashoId
  const { data: bashoResults } = useBashoResults(currentBashoId, {
    enabled: isSidebarOpen,
  });

  // All wrestlers from banzuke (for looking up full wrestler data)
  const allWrestlers = useMemo(() => {
    if (!data) return [];
    return [...(data.east || []), ...(data.west || [])];
  }, [data]);

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
        selectedApiDivision
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
      // Reset to current basho when sidebar opens
      setCurrentBashoId(getCurrentBashoId());
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
            <h2>{selectedRank}</h2>
            <BashoSelector
              selectedBashoId={currentBashoId}
              onBashoChange={handleBashoChange}
              color={selectedColor}
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

          {data && !isLoading && !error && (
            <>
              <BashoWinners
                bashoResults={enrichedBashoResults}
                selectedRank={selectedRank}
                selectedApiDivision={selectedApiDivision}
                allWrestlers={allWrestlers}
                onWrestlerClick={openModal}
              />
              <div className={styles.gridContainer}>
                <WrestlerGrid
                  wrestlers={eastWrestlers}
                  side="East"
                  onWrestlerClick={openModal}
                  color={selectedColor}
                />
                <WrestlerGrid
                  wrestlers={westWrestlers}
                  side="West"
                  onWrestlerClick={openModal}
                  color={selectedColor}
                />
              </div>
            </>
          )}

          {data &&
            !isLoading &&
            !error &&
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
