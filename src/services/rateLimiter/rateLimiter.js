import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_TIME_WINDOW } from '../api/apiConfig'

/**
 * Token bucket rate limiter
 * Limits requests to prevent API abuse
 */
class RateLimiter {
  constructor(maxRequests = RATE_LIMIT_MAX_REQUESTS, timeWindow = RATE_LIMIT_TIME_WINDOW) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = []
  }

  /**
   * Check if a request can be made
   * @returns {boolean} True if request can be made
   */
  canMakeRequest() {
    this.cleanOldRequests()
    return this.requests.length < this.maxRequests
  }

  /**
   * Record a request
   */
  recordRequest() {
    this.requests.push(Date.now())
  }

  /**
   * Remove requests older than the time window
   */
  cleanOldRequests() {
    const now = Date.now()
    const cutoff = now - this.timeWindow
    this.requests = this.requests.filter(timestamp => timestamp > cutoff)
  }

  /**
   * Get the number of remaining requests in current window
   * @returns {number} Number of remaining requests
   */
  getRemainingRequests() {
    this.cleanOldRequests()
    return Math.max(0, this.maxRequests - this.requests.length)
  }

  /**
   * Get time until next request is allowed (if rate limited)
   * @returns {number} Milliseconds until next request, or 0 if can make request now
   */
  getTimeUntilNextRequest() {
    this.cleanOldRequests()

    if (this.canMakeRequest()) {
      return 0
    }

    // Find the oldest request
    const oldestRequest = Math.min(...this.requests)
    const timeUntilExpiry = (oldestRequest + this.timeWindow) - Date.now()

    return Math.max(0, timeUntilExpiry)
  }

  /**
   * Wait until a request can be made
   * @returns {Promise<void>} Resolves when request can be made
   */
  async waitForAvailability() {
    const waitTime = this.getTimeUntilNextRequest()

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * Reset the rate limiter
   */
  reset() {
    this.requests = []
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()

export default RateLimiter
