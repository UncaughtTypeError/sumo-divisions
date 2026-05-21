import { useQuery } from '@tanstack/react-query'
import { getTorikumi } from '../services/api/torikumiService'

/**
 * Fetch the torikumi (bout schedule / results) for a specific basho day.
 *
 * @param {string}  bashoId  - YYYYMM basho identifier
 * @param {string}  division - Division name (e.g. "Makuuchi")
 * @param {number}  day      - Tournament day (1-15)
 * @param {object}  options  - Additional React Query options (e.g. { enabled })
 * @returns {object} Query result with data, isLoading, error, etc.
 */
export function useTorikumi(bashoId, division, day, options = {}) {
  return useQuery({
    queryKey: ['torikumi', bashoId, division, day],
    queryFn: () => getTorikumi(bashoId, division, day),
    enabled: !!bashoId && !!division && !!day,
    staleTime: 1000 * 60 * 5,  // 5 minutes — results arrive during the day
    gcTime:    1000 * 60 * 30,
    ...options,
  })
}

export default useTorikumi
