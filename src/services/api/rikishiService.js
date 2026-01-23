import sumoApiClient from './sumoApi'

/**
 * Fetch all rikishi data
 *
 * @returns {Promise<Object>} All rikishi data with records array
 *
 * @example
 * const data = await getAllRikishi()
 * // Returns: { limit, skip, total, records: [...] }
 */
export async function getAllRikishi() {
  try {
    const response = await sumoApiClient.get('/rikishis')
    return response.data
  } catch (error) {
    console.error('Failed to fetch all rikishi:', error)
    throw error
  }
}

/**
 * Fetch rikishi details by ID (single rikishi)
 *
 * @param {number} rikishiId - The rikishi ID
 * @returns {Promise<Object>} Rikishi data with heya, shusshin, etc.
 *
 * @example
 * const data = await getRikishi(19)
 * // Returns: { id, shikonaEn, heya, shusshin, ... }
 */
export async function getRikishi(rikishiId) {
  try {
    const response = await sumoApiClient.get(`/rikishi/${rikishiId}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch rikishi ${rikishiId}:`, error)
    throw error
  }
}

/**
 * Fetch all rikishi with React Query compatible format
 */
export const allRikishiQueryFn = () => {
  return getAllRikishi()
}

/**
 * Fetch rikishi with React Query compatible format
 */
export const rikishiQueryFn = ({ queryKey }) => {
  const [, rikishiId] = queryKey
  return getRikishi(rikishiId)
}
