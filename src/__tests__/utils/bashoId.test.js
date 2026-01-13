import { describe, it, expect } from 'vitest'
import { getCurrentBashoId, parseBashoId, isValidBashoId } from '../../utils/bashoId'

describe('bashoId utilities', () => {
  describe('getCurrentBashoId', () => {
    it('should return correct bashoId for valid month (January)', () => {
      const date = new Date('2026-01-15')
      expect(getCurrentBashoId(date)).toBe('202601')
    })

    it('should return correct bashoId for valid month (March)', () => {
      const date = new Date('2026-03-15')
      expect(getCurrentBashoId(date)).toBe('202603')
    })

    it('should return correct bashoId for valid month (May)', () => {
      const date = new Date('2026-05-15')
      expect(getCurrentBashoId(date)).toBe('202605')
    })

    it('should return correct bashoId for valid month (July)', () => {
      const date = new Date('2026-07-15')
      expect(getCurrentBashoId(date)).toBe('202607')
    })

    it('should return correct bashoId for valid month (September)', () => {
      const date = new Date('2026-09-15')
      expect(getCurrentBashoId(date)).toBe('202609')
    })

    it('should return correct bashoId for valid month (November)', () => {
      const date = new Date('2026-11-15')
      expect(getCurrentBashoId(date)).toBe('202611')
    })

    it('should fall back to January when current month is February', () => {
      const date = new Date('2026-02-15')
      expect(getCurrentBashoId(date)).toBe('202601')
    })

    it('should fall back to March when current month is April', () => {
      const date = new Date('2026-04-15')
      expect(getCurrentBashoId(date)).toBe('202603')
    })

    it('should fall back to May when current month is June', () => {
      const date = new Date('2026-06-15')
      expect(getCurrentBashoId(date)).toBe('202605')
    })

    it('should fall back to July when current month is August', () => {
      const date = new Date('2026-08-15')
      expect(getCurrentBashoId(date)).toBe('202607')
    })

    it('should fall back to September when current month is October', () => {
      const date = new Date('2026-10-15')
      expect(getCurrentBashoId(date)).toBe('202609')
    })

    it('should fall back to November when current month is December', () => {
      const date = new Date('2025-12-15')
      expect(getCurrentBashoId(date)).toBe('202511')
    })

    it('should format month with leading zero for single digits', () => {
      const date = new Date('2026-01-15')
      const bashoId = getCurrentBashoId(date)
      expect(bashoId).toBe('202601')
      expect(bashoId.length).toBe(6)
    })

    it('should handle year boundary correctly (December to previous November)', () => {
      const date = new Date('2025-12-31')
      expect(getCurrentBashoId(date)).toBe('202511')
    })
  })

  describe('parseBashoId', () => {
    it('should correctly parse bashoId into year and month', () => {
      const result = parseBashoId('202601')
      expect(result).toEqual({ year: 2026, month: 1 })
    })

    it('should handle different months', () => {
      expect(parseBashoId('202603')).toEqual({ year: 2026, month: 3 })
      expect(parseBashoId('202611')).toEqual({ year: 2026, month: 11 })
    })

    it('should handle different years', () => {
      expect(parseBashoId('202501')).toEqual({ year: 2025, month: 1 })
      expect(parseBashoId('202701')).toEqual({ year: 2027, month: 1 })
    })
  })

  describe('isValidBashoId', () => {
    it('should return true for valid bashoIds', () => {
      expect(isValidBashoId('202601')).toBe(true)
      expect(isValidBashoId('202603')).toBe(true)
      expect(isValidBashoId('202605')).toBe(true)
      expect(isValidBashoId('202607')).toBe(true)
      expect(isValidBashoId('202609')).toBe(true)
      expect(isValidBashoId('202611')).toBe(true)
    })

    it('should return false for invalid months (even months)', () => {
      expect(isValidBashoId('202602')).toBe(false)
      expect(isValidBashoId('202604')).toBe(false)
      expect(isValidBashoId('202606')).toBe(false)
      expect(isValidBashoId('202608')).toBe(false)
      expect(isValidBashoId('202610')).toBe(false)
      expect(isValidBashoId('202612')).toBe(false)
    })

    it('should return false for invalid format', () => {
      expect(isValidBashoId('20260')).toBe(false) // Too short
      expect(isValidBashoId('2026011')).toBe(false) // Too long
      expect(isValidBashoId('abcd01')).toBe(false) // Non-numeric
      expect(isValidBashoId('')).toBe(false) // Empty string
      expect(isValidBashoId(null)).toBe(false) // Null
      expect(isValidBashoId(undefined)).toBe(false) // Undefined
    })

    it('should return false for unrealistic years', () => {
      expect(isValidBashoId('189901')).toBe(false) // Too old
      expect(isValidBashoId('210101')).toBe(false) // Too far future
    })
  })
})
