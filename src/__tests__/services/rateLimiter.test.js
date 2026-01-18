import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import RateLimiter, { rateLimiter } from '../../services/rateLimiter/rateLimiter'

describe('RateLimiter', () => {
  let limiter

  beforeEach(() => {
    limiter = new RateLimiter(5, 1000) // 5 requests per 1 second for testing
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('should initialize with provided values', () => {
      const customLimiter = new RateLimiter(10, 5000)
      expect(customLimiter.maxRequests).toBe(10)
      expect(customLimiter.timeWindow).toBe(5000)
    })

    it('should use default values when not provided', () => {
      const defaultLimiter = new RateLimiter()
      expect(defaultLimiter.maxRequests).toBe(60)
      expect(defaultLimiter.timeWindow).toBe(60000)
    })

    it('should start with empty requests array', () => {
      expect(limiter.requests).toEqual([])
    })
  })

  describe('canMakeRequest', () => {
    it('should return true when no requests have been made', () => {
      expect(limiter.canMakeRequest()).toBe(true)
    })

    it('should return true when under the limit', () => {
      limiter.recordRequest()
      limiter.recordRequest()
      expect(limiter.canMakeRequest()).toBe(true)
    })

    it('should return false when at the limit', () => {
      for (let i = 0; i < 5; i++) {
        limiter.recordRequest()
      }
      expect(limiter.canMakeRequest()).toBe(false)
    })

    it('should return true after time window expires', () => {
      for (let i = 0; i < 5; i++) {
        limiter.recordRequest()
      }
      expect(limiter.canMakeRequest()).toBe(false)

      vi.advanceTimersByTime(1001) // Advance past the time window
      expect(limiter.canMakeRequest()).toBe(true)
    })
  })

  describe('recordRequest', () => {
    it('should add timestamp to requests array', () => {
      const now = Date.now()
      limiter.recordRequest()
      expect(limiter.requests).toHaveLength(1)
      expect(limiter.requests[0]).toBe(now)
    })

    it('should add multiple timestamps', () => {
      limiter.recordRequest()
      vi.advanceTimersByTime(100)
      limiter.recordRequest()
      expect(limiter.requests).toHaveLength(2)
    })
  })

  describe('cleanOldRequests', () => {
    it('should remove requests older than time window', () => {
      limiter.recordRequest()
      vi.advanceTimersByTime(500)
      limiter.recordRequest()
      vi.advanceTimersByTime(600) // First request is now older than 1000ms

      limiter.cleanOldRequests()
      expect(limiter.requests).toHaveLength(1)
    })

    it('should keep recent requests', () => {
      limiter.recordRequest()
      vi.advanceTimersByTime(500)
      limiter.recordRequest()

      limiter.cleanOldRequests()
      expect(limiter.requests).toHaveLength(2)
    })
  })

  describe('getRemainingRequests', () => {
    it('should return max requests when no requests made', () => {
      expect(limiter.getRemainingRequests()).toBe(5)
    })

    it('should return correct remaining count', () => {
      limiter.recordRequest()
      limiter.recordRequest()
      expect(limiter.getRemainingRequests()).toBe(3)
    })

    it('should return 0 when at limit', () => {
      for (let i = 0; i < 5; i++) {
        limiter.recordRequest()
      }
      expect(limiter.getRemainingRequests()).toBe(0)
    })

    it('should not return negative values', () => {
      for (let i = 0; i < 10; i++) {
        limiter.recordRequest()
      }
      expect(limiter.getRemainingRequests()).toBe(0)
    })
  })

  describe('getTimeUntilNextRequest', () => {
    it('should return 0 when can make request', () => {
      expect(limiter.getTimeUntilNextRequest()).toBe(0)
    })

    it('should return time until oldest request expires', () => {
      for (let i = 0; i < 5; i++) {
        limiter.recordRequest()
      }
      vi.advanceTimersByTime(300)

      const timeUntil = limiter.getTimeUntilNextRequest()
      expect(timeUntil).toBe(700) // 1000 - 300 = 700ms until oldest expires
    })

    it('should return 0 after time passes', () => {
      for (let i = 0; i < 5; i++) {
        limiter.recordRequest()
      }
      vi.advanceTimersByTime(1001)

      expect(limiter.getTimeUntilNextRequest()).toBe(0)
    })
  })

  describe('waitForAvailability', () => {
    it('should resolve immediately when can make request', async () => {
      const promise = limiter.waitForAvailability()
      await expect(promise).resolves.toBeUndefined()
    })

    it('should wait when at limit', async () => {
      for (let i = 0; i < 5; i++) {
        limiter.recordRequest()
      }

      const promise = limiter.waitForAvailability()

      // Advance time
      vi.advanceTimersByTime(1001)

      await expect(promise).resolves.toBeUndefined()
    })
  })

  describe('reset', () => {
    it('should clear all requests', () => {
      limiter.recordRequest()
      limiter.recordRequest()
      limiter.recordRequest()

      limiter.reset()
      expect(limiter.requests).toEqual([])
    })

    it('should allow new requests after reset', () => {
      for (let i = 0; i < 5; i++) {
        limiter.recordRequest()
      }
      expect(limiter.canMakeRequest()).toBe(false)

      limiter.reset()
      expect(limiter.canMakeRequest()).toBe(true)
    })
  })

  describe('singleton instance', () => {
    it('should export a singleton rateLimiter', () => {
      expect(rateLimiter).toBeInstanceOf(RateLimiter)
    })

    it('should have default configuration', () => {
      expect(rateLimiter.maxRequests).toBe(60)
      expect(rateLimiter.timeWindow).toBe(60000)
    })
  })
})
