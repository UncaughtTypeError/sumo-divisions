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
    // Used only for the heya overview (grouping active wrestlers by stable).
    // Sidebar meta and rank history are fetched per-wrestler via getRikishi().
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
    // ranks=true – include full rankHistory for career-high and rank movement.
    // Individual endpoint has no pagination limit so this is always complete.
    const response = await sumoApiClient.get(`/rikishi/${rikishiId}?ranks=true`)
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

export async function getRikishiMatches(rikishiId, opponentId) {
  try {
    const response = await sumoApiClient.get(`/rikishi/${rikishiId}/matches/${opponentId}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch matches between ${rikishiId} and ${opponentId}:`, error)
    throw error
  }
}

export async function getRikishiAllMatches(rikishiId) {
  try {
    const response = await sumoApiClient.get(`/rikishi/${rikishiId}/matches`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch all matches for rikishi ${rikishiId}:`, error)
    throw error
  }
}
