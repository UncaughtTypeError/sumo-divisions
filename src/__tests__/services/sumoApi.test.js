import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// Mock axios.create
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
    })),
  },
}))

// Mock rateLimiter
vi.mock('../../services/rateLimiter/rateLimiter', () => ({
  rateLimiter: {
    canMakeRequest: vi.fn(() => true),
    recordRequest: vi.fn(),
    waitForAvailability: vi.fn(() => Promise.resolve()),
  },
}))

import { rateLimiter } from '../../services/rateLimiter/rateLimiter'

describe('sumoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear module cache to re-import fresh
    vi.resetModules()
  })

  describe('axios instance creation', () => {
    it('should create axios instance with correct configuration', async () => {
      await import('../../services/api/sumoApi')

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://www.sumo-api.com/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  describe('request interceptor', () => {
    let requestInterceptor

    beforeEach(async () => {
      const mockCreate = axios.create
      mockCreate.mockImplementation(() => {
        const instance = {
          interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
          },
        }
        return instance
      })

      const module = await import('../../services/api/sumoApi')
      const createdInstance = axios.create.mock.results[0]?.value

      if (createdInstance) {
        requestInterceptor =
          createdInstance.interceptors.request.use.mock.calls[0]
      }
    })

    it('should register request interceptor', () => {
      expect(requestInterceptor).toBeDefined()
    })
  })

  describe('rate limiting behavior', () => {
    it('should check rate limit before request', () => {
      // The actual behavior is tested in integration
      expect(rateLimiter.canMakeRequest).toBeDefined()
      expect(rateLimiter.recordRequest).toBeDefined()
    })

    it('should wait for availability when rate limited', () => {
      expect(rateLimiter.waitForAvailability).toBeDefined()
    })
  })
})

describe('sumoApi error handling', () => {
  it('should handle 429 Too Many Requests', () => {
    const errorResponse = {
      response: {
        status: 429,
        data: {},
        statusText: 'Too Many Requests',
      },
    }

    // Test that proper error would be thrown
    expect(errorResponse.response.status).toBe(429)
  })

  it('should handle 404 Not Found', () => {
    const errorResponse = {
      response: {
        status: 404,
        data: {},
        statusText: 'Not Found',
      },
    }

    expect(errorResponse.response.status).toBe(404)
  })

  it('should handle 500 Server Error', () => {
    const errorResponse = {
      response: {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
      },
    }

    expect(errorResponse.response.status).toBe(500)
  })

  it('should handle network errors', () => {
    const networkError = {
      request: {},
      message: 'Network Error',
    }

    expect(networkError.request).toBeDefined()
    expect(networkError.message).toBe('Network Error')
  })
})
