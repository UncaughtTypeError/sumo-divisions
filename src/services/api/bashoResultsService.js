import sumoApiClient from './sumoApi'

/**
 * Fetch basho results (yusho winners and special prizes) for a specific basho
 *
 * @param {string} bashoId - Basho ID in YYYYMM format (e.g., "202511")
 * @returns {Promise<Object>} Basho results with yusho and specialPrizes arrays
 *
 * @example
 * const data = await getBashoResults("202511")
 * // Returns: { date, startDate, endDate, yusho: [...], specialPrizes: [...] }
 */
export async function getBashoResults(bashoId) {
  try {
    const response = await sumoApiClient.get(`/basho/${bashoId}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch basho results for ${bashoId}:`, error)
    throw error
  }
}

/**
 * Fetch basho results with React Query compatible format
 * This function is designed to work seamlessly with useQuery
 */
export const bashoResultsQueryFn = ({ queryKey }) => {
  const [, bashoId] = queryKey
  return getBashoResults(bashoId)
}
