import sumoApiClient from './sumoApi'

/**
 * Validate and normalize banzuke response data
 * Ensures east/west are always arrays and data is valid
 *
 * @param {Object} data - Raw API response
 * @param {string} bashoId - Expected basho ID
 * @param {string} division - Expected division
 * @returns {Object} Normalized banzuke data
 */
function normalizeBanzukeResponse(data, bashoId, division) {
  // Check if response is empty or invalid
  const isEmpty =
    !data ||
    (data.east === null && data.west === null) ||
    (!data.bashoId && !data.division) ||
    (Array.isArray(data.east) && data.east.length === 0 &&
     Array.isArray(data.west) && data.west.length === 0)

  if (isEmpty) {
    return {
      bashoId: data?.bashoId || bashoId,
      division: data?.division || division,
      east: [],
      west: [],
      isEmpty: true,
    }
  }

  // Normalize: ensure east/west are always arrays
  return {
    ...data,
    bashoId: data.bashoId || bashoId,
    division: data.division || division,
    east: Array.isArray(data.east) ? data.east : [],
    west: Array.isArray(data.west) ? data.west : [],
    isEmpty: false,
  }
}

/**
 * Fetch banzuke (rankings) for a specific basho and division
 *
 * @param {string} bashoId - Basho ID in YYYYMM format (e.g., "202601")
 * @param {string} division - Division name (e.g., "Makuuchi", "Juryo")
 * @returns {Promise<Object>} Banzuke data with east/west wrestlers
 *
 * @example
 * const data = await getBanzuke("202601", "Makuuchi")
 * // Returns: { bashoId, division, east: [...], west: [...], isEmpty: boolean }
 */
export async function getBanzuke(bashoId, division) {
  try {
    const response = await sumoApiClient.get(`/basho/${bashoId}/banzuke/${division}`)
    return normalizeBanzukeResponse(response.data, bashoId, division)
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
