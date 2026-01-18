import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBanzuke, banzukeQueryFn } from '../../services/api/banzukeService'

// Mock sumoApi
vi.mock('../../services/api/sumoApi', () => ({
  default: {
    get: vi.fn(),
  },
}))

import sumoApiClient from '../../services/api/sumoApi'

describe('banzukeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBanzuke', () => {
    const mockResponse = {
      data: {
        bashoId: '202601',
        division: 'Makuuchi',
        east: [{ rikishiID: 1, shikonaEn: 'Terunofuji' }],
        west: [{ rikishiID: 2, shikonaEn: 'Hoshoryu' }],
      },
    }

    it('should call API with correct endpoint', async () => {
      sumoApiClient.get.mockResolvedValue(mockResponse)

      await getBanzuke('202601', 'Makuuchi')

      expect(sumoApiClient.get).toHaveBeenCalledWith(
        '/basho/202601/banzuke/Makuuchi'
      )
    })

    it('should return banzuke data', async () => {
      sumoApiClient.get.mockResolvedValue(mockResponse)

      const result = await getBanzuke('202601', 'Makuuchi')

      expect(result).toEqual(mockResponse.data)
    })

    it('should handle different divisions', async () => {
      sumoApiClient.get.mockResolvedValue({ data: {} })

      await getBanzuke('202601', 'Juryo')

      expect(sumoApiClient.get).toHaveBeenCalledWith(
        '/basho/202601/banzuke/Juryo'
      )
    })

    it('should throw error on API failure', async () => {
      const error = new Error('Network error')
      sumoApiClient.get.mockRejectedValue(error)

      await expect(getBanzuke('202601', 'Makuuchi')).rejects.toThrow(
        'Network error'
      )
    })

    it('should log error on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Network error')
      sumoApiClient.get.mockRejectedValue(error)

      try {
        await getBanzuke('202601', 'Makuuchi')
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch banzuke for 202601/Makuuchi:',
        error
      )
      consoleSpy.mockRestore()
    })
  })

  describe('banzukeQueryFn', () => {
    it('should extract parameters from queryKey and call getBanzuke', async () => {
      const mockResponse = { data: { test: 'data' } }
      sumoApiClient.get.mockResolvedValue(mockResponse)

      const result = await banzukeQueryFn({
        queryKey: ['banzuke', '202601', 'Makuuchi'],
      })

      expect(sumoApiClient.get).toHaveBeenCalledWith(
        '/basho/202601/banzuke/Makuuchi'
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should work with different query key values', async () => {
      sumoApiClient.get.mockResolvedValue({ data: {} })

      await banzukeQueryFn({
        queryKey: ['banzuke', '202511', 'Juryo'],
      })

      expect(sumoApiClient.get).toHaveBeenCalledWith(
        '/basho/202511/banzuke/Juryo'
      )
    })
  })
})
