import { useQuery } from '@tanstack/react-query'
import { getBanzuke } from '../services/api/banzukeService'

/**
 * Custom hook to fetch banzuke data for a specific basho and division
 * Includes automatic caching via React Query
 *
 * @param {string} bashoId - Basho ID in YYYYMM format
 * @param {string} division - Division name (e.g., "Makuuchi")
 * @param {object} options - Additional React Query options
 * @returns {object} Query result with data, isLoading, error, etc.
 */
export function useBanzuke(bashoId, division, options = {}) {
  return useQuery({
    queryKey: ['banzuke', bashoId, division],
    queryFn: () => getBanzuke(bashoId, division),
    enabled: !!bashoId && !!division, // Only fetch if both params exist
    ...options,
  })
}

export default useBanzuke
