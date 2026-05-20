import { useQuery, useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getAllRikishi, getRikishi, getRikishiMatches } from '../services/api/rikishiService'

/**
 * Fetch the active-wrestler roster for the heya overview grid/cards.
 * This is a best-effort bulk call — sidebar meta and rank history are
 * resolved per-wrestler via useRikishiList instead.
 *
 * @param {object} options - Additional React Query options
 * @returns {{ rikishiMap: Map<number, object>, isLoading: boolean }}
 */
export function useAllRikishi(options = {}) {
  const query = useQuery({
    queryKey: ['allRikishi'],
    queryFn: getAllRikishi,
    staleTime: 1000 * 60 * 60,      // 1 hour — roster changes only on new banzuke
    gcTime: 1000 * 60 * 60 * 24,   // 24 hours cache
    ...options,
  })

  // Build a Map for O(1) lookup by rikishiID
  const rikishiMap = useMemo(() => {
    if (!query.data?.records) return new Map()
    const map = new Map()
    for (const rikishi of query.data.records) {
      if (rikishi.id) map.set(rikishi.id, rikishi)
    }
    return map
  }, [query.data])

  return { ...query, rikishiMap }
}

/**
 * Fetch individual rikishi records (with full rankHistory) for a specific set
 * of IDs — typically the wrestlers currently shown in a sidebar view.
 *
 * Each result is cached under ['rikishi', id] so subsequent sidebar opens
 * are instant. Parallel requests stay within the 60 req/min rate limit for
 * a typical banzuke division (≤ 42 wrestlers).
 *
 * @param {number[]} rikishiIds - IDs of the wrestlers to fetch
 * @param {object}  options     - Additional React Query options (e.g. { enabled })
 * @returns {{
 *   rikishiMap:     Map<number, object>,  // full rikishi object keyed by id
 *   rankHistoryMap: Map<number, Array>,   // rankHistory array keyed by id
 *   isLoading:      boolean
 * }}
 */
export function useRikishiList(rikishiIds = [], options = {}) {
  const { enabled = true } = options

  const results = useQueries({
    queries: rikishiIds.map((id) => ({
      queryKey: ['rikishi', id],
      queryFn: () => getRikishi(id),
      staleTime: 1000 * 60 * 60,      // 1 hour — rikishi details rarely change
      gcTime: 1000 * 60 * 60 * 24,   // 24 hours cache
      enabled: !!id && enabled,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)

  // Build a Map for O(1) lookup by rikishiID (meta: heya, shusshin, intai, etc.)
  const rikishiMap = useMemo(() => {
    const map = new Map()
    for (const r of results) {
      if (r.data?.id) map.set(r.data.id, r.data)
    }
    return map
  }, [results])

  // Separate map for rank history — only populated when rankHistory is present
  const rankHistoryMap = useMemo(() => {
    const map = new Map()
    for (const r of results) {
      if (r.data?.id && r.data.rankHistory?.length) {
        map.set(r.data.id, r.data.rankHistory)
      }
    }
    return map
  }, [results])

  return { rikishiMap, rankHistoryMap, isLoading }
}

/**
 * Fetch rikishi details by ID (single rikishi).
 * Shares the ['rikishi', id] cache key with useRikishiList, so if the
 * sidebar has already loaded this wrestler the modal is a cache hit.
 *
 * @param {number} rikishiId - The rikishi ID
 * @param {object} options   - Additional React Query options
 * @returns {object} Query result with data, isLoading, error, etc.
 */
export function useRikishi(rikishiId, options = {}) {
  return useQuery({
    queryKey: ['rikishi', rikishiId],
    queryFn: () => getRikishi(rikishiId),
    enabled: !!rikishiId,
    staleTime: 1000 * 60 * 60, // 1 hour — rikishi details rarely change
    ...options,
  })
}

/**
 * Fetch head-to-head match history between two rikishi.
 *
 * @param {number} rikishiId  - The primary rikishi ID
 * @param {number} opponentId - The opponent rikishi ID
 * @param {object} options    - Additional React Query options
 * @returns {object} Query result with data, isLoading, error, etc.
 */
export function useRikishiMatches(rikishiId, opponentId, options = {}) {
  return useQuery({
    queryKey: ['rikishiMatches', rikishiId, opponentId],
    queryFn: () => getRikishiMatches(rikishiId, opponentId),
    enabled: !!rikishiId && !!opponentId,
    staleTime: 1000 * 60 * 60, // 1 hour — match history is immutable once recorded
    ...options,
  })
}

export default useRikishi
