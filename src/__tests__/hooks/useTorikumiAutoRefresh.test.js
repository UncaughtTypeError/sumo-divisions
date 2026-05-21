/**
 * TDD suite for useTorikumiAutoRefresh.
 *
 * Hook signature:
 *   useTorikumiAutoRefresh({ bouts, day, maxDay, isLoading, refetch, enabled })
 *
 * Returns:
 *   { showRefreshButton, canRefresh, isRefreshing, handleManualRefresh, autoRefreshPhase }
 *
 * Constants (exported from the hook module so tests can import them):
 *   COOLDOWN_MS            60 000   ms  button disabled after click
 *   NORMAL_INTERVAL_MS    180 000   ms  auto-refresh period (3 min)
 *   BACKOFF_INTERVALS_MS  [300k, 600k, 900k, 1200k, 1500k] ms (5–25 min)
 *   CONSECUTIVE_THRESHOLD       3   no-result auto-refreshes before back-off
 *   BACKOFF_MAX_ATTEMPTS        5   back-off attempts before stopping
 */

import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  useTorikumiAutoRefresh,
  COOLDOWN_MS,
  NORMAL_INTERVAL_MS,
  BACKOFF_INTERVALS_MS,
  CONSECUTIVE_THRESHOLD,
  BACKOFF_MAX_ATTEMPTS,
} from '../../hooks/useTorikumiAutoRefresh'

// ─── Helpers ─────────────────────────────────────────────────────────────────

// API returns winnerId: 0 (not null) for unplayed bouts
const pendingBout  = { matchNo: 1, eastId: 1, westId: 2, winnerId: 0 }
const done = (n)   => ({ matchNo: n, eastId: 1, westId: 2, winnerId: 10 })

const makeProps = (overrides = {}) => ({
  bouts:     [pendingBout],
  day:       5,
  maxDay:    5,
  isLoading: false,
  refetch:   vi.fn(),
  enabled:   true,
  ...overrides,
})

// Simulate: timer fires → refetch starts → completes with no new results
function simulateAutoRefreshNoResults(rerender, props) {
  act(() => { vi.runOnlyPendingTimers() })          // interval fires
  rerender({ ...props, isLoading: true })             // refetch started
  act(() => { rerender({ ...props, isLoading: false }) }) // completes, bouts unchanged
}

// Simulate: timer fires → refetch starts → completes WITH new results
function simulateAutoRefreshWithResults(rerender, props, newBouts) {
  act(() => { vi.runOnlyPendingTimers() })
  rerender({ ...props, isLoading: true })
  act(() => { rerender({ ...props, isLoading: false, bouts: newBouts }) })
}

// ─────────────────────────────────────────────────────────────────────────────

describe('useTorikumiAutoRefresh', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => { vi.useRealTimers(); vi.clearAllMocks() })

  // ── showRefreshButton ─────────────────────────────────────────────────────

  describe('showRefreshButton', () => {
    it('is true when on the latest day with pending bouts', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ day: 5, maxDay: 5, bouts: [pendingBout] })),
      )
      expect(result.current.showRefreshButton).toBe(true)
    })

    it('is true when on the next-scheduled day (maxDay+1) with pending bouts', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ day: 6, maxDay: 5, bouts: [pendingBout] })),
      )
      expect(result.current.showRefreshButton).toBe(true)
    })

    it('treats winnerId: 0 as pending (the real API shape for an unplayed bout)', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({
          bouts: [{ matchNo: 1, eastId: 1, westId: 2, winnerId: 0 }],
        })),
      )
      expect(result.current.showRefreshButton).toBe(true)
    })

    it('treats any truthy winnerId as a completed bout', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({
          bouts: [{ matchNo: 1, eastId: 1, westId: 2, winnerId: 42 }],
        })),
      )
      expect(result.current.showRefreshButton).toBe(false)
    })

    it('is false when on a past day (day < maxDay)', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ day: 4, maxDay: 5, bouts: [pendingBout] })),
      )
      expect(result.current.showRefreshButton).toBe(false)
    })

    it('is false when all bouts have results (no pending)', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ day: 5, maxDay: 5, bouts: [done(1), done(2)] })),
      )
      expect(result.current.showRefreshButton).toBe(false)
    })

    it('is false when bouts array is empty', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ day: 5, maxDay: 5, bouts: [] })),
      )
      expect(result.current.showRefreshButton).toBe(false)
    })

    it('is false when maxDay is 0 (no data)', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ day: 1, maxDay: 0, bouts: [pendingBout] })),
      )
      expect(result.current.showRefreshButton).toBe(false)
    })
  })

  // ── canRefresh / isRefreshing ─────────────────────────────────────────────

  describe('canRefresh', () => {
    it('is true when not loading and not in cooldown', () => {
      const { result } = renderHook(() => useTorikumiAutoRefresh(makeProps()))
      expect(result.current.canRefresh).toBe(true)
    })

    it('is false while isLoading is true', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ isLoading: true })),
      )
      expect(result.current.canRefresh).toBe(false)
    })

    it('is false immediately after manual refresh (cooldown active)', () => {
      const { result } = renderHook(() => useTorikumiAutoRefresh(makeProps()))
      act(() => { result.current.handleManualRefresh() })
      expect(result.current.canRefresh).toBe(false)
    })

    it('is true again after cooldown expires', () => {
      const { result } = renderHook(() => useTorikumiAutoRefresh(makeProps()))
      act(() => { result.current.handleManualRefresh() })
      expect(result.current.canRefresh).toBe(false)
      act(() => { vi.advanceTimersByTime(COOLDOWN_MS) })
      expect(result.current.canRefresh).toBe(true)
    })

    it('exposes isRefreshing equal to isLoading', () => {
      const { result } = renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ isLoading: true })),
      )
      expect(result.current.isRefreshing).toBe(true)
    })
  })

  // ── handleManualRefresh ───────────────────────────────────────────────────

  describe('handleManualRefresh', () => {
    it('calls refetch', () => {
      const refetch = vi.fn()
      const { result } = renderHook(() => useTorikumiAutoRefresh(makeProps({ refetch })))
      act(() => { result.current.handleManualRefresh() })
      expect(refetch).toHaveBeenCalledTimes(1)
    })

    it('starts 60-second cooldown on click', () => {
      const { result } = renderHook(() => useTorikumiAutoRefresh(makeProps()))
      act(() => { result.current.handleManualRefresh() })
      expect(result.current.canRefresh).toBe(false)
      act(() => { vi.advanceTimersByTime(COOLDOWN_MS - 1) })
      expect(result.current.canRefresh).toBe(false)
      act(() => { vi.advanceTimersByTime(1) })
      expect(result.current.canRefresh).toBe(true)
    })

    it('re-enables auto-refresh (phase → active) only when previously stopped', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })

      // Drive to 'stopped' via CONSECUTIVE_THRESHOLD no-result auto-refreshes
      // then BACKOFF_MAX_ATTEMPTS no-result back-off refreshes
      for (let i = 0; i < CONSECUTIVE_THRESHOLD; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }
      // Should now be in backoff
      expect(result.current.autoRefreshPhase).toBe('backoff')

      for (let i = 0; i < BACKOFF_MAX_ATTEMPTS; i++) {
        act(() => { vi.advanceTimersByTime(BACKOFF_INTERVALS_MS[i]) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }
      expect(result.current.autoRefreshPhase).toBe('stopped')

      // Now manual refresh should re-enable auto-refresh
      act(() => { result.current.handleManualRefresh() })
      expect(result.current.autoRefreshPhase).toBe('active')
    })

    it('does NOT change phase when clicked during back-off (only after stopped)', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })

      // Drive to back-off
      for (let i = 0; i < CONSECUTIVE_THRESHOLD; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }
      expect(result.current.autoRefreshPhase).toBe('backoff')

      // Manual refresh during back-off should NOT reset to active
      act(() => { result.current.handleManualRefresh() })
      expect(result.current.autoRefreshPhase).toBe('backoff')
    })
  })

  // ── Auto-refresh timing ───────────────────────────────────────────────────

  describe('auto-refresh', () => {
    it('calls refetch every NORMAL_INTERVAL_MS when on latest day with pending bouts', () => {
      const refetch = vi.fn()
      renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ refetch, bouts: [pendingBout], day: 5, maxDay: 5 })),
      )
      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
      expect(refetch).toHaveBeenCalledTimes(1)
      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
      expect(refetch).toHaveBeenCalledTimes(2)
    })

    it('does NOT call refetch when on a past day', () => {
      const refetch = vi.fn()
      renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ refetch, day: 3, maxDay: 5 })),
      )
      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS * 3) })
      expect(refetch).not.toHaveBeenCalled()
    })

    it('does NOT call refetch when all bouts have results', () => {
      const refetch = vi.fn()
      renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ refetch, bouts: [done(1), done(2)] })),
      )
      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS * 3) })
      expect(refetch).not.toHaveBeenCalled()
    })

    it('does NOT call refetch when enabled is false', () => {
      const refetch = vi.fn()
      renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ refetch, enabled: false })),
      )
      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS * 3) })
      expect(refetch).not.toHaveBeenCalled()
    })

    it('does NOT call refetch while isLoading is true', () => {
      const refetch = vi.fn()
      renderHook(() =>
        useTorikumiAutoRefresh(makeProps({ refetch, isLoading: true })),
      )
      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
      expect(refetch).not.toHaveBeenCalled()
    })

    it('does NOT call refetch during cooldown period', () => {
      const refetch = vi.fn()
      const { result } = renderHook(() => useTorikumiAutoRefresh(makeProps({ refetch })))
      act(() => { result.current.handleManualRefresh() }) // starts cooldown
      refetch.mockClear()
      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) }) // interval fires during cooldown
      expect(refetch).not.toHaveBeenCalled()
    })
  })

  // ── Consecutive no-results → back-off ─────────────────────────────────────

  describe('consecutive no-results tracking', () => {
    it('starts in active phase', () => {
      const { result } = renderHook(() => useTorikumiAutoRefresh(makeProps()))
      expect(result.current.autoRefreshPhase).toBe('active')
    })

    it('detects new results when winnerId changes from 0 to a positive integer', () => {
      const refetch = vi.fn()
      const initial = [{ matchNo: 1, eastId: 1, westId: 2, winnerId: 0 }]
      const updated = [{ matchNo: 1, eastId: 1, westId: 2, winnerId: 10 }]
      const props = makeProps({ refetch, bouts: initial })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })

      // Perform 2 no-result refreshes (threshold is 3)
      for (let i = 0; i < CONSECUTIVE_THRESHOLD - 1; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true, bouts: initial })
        act(() => { rerender({ ...props, isLoading: false, bouts: initial }) })
      }
      expect(result.current.autoRefreshPhase).toBe('active')

      // Next refresh returns a bout with a winner (0 → 10)
      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
      rerender({ ...props, isLoading: true, bouts: initial })
      act(() => { rerender({ ...props, isLoading: false, bouts: updated }) })

      // Phase must still be active (counter was reset by the new result)
      expect(result.current.autoRefreshPhase).toBe('active')

      // Another 2 no-result refreshes should still not trigger backoff
      for (let i = 0; i < CONSECUTIVE_THRESHOLD - 1; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true, bouts: updated })
        act(() => { rerender({ ...props, isLoading: false, bouts: updated }) })
      }
      expect(result.current.autoRefreshPhase).toBe('active')
    })

    it('transitions to backoff after CONSECUTIVE_THRESHOLD no-result auto-refreshes', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })

      for (let i = 0; i < CONSECUTIVE_THRESHOLD; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) }) // no new results
      }

      expect(result.current.autoRefreshPhase).toBe('backoff')
    })

    it('resets consecutive counter when new results arrive — stays in active', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch, bouts: [pendingBout, done(1)] })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })

      // Two no-result refreshes
      for (let i = 0; i < CONSECUTIVE_THRESHOLD - 1; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }
      expect(result.current.autoRefreshPhase).toBe('active')

      // One refresh WITH new result (one more bout completed)
      const newBouts = [pendingBout, done(1), done(2)]
      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
      rerender({ ...props, isLoading: true })
      act(() => { rerender({ ...props, isLoading: false, bouts: newBouts }) })
      expect(result.current.autoRefreshPhase).toBe('active')

      // Two more no-result refreshes — counter was reset so should NOT transition yet
      for (let i = 0; i < CONSECUTIVE_THRESHOLD - 1; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true, bouts: newBouts })
        act(() => { rerender({ ...props, isLoading: false, bouts: newBouts }) })
      }
      expect(result.current.autoRefreshPhase).toBe('active')
    })

    it('new results during back-off resets phase to active', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })

      // Drive to backoff
      for (let i = 0; i < CONSECUTIVE_THRESHOLD; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }
      expect(result.current.autoRefreshPhase).toBe('backoff')

      // First back-off attempt returns new results
      act(() => { vi.advanceTimersByTime(BACKOFF_INTERVALS_MS[0]) })
      rerender({ ...props, isLoading: true })
      const newBouts = [pendingBout, done(1)]
      act(() => { rerender({ ...props, isLoading: false, bouts: newBouts }) })

      expect(result.current.autoRefreshPhase).toBe('active')
    })
  })

  // ── Back-off intervals ────────────────────────────────────────────────────

  describe('back-off strategy', () => {
    it('uses BACKOFF_INTERVALS_MS[0] for first back-off attempt', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { rerender } = renderHook((p) => useTorikumiAutoRefresh(p), { initialProps: props })

      // Drive to backoff
      for (let i = 0; i < CONSECUTIVE_THRESHOLD; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }
      refetch.mockClear()

      // Should NOT fire before first back-off interval
      act(() => { vi.advanceTimersByTime(BACKOFF_INTERVALS_MS[0] - 1) })
      expect(refetch).not.toHaveBeenCalled()

      // Should fire exactly at the first back-off interval
      act(() => { vi.advanceTimersByTime(1) })
      expect(refetch).toHaveBeenCalledTimes(1)
    })

    it('uses progressively longer intervals for each back-off attempt', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })

      // Drive to backoff
      for (let i = 0; i < CONSECUTIVE_THRESHOLD; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }

      // Verify each back-off interval is >= the previous
      for (let i = 0; i < BACKOFF_INTERVALS_MS.length - 1; i++) {
        expect(BACKOFF_INTERVALS_MS[i + 1]).toBeGreaterThanOrEqual(BACKOFF_INTERVALS_MS[i])
      }
    })

    it('transitions to stopped after BACKOFF_MAX_ATTEMPTS no-result back-off attempts', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })

      // Drive to backoff
      for (let i = 0; i < CONSECUTIVE_THRESHOLD; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }
      expect(result.current.autoRefreshPhase).toBe('backoff')

      // Exhaust all back-off attempts
      for (let i = 0; i < BACKOFF_MAX_ATTEMPTS; i++) {
        act(() => { vi.advanceTimersByTime(BACKOFF_INTERVALS_MS[i]) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }

      expect(result.current.autoRefreshPhase).toBe('stopped')
    })
  })

  // ── Stopped state ─────────────────────────────────────────────────────────

  describe('stopped state', () => {
    const driveToStopped = (rerender, props) => {
      for (let i = 0; i < CONSECUTIVE_THRESHOLD; i++) {
        act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }
      for (let i = 0; i < BACKOFF_MAX_ATTEMPTS; i++) {
        act(() => { vi.advanceTimersByTime(BACKOFF_INTERVALS_MS[i]) })
        rerender({ ...props, isLoading: true })
        act(() => { rerender({ ...props, isLoading: false }) })
      }
    }

    it('auto-refresh stops firing in stopped state', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { rerender } = renderHook((p) => useTorikumiAutoRefresh(p), { initialProps: props })
      driveToStopped(rerender, props)
      refetch.mockClear()

      // No interval should fire after stopping
      act(() => { vi.advanceTimersByTime(BACKOFF_INTERVALS_MS[BACKOFF_MAX_ATTEMPTS - 1] * 3) })
      expect(refetch).not.toHaveBeenCalled()
    })

    it('manual refresh still works in stopped state', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })
      driveToStopped(rerender, props)
      refetch.mockClear()

      act(() => { result.current.handleManualRefresh() })
      expect(refetch).toHaveBeenCalledTimes(1)
    })

    it('manual refresh restores auto-refresh to active after stopping', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })
      driveToStopped(rerender, props)
      expect(result.current.autoRefreshPhase).toBe('stopped')

      act(() => { result.current.handleManualRefresh() })
      expect(result.current.autoRefreshPhase).toBe('active')
    })

    it('auto-refresh resumes (NORMAL_INTERVAL) after restart from stopped', () => {
      const refetch = vi.fn()
      const props = makeProps({ refetch })
      const { result, rerender } = renderHook((p) => useTorikumiAutoRefresh(p), {
        initialProps: props,
      })
      driveToStopped(rerender, props)

      act(() => { result.current.handleManualRefresh() })
      // Allow cooldown to expire so auto-refresh can fire
      act(() => { vi.advanceTimersByTime(COOLDOWN_MS) })
      refetch.mockClear()

      act(() => { vi.advanceTimersByTime(NORMAL_INTERVAL_MS) })
      expect(refetch).toHaveBeenCalledTimes(1)
    })
  })
})
