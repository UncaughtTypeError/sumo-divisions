import { describe, it, expect } from 'vitest'
import {
  API_BASE_URL,
  API_TIMEOUT,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_TIME_WINDOW,
} from '../../services/api/apiConfig'

describe('apiConfig', () => {
  describe('API_BASE_URL', () => {
    it('should be the correct sumo API URL', () => {
      expect(API_BASE_URL).toBe('https://www.sumo-api.com/api')
    })

    it('should be a valid URL', () => {
      expect(() => new URL(API_BASE_URL)).not.toThrow()
    })

    it('should use HTTPS', () => {
      expect(API_BASE_URL.startsWith('https://')).toBe(true)
    })
  })

  describe('API_TIMEOUT', () => {
    it('should be 10 seconds', () => {
      expect(API_TIMEOUT).toBe(10000)
    })

    it('should be a positive number', () => {
      expect(API_TIMEOUT).toBeGreaterThan(0)
    })
  })

  describe('RATE_LIMIT_MAX_REQUESTS', () => {
    it('should be 60 requests', () => {
      expect(RATE_LIMIT_MAX_REQUESTS).toBe(60)
    })

    it('should be a positive number', () => {
      expect(RATE_LIMIT_MAX_REQUESTS).toBeGreaterThan(0)
    })
  })

  describe('RATE_LIMIT_TIME_WINDOW', () => {
    it('should be 1 minute in milliseconds', () => {
      expect(RATE_LIMIT_TIME_WINDOW).toBe(60000)
    })

    it('should be a positive number', () => {
      expect(RATE_LIMIT_TIME_WINDOW).toBeGreaterThan(0)
    })
  })
})
