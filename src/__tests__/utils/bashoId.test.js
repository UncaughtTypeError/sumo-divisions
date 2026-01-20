import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getCurrentBashoId,
  parseBashoId,
  isValidBashoId,
  formatBashoDate,
  formatBashoDateFull,
  generateBashoIdList,
  BASHO_NICKNAMES,
} from '../../utils/bashoId'

describe('bashoId utilities', () => {
  describe('getCurrentBashoId', () => {
    describe('valid basho months', () => {
      it.each([
        ['January', '2026-01-15', '202601'],
        ['March', '2026-03-15', '202603'],
        ['May', '2026-05-15', '202605'],
        ['July', '2026-07-15', '202607'],
        ['September', '2026-09-15', '202609'],
        ['November', '2026-11-15', '202611'],
      ])('should return correct bashoId for %s', (_month, dateStr, expected) => {
        const date = new Date(dateStr)
        expect(getCurrentBashoId(date)).toBe(expected)
      })
    })

    describe('fallback to previous basho month', () => {
      it.each([
        ['February', '2026-02-15', '202601', 'January'],
        ['April', '2026-04-15', '202603', 'March'],
        ['June', '2026-06-15', '202605', 'May'],
        ['August', '2026-08-15', '202607', 'July'],
        ['October', '2026-10-15', '202609', 'September'],
        ['December', '2025-12-15', '202511', 'November'],
      ])(
        'should fall back from %s to %s',
        (_currentMonth, dateStr, expected, _fallbackMonth) => {
          const date = new Date(dateStr)
          expect(getCurrentBashoId(date)).toBe(expected)
        }
      )
    })

    it('should use current date when no argument provided', () => {
      const mockDate = new Date('2026-03-10')
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      expect(getCurrentBashoId()).toBe('202603')

      vi.useRealTimers()
    })

    it('should return 6-character bashoId', () => {
      const date = new Date('2026-01-15')
      const bashoId = getCurrentBashoId(date)
      expect(bashoId).toHaveLength(6)
    })
  })

  describe('parseBashoId', () => {
    it('should correctly parse bashoId into year and month', () => {
      expect(parseBashoId('202601')).toEqual({ year: 2026, month: 1 })
    })

    it.each([
      ['202603', { year: 2026, month: 3 }],
      ['202611', { year: 2026, month: 11 }],
      ['199901', { year: 1999, month: 1 }],
      ['205512', { year: 2055, month: 12 }],
    ])('should parse %s correctly', (bashoId, expected) => {
      expect(parseBashoId(bashoId)).toEqual(expected)
    })
  })

  describe('isValidBashoId', () => {
    describe('valid basho months', () => {
      it.each(['202601', '202603', '202605', '202607', '202609', '202611'])(
        'should return true for %s',
        (bashoId) => {
          expect(isValidBashoId(bashoId)).toBe(true)
        }
      )
    })

    describe('invalid months (even months)', () => {
      it.each(['202602', '202604', '202606', '202608', '202610', '202612'])(
        'should return false for %s',
        (bashoId) => {
          expect(isValidBashoId(bashoId)).toBe(false)
        }
      )
    })

    describe('invalid format', () => {
      it.each([
        ['20260', 'too short'],
        ['2026011', 'too long'],
        ['abcd01', 'non-numeric'],
        ['', 'empty string'],
      ])('should return false for %s (%s)', (bashoId) => {
        expect(isValidBashoId(bashoId)).toBe(false)
      })

      it.each([null, undefined, 123456, {}, []])(
        'should return false for non-string value: %s',
        (value) => {
          expect(isValidBashoId(value)).toBe(false)
        }
      )
    })

    describe('unrealistic years', () => {
      it.each([
        ['189901', 'before 1900'],
        ['210101', 'after 2100'],
      ])('should return false for %s (%s)', (bashoId) => {
        expect(isValidBashoId(bashoId)).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should return true for earliest valid year (1900)', () => {
        expect(isValidBashoId('190001')).toBe(true)
      })

      it('should return true for latest valid year (2100)', () => {
        expect(isValidBashoId('210001')).toBe(true)
      })
    })
  })

  describe('BASHO_NICKNAMES', () => {
    it('should have nicknames for all valid basho months', () => {
      expect(BASHO_NICKNAMES[1]).toBeDefined()
      expect(BASHO_NICKNAMES[3]).toBeDefined()
      expect(BASHO_NICKNAMES[5]).toBeDefined()
      expect(BASHO_NICKNAMES[7]).toBeDefined()
      expect(BASHO_NICKNAMES[9]).toBeDefined()
      expect(BASHO_NICKNAMES[11]).toBeDefined()
    })

    it('should have correct structure for each nickname', () => {
      Object.values(BASHO_NICKNAMES).forEach((nickname) => {
        expect(nickname).toHaveProperty('short')
        expect(nickname).toHaveProperty('full')
        expect(nickname).toHaveProperty('japanese')
        expect(nickname).toHaveProperty('description')
      })
    })

    it('should have correct nickname for January (Hatsu)', () => {
      expect(BASHO_NICKNAMES[1]).toEqual({
        short: 'Hatsu',
        full: 'Hatsu Basho',
        japanese: '初場所',
        description: 'Opening Tournament',
      })
    })
  })

  describe('formatBashoDate', () => {
    it.each([
      ['202601', 'Jan 2026, Hatsu'],
      ['202603', 'Mar 2026, Haru'],
      ['202605', 'May 2026, Natsu'],
      ['202607', 'Jul 2026, Nagoya'],
      ['202609', 'Sep 2026, Aki'],
      ['202611', 'Nov 2026, Kyushu'],
    ])('should format %s as %s', (bashoId, expected) => {
      expect(formatBashoDate(bashoId)).toBe(expected)
    })

    it('should handle different years', () => {
      expect(formatBashoDate('199903')).toBe('Mar 1999, Haru')
      expect(formatBashoDate('205511')).toBe('Nov 2055, Kyushu')
    })

    it('should return empty string for falsy input', () => {
      expect(formatBashoDate('')).toBe('')
      expect(formatBashoDate(null)).toBe('')
      expect(formatBashoDate(undefined)).toBe('')
    })
  })

  describe('formatBashoDateFull', () => {
    it('should format with start and end dates', () => {
      const result = formatBashoDateFull(
        '202601',
        '2026-01-11T00:00:00Z',
        '2026-01-25T00:00:00Z'
      )
      expect(result).toBe('11 - 25 Jan 2026, Hatsu Basho (初場所 "Opening Tournament")')
    })

    it('should format March basho correctly', () => {
      const result = formatBashoDateFull(
        '202603',
        '2026-03-08T00:00:00Z',
        '2026-03-22T00:00:00Z'
      )
      expect(result).toBe('8 - 22 Mar 2026, Haru Basho (春場所 "Spring Tournament")')
    })

    it('should fallback to formatBashoDate when dates missing', () => {
      expect(formatBashoDateFull('202601', null, null)).toBe('Jan 2026, Hatsu')
      expect(formatBashoDateFull('202601', undefined, undefined)).toBe('Jan 2026, Hatsu')
    })

    it('should fallback when only startDate provided', () => {
      expect(formatBashoDateFull('202601', '2026-01-11T00:00:00Z', null)).toBe('Jan 2026, Hatsu')
    })

    it('should fallback when only endDate provided', () => {
      expect(formatBashoDateFull('202601', null, '2026-01-25T00:00:00Z')).toBe('Jan 2026, Hatsu')
    })

    it('should return empty string for empty bashoId', () => {
      expect(formatBashoDateFull('', '2026-01-11T00:00:00Z', '2026-01-25T00:00:00Z')).toBe('')
    })
  })

  describe('generateBashoIdList', () => {
    it('should generate bashoIds in descending order', () => {
      const list = generateBashoIdList('202601', '202611')
      expect(list).toEqual(['202611', '202609', '202607', '202605', '202603', '202601'])
    })

    it('should handle single basho', () => {
      const list = generateBashoIdList('202601', '202601')
      expect(list).toEqual(['202601'])
    })

    it('should handle cross-year range', () => {
      const list = generateBashoIdList('202511', '202603')
      expect(list).toEqual(['202603', '202601', '202511'])
    })

    it('should generate correct number of bashos for a full year', () => {
      const list = generateBashoIdList('202601', '202611')
      expect(list).toHaveLength(6) // 6 bashos per year
    })

    it('should use default start basho (195803) when not provided', () => {
      const list = generateBashoIdList(undefined, '195805')
      expect(list).toEqual(['195805', '195803'])
    })

    it('should handle multi-year range', () => {
      const list = generateBashoIdList('202501', '202601')
      expect(list).toHaveLength(7) // 6 in 2025 + 1 in 2026
      expect(list[0]).toBe('202601')
      expect(list[list.length - 1]).toBe('202501')
    })

    it('should only include valid basho months', () => {
      const list = generateBashoIdList('202601', '202611')
      const validMonths = ['01', '03', '05', '07', '09', '11']
      list.forEach((bashoId) => {
        const month = bashoId.substring(4)
        expect(validMonths).toContain(month)
      })
    })
  })
})
