import { describe, it, expect } from 'vitest'
import { AWARD_TYPES, AWARD_INFO, getWrestlerAwards } from '../../utils/awards'

describe('awards utilities', () => {
  describe('AWARD_TYPES', () => {
    it('should have all expected award types', () => {
      expect(AWARD_TYPES).toEqual({
        YUSHO: 'yusho',
        SHUKUN_SHO: 'Shukun-sho',
        KANTO_SHO: 'Kanto-sho',
        GINO_SHO: 'Gino-sho',
      })
    })
  })

  describe('AWARD_INFO', () => {
    it('should have info for all award types', () => {
      expect(Object.keys(AWARD_INFO)).toHaveLength(4)
      expect(AWARD_INFO[AWARD_TYPES.YUSHO]).toBeDefined()
      expect(AWARD_INFO[AWARD_TYPES.SHUKUN_SHO]).toBeDefined()
      expect(AWARD_INFO[AWARD_TYPES.KANTO_SHO]).toBeDefined()
      expect(AWARD_INFO[AWARD_TYPES.GINO_SHO]).toBeDefined()
    })

    it('should have correct yusho info', () => {
      expect(AWARD_INFO[AWARD_TYPES.YUSHO]).toEqual({
        abbrev: 'Y',
        icon: '🏆',
        nameEn: 'Yusho',
        nameJp: '優勝',
        description: 'Tournament Champion',
      })
    })

    it('should have correct structure for all awards', () => {
      Object.values(AWARD_INFO).forEach((info) => {
        expect(info).toHaveProperty('abbrev')
        expect(info).toHaveProperty('icon')
        expect(info).toHaveProperty('nameEn')
        expect(info).toHaveProperty('nameJp')
        expect(info).toHaveProperty('description')
      })
    })
  })

  describe('getWrestlerAwards', () => {
    const mockBashoResults = {
      yusho: [
        { type: 'Makuuchi', rikishiId: 1 },
        { type: 'Juryo', rikishiId: 2 },
      ],
      specialPrizes: [
        { type: 'Shukun-sho', rikishiId: 3 },
        { type: 'Kanto-sho', rikishiId: 4 },
        { type: 'Gino-sho', rikishiId: 5 },
        { type: 'Kanto-sho', rikishiId: 1 }, // Yusho winner also gets Kanto-sho
      ],
    }

    describe('yusho awards', () => {
      it('should return yusho for Makuuchi champion', () => {
        const awards = getWrestlerAwards(1, mockBashoResults, 'Makuuchi')
        expect(awards).toContain(AWARD_TYPES.YUSHO)
      })

      it('should return yusho for Juryo champion', () => {
        const awards = getWrestlerAwards(2, mockBashoResults, 'Juryo')
        expect(awards).toContain(AWARD_TYPES.YUSHO)
      })

      it('should not return yusho for non-champion', () => {
        const awards = getWrestlerAwards(99, mockBashoResults, 'Makuuchi')
        expect(awards).not.toContain(AWARD_TYPES.YUSHO)
      })

      it('should not return yusho for wrong division', () => {
        const awards = getWrestlerAwards(1, mockBashoResults, 'Juryo')
        expect(awards).not.toContain(AWARD_TYPES.YUSHO)
      })
    })

    describe('special prizes', () => {
      it('should return special prizes for Makuuchi wrestlers', () => {
        expect(getWrestlerAwards(3, mockBashoResults, 'Makuuchi')).toContain(
          AWARD_TYPES.SHUKUN_SHO
        )
        expect(getWrestlerAwards(4, mockBashoResults, 'Makuuchi')).toContain(
          AWARD_TYPES.KANTO_SHO
        )
        expect(getWrestlerAwards(5, mockBashoResults, 'Makuuchi')).toContain(
          AWARD_TYPES.GINO_SHO
        )
      })

      it('should not return special prizes for non-Makuuchi divisions', () => {
        const awards = getWrestlerAwards(3, mockBashoResults, 'Juryo')
        expect(awards).not.toContain(AWARD_TYPES.SHUKUN_SHO)
      })
    })

    describe('multiple awards', () => {
      it('should return multiple awards when wrestler has both yusho and special prize', () => {
        const awards = getWrestlerAwards(1, mockBashoResults, 'Makuuchi')
        expect(awards).toContain(AWARD_TYPES.YUSHO)
        expect(awards).toContain(AWARD_TYPES.KANTO_SHO)
        expect(awards).toHaveLength(2)
      })
    })

    describe('edge cases', () => {
      it('should return empty array when bashoResults is null', () => {
        expect(getWrestlerAwards(1, null, 'Makuuchi')).toEqual([])
      })

      it('should return empty array when bashoResults is undefined', () => {
        expect(getWrestlerAwards(1, undefined, 'Makuuchi')).toEqual([])
      })

      it('should return empty array when rikishiId is null', () => {
        expect(getWrestlerAwards(null, mockBashoResults, 'Makuuchi')).toEqual([])
      })

      it('should return empty array when rikishiId is 0', () => {
        expect(getWrestlerAwards(0, mockBashoResults, 'Makuuchi')).toEqual([])
      })

      it('should handle missing yusho array', () => {
        const results = { specialPrizes: [] }
        expect(getWrestlerAwards(1, results, 'Makuuchi')).toEqual([])
      })

      it('should handle missing specialPrizes array', () => {
        const results = { yusho: [{ type: 'Makuuchi', rikishiId: 1 }] }
        const awards = getWrestlerAwards(1, results, 'Makuuchi')
        expect(awards).toContain(AWARD_TYPES.YUSHO)
        expect(awards).toHaveLength(1)
      })

      it('should return empty array when wrestler has no awards', () => {
        expect(getWrestlerAwards(999, mockBashoResults, 'Makuuchi')).toEqual([])
      })
    })
  })
})
