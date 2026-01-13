import sumoApiClient from './sumoApi'

/**
 * Fetch banzuke (rankings) for a specific basho and division
 *
 * @param {string} bashoId - Basho ID in YYYYMM format (e.g., "202601")
 * @param {string} division - Division name (e.g., "Makuuchi", "Juryo")
 * @returns {Promise<Object>} Banzuke data with east/west wrestlers
 *
 * @example
 * const data = await getBanzuke("202601", "Makuuchi")
 * // Returns: { bashoId, division, east: [...], west: [...] }
 */
export async function getBanzuke(bashoId, division) {
  try {
    const response = await sumoApiClient.get(`/basho/${bashoId}/banzuke/${division}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch banzuke for ${bashoId}/${division}:`, error)
    throw error
  }
}

/**
 * Fetch banzuke with React Query compatible format
 * This function is designed to work seamlessly with useQuery
 */
export const banzukeQueryFn = ({ queryKey }) => {
  const [, bashoId, division] = queryKey
  return getBanzuke(bashoId, division)
}
