import { describe, it, expect } from 'vitest'
import {
  calculateRecord,
  formatRecord,
  calculateAndFormatRecord,
  getTotalMatches,
  getWinPercentage,
} from '../../utils/recordCalculator'

describe('recordCalculator utilities', () => {
  describe('calculateRecord', () => {
    it('should correctly count wins, losses, and forfeits', () => {
      const record = [
        { result: 'win' },
        { result: 'win' },
        { result: 'loss' },
        { result: 'fusen loss' },
        { result: 'win' },
      ]

      expect(calculateRecord(record)).toEqual({
        wins: 3,
        losses: 1,
        forfeits: 1,
      })
    })

    it('should count empty result as forfeit', () => {
      const record = [
        { result: 'win' },
        { result: '' },
        { result: 'loss' },
      ]

      expect(calculateRecord(record)).toEqual({
        wins: 1,
        losses: 1,
        forfeits: 1,
      })
    })

    it('should handle multiple fusen losses', () => {
      const record = [
        { result: 'fusen loss' },
        { result: 'fusen loss' },
        { result: 'fusen loss' },
      ]

      expect(calculateRecord(record)).toEqual({
        wins: 0,
        losses: 0,
        forfeits: 3,
      })
    })

    it('should handle all wins', () => {
      const record = [
        { result: 'win' },
        { result: 'win' },
        { result: 'win' },
      ]

      expect(calculateRecord(record)).toEqual({
        wins: 3,
        losses: 0,
        forfeits: 0,
      })
    })

    it('should handle all losses', () => {
      const record = [
        { result: 'loss' },
        { result: 'loss' },
      ]

      expect(calculateRecord(record)).toEqual({
        wins: 0,
        losses: 2,
        forfeits: 0,
      })
    })

    it('should return 0-0-0 for empty record array', () => {
      expect(calculateRecord([])).toEqual({
        wins: 0,
        losses: 0,
        forfeits: 0,
      })
    })

    it('should return 0-0-0 for null record', () => {
      expect(calculateRecord(null)).toEqual({
        wins: 0,
        losses: 0,
        forfeits: 0,
      })
    })

    it('should return 0-0-0 for undefined record', () => {
      expect(calculateRecord(undefined)).toEqual({
        wins: 0,
        losses: 0,
        forfeits: 0,
      })
    })

    it('should handle mixed forfeit types (empty string and fusen loss)', () => {
      const record = [
        { result: 'win' },
        { result: '' },
        { result: 'fusen loss' },
        { result: 'loss' },
      ]

      expect(calculateRecord(record)).toEqual({
        wins: 1,
        losses: 1,
        forfeits: 2,
      })
    })

    it('should handle realistic 15-match tournament record', () => {
      const record = [
        { result: 'win' },
        { result: 'win' },
        { result: 'loss' },
        { result: 'win' },
        { result: 'loss' },
        { result: 'win' },
        { result: 'win' },
        { result: 'win' },
        { result: 'loss' },
        { result: 'win' },
        { result: 'loss' },
        { result: 'loss' },
        { result: 'win' },
        { result: 'win' },
        { result: 'fusen loss' },
      ]

      expect(calculateRecord(record)).toEqual({
        wins: 9,
        losses: 5,
        forfeits: 1,
      })
    })
  })

  describe('formatRecord', () => {
    it('should format record as W-L-F string', () => {
      expect(formatRecord({ wins: 6, losses: 4, forfeits: 5 })).toBe('6-4-5')
    })

    it('should format zeros correctly', () => {
      expect(formatRecord({ wins: 0, losses: 0, forfeits: 0 })).toBe('0-0-0')
    })

    it('should format double-digit numbers', () => {
      expect(formatRecord({ wins: 10, losses: 12, forfeits: 15 })).toBe('10-12-15')
    })
  })

  describe('calculateAndFormatRecord', () => {
    it('should calculate and format in one call', () => {
      const record = [
        { result: 'win' },
        { result: 'win' },
        { result: 'loss' },
        { result: 'fusen loss' },
      ]

      expect(calculateAndFormatRecord(record)).toBe('2-1-1')
    })

    it('should handle empty record', () => {
      expect(calculateAndFormatRecord([])).toBe('0-0-0')
    })
  })

  describe('getTotalMatches', () => {
    it('should calculate total matches', () => {
      expect(getTotalMatches({ wins: 6, losses: 4, forfeits: 5 })).toBe(15)
    })

    it('should return 0 for empty record', () => {
      expect(getTotalMatches({ wins: 0, losses: 0, forfeits: 0 })).toBe(0)
    })

    it('should include forfeits in total', () => {
      expect(getTotalMatches({ wins: 10, losses: 0, forfeits: 5 })).toBe(15)
    })
  })

  describe('getWinPercentage', () => {
    it('should calculate win percentage correctly', () => {
      expect(getWinPercentage({ wins: 10, losses: 5, forfeits: 0 })).toBe(66.66666666666666)
    })

    it('should exclude forfeits from calculation', () => {
      // 10 wins, 5 losses = 10/15 = 66.67%
      expect(getWinPercentage({ wins: 10, losses: 5, forfeits: 5 })).toBe(66.66666666666666)
    })

    it('should return 0 for no decided matches', () => {
      expect(getWinPercentage({ wins: 0, losses: 0, forfeits: 5 })).toBe(0)
    })

    it('should return 100 for all wins', () => {
      expect(getWinPercentage({ wins: 15, losses: 0, forfeits: 0 })).toBe(100)
    })

    it('should return 0 for all losses', () => {
      expect(getWinPercentage({ wins: 0, losses: 15, forfeits: 0 })).toBe(0)
    })
  })
})
