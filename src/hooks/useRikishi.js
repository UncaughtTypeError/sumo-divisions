import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getAllRikishi, getRikishi } from '../services/api/rikishiService'

/**
 * Custom hook to fetch all rikishi and build a lookup map
 * Includes automatic caching via React Query
 *
 * @param {object} options - Additional React Query options
 * @returns {object} Query result with rikishiMap lookup
 */
export function useAllRikishi(options = {}) {
  const query = useQuery({
    queryKey: ['allRikishi'],
    queryFn: getAllRikishi,
    staleTime: 1000 * 60 * 60, // 1 hour - rikishi details rarely change
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
    ...options,
  })

  // Build a Map for O(1) lookup by rikishiID
  const rikishiMap = useMemo(() => {
    if (!query.data?.records) return new Map()
    const map = new Map()
    for (const rikishi of query.data.records) {
      if (rikishi.id) {
        map.set(rikishi.id, rikishi)
      }
    }
    return map
  }, [query.data])

  return {
    ...query,
    rikishiMap,
  }
}

/**
 * Custom hook to fetch rikishi details by ID (single rikishi)
 * Includes automatic caching via React Query
 *
 * @param {number} rikishiId - The rikishi ID
 * @param {object} options - Additional React Query options
 * @returns {object} Query result with data, isLoading, error, etc.
 */
export function useRikishi(rikishiId, options = {}) {
  return useQuery({
    queryKey: ['rikishi', rikishiId],
    queryFn: () => getRikishi(rikishiId),
    enabled: !!rikishiId,
    staleTime: 1000 * 60 * 60, // 1 hour - rikishi details rarely change
    ...options,
  })
}

export default useRikishi
