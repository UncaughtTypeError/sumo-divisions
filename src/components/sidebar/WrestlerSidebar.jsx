import { useMemo, useState, useEffect, useCallback } from 'react';
import useDivisionStore from '../../store/divisionStore';
import useBanzuke from '../../hooks/useBanzuke';
import useBashoResults from '../../hooks/useBashoResults';
import useTorikumi from '../../hooks/useTorikumi';
import { useRikishiList } from '../../hooks/useRikishi';
import { getCurrentBashoId } from '../../utils/bashoId';
import { RANKS, RANK_INFO, SIDEBAR_VIEWS } from '../../utils/constants';
import { getWrestlerAwards, buildRankLookup } from '../../utils/awards';
import { getPreviousBashoId, computeWrestlerRankIndicators } from '../../utils/rankMovement';
import BanzukeTab from './BanzukeTab';
import TorikumiTab from './TorikumiTab';
import BashoSelector from './BashoSelector';
import MatchHistoryModal from '../modal/MatchHistoryModal';
import styles from './WrestlerSidebar.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAKUUCHI_RANK_ORDER = [
  RANKS.YOKOZUNA,
  RANKS.OZEKI,
  RANKS.SEKIWAKE,
  RANKS.KOMUSUBI,
  RANKS.MAEGASHIRA,
];

// Maps each division to the one directly below it for cross-division bout lookups
const ADJACENT_LOWER = {
  Makuuchi:  'Juryo',
  Juryo:     'Makushita',
  Makushita: 'Sandanme',
  Sandanme:  'Jonidan',
  Jonidan:   'Jonokuchi',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findMatchingView(apiDivision, rank, isDivisionView) {
  return SIDEBAR_VIEWS.find((v) => {
    if (isDivisionView) return v.isDivisionView && v.apiDivision === apiDivision;
    return !v.isDivisionView && v.rank === rank;
  }) ?? SIDEBAR_VIEWS[0];
}

// ─── Main component ───────────────────────────────────────────────────────────

function WrestlerSidebar() {
  const {
    isSidebarOpen,
    isDivisionView,
    selectedRank,
    selectedApiDivision,
    closeSidebar,
    openModal,
    setRankLookup,
    setAllWrestlers,
  } = useDivisionStore();

  // ── Animation ─────────────────────────────────────────────────────────────
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // ── Navigation ────────────────────────────────────────────────────────────
  const [currentBashoId, setCurrentBashoId] = useState(getCurrentBashoId());
  const [activeView,     setActiveView]      = useState(() => SIDEBAR_VIEWS[0]);
  const [activeTab,      setActiveTab]       = useState('banzuke');

  // Incrementing this forces BanzukeTab / TorikumiTab to remount,
  // resetting their internal UI state (search, sort, day filter, etc.)
  const [sessionId, setSessionId] = useState(0);
  const bumpSession = useCallback(() => setSessionId((n) => n + 1), []);

  // Torikumi day stays here because useTorikumi is called at this level
  const [torikumiDay, setTorikumiDay] = useState(0);

  const currentApiDivision    = activeView.apiDivision;
  const currentColor          = activeView.color;
  const currentIsDivisionView = activeView.isDivisionView;
  const currentRank           = activeView.rank;

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data, isLoading, error, refetch } = useBanzuke(currentBashoId, currentApiDivision, {
    enabled: isSidebarOpen && !!currentApiDivision,
  });

  // Also fetch the adjacent lower division so cross-division bouts can show records
  const adjacentDivision = ADJACENT_LOWER[currentApiDivision] ?? null;
  const { data: adjacentData } = useBanzuke(currentBashoId, adjacentDivision, {
    enabled: isSidebarOpen && !!adjacentDivision,
  });

  const { data: bashoResults } = useBashoResults(currentBashoId, {
    enabled: isSidebarOpen,
  });

  // ── Derived wrestlers ─────────────────────────────────────────────────────
  const allWrestlers = useMemo(() => {
    if (!data) return [];
    return [...(data.east || []), ...(data.west || [])];
  }, [data]);

  const adjacentWrestlers = useMemo(() => {
    if (!adjacentData) return [];
    return [...(adjacentData.east || []), ...(adjacentData.west || [])];
  }, [adjacentData]);

  const rikishiIds = useMemo(
    () => allWrestlers.map((w) => w.rikishiID).filter(Boolean),
    [allWrestlers],
  );
  const { rikishiMap, rankHistoryMap, isLoading: isRankDataLoading } = useRikishiList(rikishiIds, {
    enabled: isSidebarOpen,
  });

  // ── Store sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (data) setRankLookup(buildRankLookup(data.east, data.west));
  }, [data, setRankLookup]);

  useEffect(() => {
    setAllWrestlers(allWrestlers);
  }, [allWrestlers, setAllWrestlers]);

  // ── Max competed day ──────────────────────────────────────────────────────
  const maxDay = useMemo(() => {
    if (!allWrestlers.length) return 0;
    return Math.max(
      0,
      ...allWrestlers.map((w) => {
        const records = w.record ?? [];
        return records.reduce((max, r, i) => (r.result !== '' ? i + 1 : max), 0);
      }),
    );
  }, [allWrestlers]);

  // Torikumi can show one day beyond the last completed day (scheduled bouts)
  const divisionMaxDays = ['Makuuchi', 'Juryo'].includes(currentApiDivision) ? 15 : 7;
  const torikumiMaxDay  = Math.min(maxDay + 1, divisionMaxDays);

  // Default torikumi day to maxDay once data arrives
  useEffect(() => {
    if (maxDay > 0 && torikumiDay === 0) setTorikumiDay(maxDay);
  }, [maxDay, torikumiDay]);

  // Reset torikumi day when division or basho changes
  useEffect(() => {
    setTorikumiDay(0);
  }, [currentApiDivision, currentBashoId]);

  // ── Torikumi fetch ────────────────────────────────────────────────────────
  const effectiveTorikumiDay = torikumiDay || maxDay;
  const {
    data:      torikumiData,
    isLoading: isTorikumiLoading,
    error:     torikumiError,
    refetch:   refetchTorikumi,
  } = useTorikumi(
    currentBashoId,
    currentApiDivision,
    effectiveTorikumiDay,
    { enabled: isSidebarOpen && activeTab === 'torikumi' && effectiveTorikumiDay > 0 },
  );

  // ── Wrestler lookup (falls back to adjacent division) ─────────────────────
  const wrestlerById = useCallback(
    (id) =>
      allWrestlers.find((w) => w.rikishiID === id) ??
      adjacentWrestlers.find((w) => w.rikishiID === id),
    [allWrestlers, adjacentWrestlers],
  );

  // ── Basho results enrichment ──────────────────────────────────────────────
  const enrichedBashoResults = useMemo(() => {
    if (!bashoResults || !data) return bashoResults;
    const findRank = (id) => allWrestlers.find((w) => w.rikishiID === id)?.rank ?? null;
    return {
      ...bashoResults,
      yusho:         bashoResults.yusho?.map((w) => ({ ...w, rank: findRank(w.rikishiId) })),
      specialPrizes: bashoResults.specialPrizes?.map((p) => ({ ...p, rank: findRank(p.rikishiId) })),
    };
  }, [bashoResults, data, allWrestlers]);

  const previousBashoId = useMemo(() => getPreviousBashoId(currentBashoId), [currentBashoId]);

  // ── Rank groups (banzuke tab) ─────────────────────────────────────────────
  const rankGroups = useMemo(() => {
    if (!data || data.isEmpty) return [];

    const enrich = (wrestler) => ({
      ...wrestler,
      awards: getWrestlerAwards(wrestler.rikishiID, bashoResults, currentApiDivision),
      rankDataLoading: isRankDataLoading,
      ...computeWrestlerRankIndicators(
        wrestler,
        rankHistoryMap.get(wrestler.rikishiID) ?? null,
        currentBashoId,
        previousBashoId,
      ),
    });
    const sortByRank = (a, b) => a.rankValue - b.rankValue;
    const buildGroup = (rank) => ({
      rank,
      rankInfo: RANK_INFO[rank],
      east: (data.east?.filter((w) => w.rank.startsWith(rank)).map(enrich) || []).sort(sortByRank),
      west: (data.west?.filter((w) => w.rank.startsWith(rank)).map(enrich) || []).sort(sortByRank),
    });

    return currentIsDivisionView
      ? MAKUUCHI_RANK_ORDER.map(buildGroup)
      : [buildGroup(currentRank)];
  }, [
    currentIsDivisionView, data, currentRank, bashoResults, currentApiDivision,
    rankHistoryMap, currentBashoId, previousBashoId, isRankDataLoading,
  ]);

  // ── Open / close lifecycle ─────────────────────────────────────────────────
  useEffect(() => {
    if (isSidebarOpen) {
      setIsVisible(true);
      setIsClosing(false);
      setCurrentBashoId(getCurrentBashoId());
      setActiveView(findMatchingView(selectedApiDivision, selectedRank, isDivisionView));
      setActiveTab('banzuke');
      setTorikumiDay(0);
      bumpSession();
    }
  }, [isSidebarOpen, selectedApiDivision, selectedRank, isDivisionView, bumpSession]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsVisible(false); closeSidebar(); }, 150);
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`${styles.sidebarOverlay} ${isClosing ? styles.closing : ''}`}
        onClick={handleClose}
      />
      <div className={`${styles.sidebar} ${isClosing ? styles.closing : ''}`}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          className={styles.sidebarHeader}
          style={{ backgroundColor: `var(--color-${currentColor})` }}
        >
          <div className={styles.headerMain}>
            <div className={styles.divisionSelectorRow}>
              <select
                className={styles.divisionSelect}
                value={activeView.value}
                onChange={(e) => {
                  const view = SIDEBAR_VIEWS.find((v) => v.value === e.target.value);
                  if (view) { setActiveView(view); setTorikumiDay(0); bumpSession(); }
                }}
                aria-label="Select division or rank"
              >
                {SIDEBAR_VIEWS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}  {v.nameJp}
                  </option>
                ))}
              </select>
            </div>

            <BashoSelector
              selectedBashoId={currentBashoId}
              onBashoChange={(id) => { setCurrentBashoId(id); setTorikumiDay(0); bumpSession(); }}
              color={currentColor}
              bashoResults={bashoResults}
            />
          </div>

          <button onClick={handleClose} className={styles.closeButton} aria-label="Close sidebar">
            ✕
          </button>
        </div>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${activeTab === 'banzuke' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('banzuke')}
          >
            Banzuke
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'torikumi' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('torikumi')}
          >
            Torikumi
          </button>
        </div>

        {/* ── Tab content ─────────────────────────────────────────────────── */}
        <div className={styles.sidebarContent}>
          {activeTab === 'banzuke' && (
            <BanzukeTab
              key={sessionId}
              data={data}
              isLoading={isLoading}
              error={error}
              refetch={refetch}
              bashoResults={enrichedBashoResults}
              allWrestlers={allWrestlers}
              rankGroups={rankGroups}
              maxDay={maxDay}
              currentRank={currentRank}
              currentColor={currentColor}
              currentApiDivision={currentApiDivision}
              currentIsDivisionView={currentIsDivisionView}
              currentBashoId={currentBashoId}
              rikishiMap={rikishiMap}
              openModal={openModal}
            />
          )}
          {activeTab === 'torikumi' && (
            <TorikumiTab
              key={sessionId}
              torikumiData={torikumiData}
              isLoading={isTorikumiLoading}
              error={torikumiError}
              refetch={refetchTorikumi}
              torikumiMaxDay={torikumiMaxDay}
              maxDay={maxDay}
              day={effectiveTorikumiDay}
              onDayChange={setTorikumiDay}
              currentApiDivision={currentApiDivision}
              currentColor={currentColor}
              currentIsDivisionView={currentIsDivisionView}
              currentRank={currentRank}
              wrestlerById={wrestlerById}
              openModal={openModal}
            />
          )}
        </div>
      </div>

      <MatchHistoryModal />
    </>
  );
}

export default WrestlerSidebar;
