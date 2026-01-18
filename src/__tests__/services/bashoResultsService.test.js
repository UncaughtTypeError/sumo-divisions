import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getBashoResults,
  bashoResultsQueryFn,
} from '../../services/api/bashoResultsService'

// Mock sumoApi
vi.mock('../../services/api/sumoApi', () => ({
  default: {
    get: vi.fn(),
  },
}))

import sumoApiClient from '../../services/api/sumoApi'

describe('bashoResultsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBashoResults', () => {
    const mockResponse = {
      data: {
        date: '2026-01',
        startDate: '2026-01-12',
        endDate: '2026-01-26',
        yusho: [
          { type: 'Makuuchi', rikishiId: 1, shikonaEn: 'Terunofuji' },
          { type: 'Juryo', rikishiId: 2, shikonaEn: 'Mitoryu' },
        ],
        specialPrizes: [
          { type: 'Shukun-sho', rikishiId: 3, shikonaEn: 'Onosato' },
        ],
      },
    }

    it('should call API with correct endpoint', async () => {
      sumoApiClient.get.mockResolvedValue(mockResponse)

      await getBashoResults('202601')

      expect(sumoApiClient.get).toHaveBeenCalledWith('/basho/202601')
    })

    it('should return basho results data', async () => {
      sumoApiClient.get.mockResolvedValue(mockResponse)

      const result = await getBashoResults('202601')

      expect(result).toEqual(mockResponse.data)
    })

    it('should handle different basho IDs', async () => {
      sumoApiClient.get.mockResolvedValue({ data: {} })

      await getBashoResults('202511')

      expect(sumoApiClient.get).toHaveBeenCalledWith('/basho/202511')
    })

    it('should throw error on API failure', async () => {
      const error = new Error('Network error')
      sumoApiClient.get.mockRejectedValue(error)

      await expect(getBashoResults('202601')).rejects.toThrow('Network error')
    })

    it('should log error on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Network error')
      sumoApiClient.get.mockRejectedValue(error)

      try {
        await getBashoResults('202601')
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch basho results for 202601:',
        error
      )
      consoleSpy.mockRestore()
    })
  })

  describe('bashoResultsQueryFn', () => {
    it('should extract bashoId from queryKey and call getBashoResults', async () => {
      const mockResponse = { data: { test: 'data' } }
      sumoApiClient.get.mockResolvedValue(mockResponse)

      const result = await bashoResultsQueryFn({
        queryKey: ['bashoResults', '202601'],
      })

      expect(sumoApiClient.get).toHaveBeenCalledWith('/basho/202601')
      expect(result).toEqual(mockResponse.data)
    })

    it('should work with different query key values', async () => {
      sumoApiClient.get.mockResolvedValue({ data: {} })

      await bashoResultsQueryFn({
        queryKey: ['bashoResults', '202511'],
      })

      expect(sumoApiClient.get).toHaveBeenCalledWith('/basho/202511')
    })
  })
})
