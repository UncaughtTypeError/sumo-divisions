import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRikishi, getAllRikishi, rikishiQueryFn, allRikishiQueryFn } from '../../services/api/rikishiService'
import sumoApiClient from '../../services/api/sumoApi'

// Mock the sumoApiClient
vi.mock('../../services/api/sumoApi', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('rikishiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllRikishi', () => {
    it('should fetch all rikishi data', async () => {
      const mockAllRikishi = {
        limit: 1000,
        skip: 0,
        total: 619,
        records: [
          { id: 1, shikonaEn: 'Terunofuji', heya: 'Isegahama' },
          { id: 2, shikonaEn: 'Hoshoryu', heya: 'Tatsunami' },
        ],
      }

      sumoApiClient.get.mockResolvedValueOnce({ data: mockAllRikishi })

      const result = await getAllRikishi()

      expect(sumoApiClient.get).toHaveBeenCalledWith('/rikishis')
      expect(result).toEqual(mockAllRikishi)
    })

    it('should throw error on API failure', async () => {
      sumoApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(getAllRikishi()).rejects.toThrow('Network error')
    })
  })

  describe('getRikishi', () => {
    it('should fetch rikishi details by ID', async () => {
      const mockRikishi = {
        id: 19,
        sumodbId: 12451,
        nskId: 3842,
        shikonaEn: 'Hoshoryu',
        shikonaJp: '豊昇龍　智勝',
        currentRank: 'Yokozuna 1 East',
        heya: 'Tatsunami',
        birthDate: '1999-05-22T00:00:00Z',
        shusshin: 'Mongolia, Ulaanbaatar',
        height: 188,
        weight: 149,
        debut: '201711',
      }

      sumoApiClient.get.mockResolvedValueOnce({ data: mockRikishi })

      const result = await getRikishi(19)

      expect(sumoApiClient.get).toHaveBeenCalledWith('/rikishi/19')
      expect(result).toEqual(mockRikishi)
    })

    it('should throw error on API failure', async () => {
      sumoApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(getRikishi(19)).rejects.toThrow('Network error')
    })
  })

  describe('allRikishiQueryFn', () => {
    it('should call getAllRikishi', async () => {
      const mockAllRikishi = {
        limit: 1000,
        skip: 0,
        total: 619,
        records: [],
      }

      sumoApiClient.get.mockResolvedValueOnce({ data: mockAllRikishi })

      const result = await allRikishiQueryFn()

      expect(sumoApiClient.get).toHaveBeenCalledWith('/rikishis')
      expect(result).toEqual(mockAllRikishi)
    })
  })

  describe('rikishiQueryFn', () => {
    it('should extract rikishiId from queryKey and call getRikishi', async () => {
      const mockRikishi = {
        id: 19,
        shikonaEn: 'Hoshoryu',
        heya: 'Tatsunami',
      }

      sumoApiClient.get.mockResolvedValueOnce({ data: mockRikishi })

      const result = await rikishiQueryFn({ queryKey: ['rikishi', 19] })

      expect(sumoApiClient.get).toHaveBeenCalledWith('/rikishi/19')
      expect(result).toEqual(mockRikishi)
    })
  })
})
