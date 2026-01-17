import { VALID_BASHO_MONTHS } from './constants'

/**
 * Get the current or most recent valid basho ID
 * Bashos occur in odd months only: January (01), March (03), May (05),
 * July (07), September (09), November (11)
 *
 * @param {Date} [date=new Date()] - Optional date to use (defaults to current date)
 * @returns {string} BashoId in YYYYMM format (e.g., "202601")
 *
 * @example
 * // If current date is February 2026
 * getCurrentBashoId() // Returns "202601" (falls back to January 2026)
 *
 * // If current date is January 2026
 * getCurrentBashoId() // Returns "202601" (valid month, use as-is)
 *
 * // If current date is December 2025
 * getCurrentBashoId() // Returns "202511" (falls back to November 2025)
 */
export function getCurrentBashoId(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // getMonth() returns 0-11, we need 1-12

  // Check if current month is a valid basho month
  if (VALID_BASHO_MONTHS.includes(month)) {
    // Current month is valid, use it
    return formatBashoId(year, month)
  }

  // Current month is invalid, find most recent valid month
  const recentValidMonth = findMostRecentValidMonth(month)

  // If the most recent valid month is in the future (shouldn't happen with our logic,
  // but handling edge case), it means we need to go to previous year's last valid month
  if (recentValidMonth > month) {
    return formatBashoId(year - 1, VALID_BASHO_MONTHS[VALID_BASHO_MONTHS.length - 1])
  }

  return formatBashoId(year, recentValidMonth)
}

/**
 * Find the most recent valid basho month before or equal to the given month
 * @param {number} month - Current month (1-12)
 * @returns {number} Most recent valid month
 */
function findMostRecentValidMonth(month) {
  // Find the largest valid month that is less than or equal to current month
  for (let i = VALID_BASHO_MONTHS.length - 1; i >= 0; i--) {
    if (VALID_BASHO_MONTHS[i] <= month) {
      return VALID_BASHO_MONTHS[i]
    }
  }

  // If no valid month found (month is less than all valid months),
  // return the last valid month of previous year
  return VALID_BASHO_MONTHS[VALID_BASHO_MONTHS.length - 1]
}

/**
 * Format year and month into bashoId string
 * @param {number} year - Full year (e.g., 2026)
 * @param {number} month - Month (1-12)
 * @returns {string} BashoId in YYYYMM format
 */
function formatBashoId(year, month) {
  const monthStr = month.toString().padStart(2, '0')
  return `${year}${monthStr}`
}

/**
 * Parse a bashoId string into year and month
 * @param {string} bashoId - BashoId in YYYYMM format
 * @returns {{year: number, month: number}} Parsed year and month
 */
export function parseBashoId(bashoId) {
  const year = parseInt(bashoId.substring(0, 4), 10)
  const month = parseInt(bashoId.substring(4, 6), 10)
  return { year, month }
}

/**
 * Validate if a bashoId is in correct format and represents a valid tournament
 * @param {string} bashoId - BashoId to validate
 * @returns {boolean} True if valid
 */
export function isValidBashoId(bashoId) {
  if (!bashoId || typeof bashoId !== 'string' || bashoId.length !== 6) {
    return false
  }

  // Check if bashoId contains only numeric characters
  if (!/^\d{6}$/.test(bashoId)) {
    return false
  }

  const { year, month } = parseBashoId(bashoId)

  // Check if year is reasonable (between 1900 and 2100)
  if (year < 1900 || year > 2100) {
    return false
  }

  // Check if month is a valid basho month
  return VALID_BASHO_MONTHS.includes(month)
}

/**
 * Format a bashoId into a readable date string
 * @param {string} bashoId - BashoId in YYYYMM format
 * @returns {string} Formatted date string (e.g., "Jan 2026")
 */
export function formatBashoDate(bashoId) {
  if (!bashoId) return ''

  const { year, month } = parseBashoId(bashoId)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return `${monthNames[month - 1]} ${year}`
}

/**
 * Generate all valid bashoids from a start date to current/most recent basho
 * @param {string} startBashoId - Starting bashoId (e.g., "195803")
 * @param {string} [endBashoId] - Optional ending bashoId (defaults to current basho)
 * @returns {string[]} Array of bashoIds in descending order (newest first)
 */
export function generateBashoIdList(startBashoId = '195803', endBashoId = getCurrentBashoId()) {
  const start = parseBashoId(startBashoId)
  const end = parseBashoId(endBashoId)

  const bashoids = []

  // Iterate from end to start (descending order)
  for (let year = end.year; year >= start.year; year--) {
    // Determine which months to include for this year
    const monthsToInclude = VALID_BASHO_MONTHS.filter(month => {
      // For the end year, only include months <= end month
      if (year === end.year && month > end.month) return false
      // For the start year, only include months >= start month
      if (year === start.year && month < start.month) return false
      return true
    })

    // Add bashoids for this year in descending order
    for (let i = monthsToInclude.length - 1; i >= 0; i--) {
      const month = monthsToInclude[i]
      bashoids.push(formatBashoId(year, month))
    }
  }

  return bashoids
}
