import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getBanzuke } from '../services/api/banzukeService'
import { DIVISIONS } from '../utils/constants'

// Fixed ordered list used as query keys — must match useBanzuke's key shape
// ['banzuke', bashoId, division] so the cache is shared with the regular sidebar.
const ALL_DIVISIONS = Object.values(DIVISIONS)

/**
 * Fetches banzuke data for all six divisions in parallel.
 * Query keys intentionally match useBanzuke so React Query serves cached data
 * when either the heya sidebar or the regular sidebar has already fetched a division.
 *
 * @param {string} bashoId - Basho ID in YYYYMM format
 * @param {object} options
 * @param {boolean} [options.enabled=true] - Disable all queries when false
 * @returns {{ allWrestlers: Array, isLoading: boolean, isError: boolean, results: Array }}
 */
export function useAllDivisionsBanzuke(bashoId, { enabled = true } = {}) {
  const results = useQueries({
    queries: ALL_DIVISIONS.map((division) => ({
      queryKey: ['banzuke', bashoId, division],
      queryFn: () => getBanzuke(bashoId, division),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      enabled: !!bashoId && enabled,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  // useQueries returns a new array reference every render even when data hasn't
  // changed, so depending on `results` directly would recompute on every render
  // and create a new array reference, causing infinite loops in consumers that
  // call setAllWrestlers inside a useEffect. Depending on the joined
  // dataUpdatedAt timestamps gives a stable key that only changes when a query
  // actually receives new data.
  const updatedAtKey = results.map((r) => r.dataUpdatedAt ?? 0).join(',')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allWrestlers = useMemo(
    () =>
      results.flatMap((r) => [
        ...(r.data?.east ?? []),
        ...(r.data?.west ?? []),
      ]),
    [updatedAtKey]
  )

  return { allWrestlers, isLoading, isError, results }
}

export default useAllDivisionsBanzuke
