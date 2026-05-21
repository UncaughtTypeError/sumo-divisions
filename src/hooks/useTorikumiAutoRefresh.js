import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Exported constants (imported by tests) ───────────────────────────────────

export const COOLDOWN_MS           = 60_000;
export const NORMAL_INTERVAL_MS    = 180_000;
export const BACKOFF_INTERVALS_MS  = [300_000, 600_000, 900_000, 1_200_000, 1_500_000];
export const CONSECUTIVE_THRESHOLD = 3;
export const BACKOFF_MAX_ATTEMPTS  = 5;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manages auto-refresh and manual refresh for the torikumi tab.
 *
 * @param {object}   opts
 * @param {Array}    opts.bouts       - Current bout objects (checked for pending results)
 * @param {number}   opts.day         - Currently selected tournament day
 * @param {number}   opts.maxDay      - Highest day with any completed result
 * @param {boolean}  opts.isLoading   - Whether a fetch is currently in-flight
 * @param {Function} opts.refetch     - React Query refetch callback
 * @param {boolean}  opts.enabled     - Master enable flag (e.g. tab is visible)
 *
 * @returns {{
 *   showRefreshButton: boolean,
 *   canRefresh:        boolean,
 *   isRefreshing:      boolean,
 *   handleManualRefresh: () => void,
 *   autoRefreshPhase: 'active' | 'backoff' | 'stopped',
 * }}
 */
export function useTorikumiAutoRefresh({
  bouts     = [],
  day,
  maxDay,
  isLoading,
  refetch,
  enabled   = true,
}) {
  // Show the button only on the latest (or next-scheduled) day that still has pending bouts
  const isLatestDay     = maxDay > 0 && day >= maxDay;
  const hasPendingBouts = bouts.length > 0 && bouts.some((b) => b.winnerId === null);
  const showRefreshButton = isLatestDay && hasPendingBouts;

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isInCooldown,         setIsInCooldown]         = useState(false);
  const [autoRefreshPhase,     setAutoRefreshPhase]     = useState('active');
  const [consecutiveNoResults, setConsecutiveNoResults] = useState(0);
  const [backoffAttempts,      setBackoffAttempts]      = useState(0);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const cooldownTimerRef           = useRef(null);
  const isWaitingForAutoRefreshRef = useRef(false);
  const preRefreshCompletedRef     = useRef(0);       // completed bouts before auto-refetch
  const prevIsLoadingRef           = useRef(false);   // to detect isLoading transitions

  // Keep current values accessible inside effects without adding them to deps
  const autoRefreshPhaseRef     = useRef(autoRefreshPhase);
  const consecutiveNoResultsRef = useRef(consecutiveNoResults);
  const backoffAttemptsRef      = useRef(backoffAttempts);
  const boutsDoneCountRef       = useRef(0);

  useEffect(() => { autoRefreshPhaseRef.current     = autoRefreshPhase     }, [autoRefreshPhase]);
  useEffect(() => { consecutiveNoResultsRef.current = consecutiveNoResults }, [consecutiveNoResults]);
  useEffect(() => { backoffAttemptsRef.current      = backoffAttempts      }, [backoffAttempts]);

  // Keep a live count of completed bouts
  const completedCount = bouts.filter((b) => b.winnerId !== null).length;
  useEffect(() => { boutsDoneCountRef.current = completedCount }, [completedCount]);

  // ── Detect auto-refresh completion ─────────────────────────────────────────
  useEffect(() => {
    const wasLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    if (!isLoading && wasLoading && isWaitingForAutoRefreshRef.current) {
      isWaitingForAutoRefreshRef.current = false;
      const hadNewResults = boutsDoneCountRef.current > preRefreshCompletedRef.current;
      preRefreshCompletedRef.current = boutsDoneCountRef.current;

      if (hadNewResults) {
        setConsecutiveNoResults(0);
        if (autoRefreshPhaseRef.current === 'backoff') {
          setAutoRefreshPhase('active');
          setBackoffAttempts(0);
        }
      } else {
        if (autoRefreshPhaseRef.current === 'active') {
          const next = consecutiveNoResultsRef.current + 1;
          if (next >= CONSECUTIVE_THRESHOLD) {
            setAutoRefreshPhase('backoff');
            setBackoffAttempts(0);
            setConsecutiveNoResults(0);
          } else {
            setConsecutiveNoResults(next);
          }
        } else if (autoRefreshPhaseRef.current === 'backoff') {
          const next = backoffAttemptsRef.current + 1;
          if (next >= BACKOFF_MAX_ATTEMPTS) {
            setAutoRefreshPhase('stopped');
          } else {
            setBackoffAttempts(next);
          }
        }
      }
    } else if (!isLoading && !wasLoading) {
      // Not inside a load cycle — keep baseline in sync
      preRefreshCompletedRef.current = boutsDoneCountRef.current;
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-refresh interval ──────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !showRefreshButton || autoRefreshPhase === 'stopped') return;

    const intervalMs =
      autoRefreshPhase === 'active'
        ? NORMAL_INTERVAL_MS
        : BACKOFF_INTERVALS_MS[Math.min(backoffAttempts, BACKOFF_INTERVALS_MS.length - 1)];

    const timer = setInterval(() => {
      // Re-read refs so the closure always uses fresh values
      if (!isLoading && !isInCooldown) {
        preRefreshCompletedRef.current     = boutsDoneCountRef.current;
        isWaitingForAutoRefreshRef.current = true;
        refetch({ cancelRefetch: false });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [enabled, showRefreshButton, autoRefreshPhase, backoffAttempts, isLoading, isInCooldown, refetch]);

  // ── Manual refresh ─────────────────────────────────────────────────────────
  const handleManualRefresh = useCallback(() => {
    refetch({ cancelRefetch: false });

    setIsInCooldown(true);
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => setIsInCooldown(false), COOLDOWN_MS);

    // Only re-enable auto-refresh once it has been fully stopped (not during back-off)
    if (autoRefreshPhaseRef.current === 'stopped') {
      setAutoRefreshPhase('active');
      setConsecutiveNoResults(0);
      setBackoffAttempts(0);
    }
  }, [refetch]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
  }, []);

  return {
    showRefreshButton,
    canRefresh:          !isLoading && !isInCooldown,
    isRefreshing:        isLoading,
    handleManualRefresh,
    autoRefreshPhase,
  };
}

export default useTorikumiAutoRefresh;
