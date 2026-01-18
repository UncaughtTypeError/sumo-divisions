import { useQuery } from '@tanstack/react-query'
import { getBashoResults } from '../services/api/bashoResultsService'

/**
 * Custom hook to fetch basho results (yusho winners and special prizes)
 * Includes automatic caching via React Query - results are cached per bashoId
 *
 * @param {string} bashoId - Basho ID in YYYYMM format
 * @param {object} options - Additional React Query options
 * @returns {object} Query result with data, isLoading, error, etc.
 */
export function useBashoResults(bashoId, options = {}) {
  return useQuery({
    queryKey: ['bashoResults', bashoId],
    queryFn: () => getBashoResults(bashoId),
    enabled: !!bashoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    ...options,
  })
}

export default useBashoResults
