import { MATCH_RESULTS } from './constants'

/**
 * Calculate wins, losses, and forfeits from a wrestler's match record
 *
 * @param {Array<{result: string}>} record - Array of match records
 * @returns {{wins: number, losses: number, forfeits: number}} Calculated W-L-F record
 *
 * @example
 * const record = [
 *   { result: "win" },
 *   { result: "loss" },
 *   { result: "fusen loss" },
 * ]
 * calculateRecord(record) // Returns { wins: 1, losses: 1, forfeits: 1 }
 */
export function calculateRecord(record) {
  // Default to 0-0-0 if record is missing or not an array
  if (!record || !Array.isArray(record)) {
    return { wins: 0, losses: 0, forfeits: 0 }
  }

  const wins = record.filter(match => match.result === MATCH_RESULTS.WIN).length
  const losses = record.filter(match => match.result === MATCH_RESULTS.LOSS).length
  const forfeits = record.filter(match =>
    match.result === MATCH_RESULTS.FUSEN_LOSS || match.result === MATCH_RESULTS.EMPTY
  ).length

  return { wins, losses, forfeits }
}

/**
 * Format a W-L-F record as a string
 * @param {{wins: number, losses: number, forfeits: number}} record - Record object
 * @returns {string} Formatted string (e.g., "6-4-5")
 */
export function formatRecord(record) {
  return `${record.wins}-${record.losses}-${record.forfeits}`
}

/**
 * Calculate and format a record in one call
 * @param {Array<{result: string}>} record - Array of match records
 * @returns {string} Formatted W-L-F string (e.g., "6-4-5")
 */
export function calculateAndFormatRecord(record) {
  const calculated = calculateRecord(record)
  return formatRecord(calculated)
}

/**
 * Get total matches from a record
 * @param {{wins: number, losses: number, forfeits: number}} record - Record object
 * @returns {number} Total number of matches
 */
export function getTotalMatches(record) {
  return record.wins + record.losses + record.forfeits
}

/**
 * Calculate win percentage (excluding forfeits)
 * @param {{wins: number, losses: number, forfeits: number}} record - Record object
 * @returns {number} Win percentage (0-100)
 */
export function getWinPercentage(record) {
  const totalDecidedMatches = record.wins + record.losses

  if (totalDecidedMatches === 0) {
    return 0
  }

  return (record.wins / totalDecidedMatches) * 100
}
