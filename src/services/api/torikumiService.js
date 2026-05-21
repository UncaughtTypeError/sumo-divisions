import sumoApiClient from './sumoApi'

/**
 * Normalise the torikumi API response so `bouts` is always an array.
 */
function normalizeTorikumiResponse(data, bashoId, division, day) {
  const isEmpty = !data || (!data.torikumi && !Array.isArray(data));
  const bouts = Array.isArray(data)
    ? data
    : Array.isArray(data?.torikumi)
      ? data.torikumi
      : [];
  return { bashoId, division, day, bouts, isEmpty: bouts.length === 0 };
}

/**
 * Fetch the scheduled / completed bouts for one day of a basho.
 *
 * @param {string} bashoId  - Basho ID in YYYYMM format
 * @param {string} division - Division name (e.g. "Makuuchi")
 * @param {number} day      - Tournament day (1–15 for sekitori)
 * @returns {Promise<{ bashoId, division, day, bouts: Array, isEmpty: boolean }>}
 */
export async function getTorikumi(bashoId, division, day) {
  try {
    const response = await sumoApiClient.get(`/basho/${bashoId}/torikumi/${division}/${day}`)
    return normalizeTorikumiResponse(response.data, bashoId, division, day)
  } catch (error) {
    console.error(`Failed to fetch torikumi for ${bashoId}/${division}/day ${day}:`, error)
    throw error
  }
}
