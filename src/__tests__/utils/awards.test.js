import { describe, it, expect } from 'vitest'
import {
  AWARD_TYPES,
  AWARD_INFO,
  RECORD_STATUS_TYPES,
  RECORD_STATUS_INFO,
  SEKITORI_DIVISIONS,
  getWrestlerAwards,
  getRecordStatus,
  isYokozuna,
  isMaegashira,
  buildRankLookup,
  getKinboshiCount,
  isKinboshiMatch,
} from '../../utils/awards'

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

  describe('RECORD_STATUS_TYPES', () => {
    it('should have kachi-koshi and make-koshi types', () => {
      expect(RECORD_STATUS_TYPES).toEqual({
        KACHI_KOSHI: 'kachi-koshi',
        MAKE_KOSHI: 'make-koshi',
      })
    })
  })

  describe('RECORD_STATUS_INFO', () => {
    it('should have info for kachi-koshi', () => {
      expect(RECORD_STATUS_INFO[RECORD_STATUS_TYPES.KACHI_KOSHI]).toEqual({
        abbrev: 'KK',
        nameEn: 'Kachi-koshi',
        nameJp: '勝ち越し',
        description: 'Winning Record',
        color: 'green',
      })
    })

    it('should have info for make-koshi', () => {
      expect(RECORD_STATUS_INFO[RECORD_STATUS_TYPES.MAKE_KOSHI]).toEqual({
        abbrev: 'MK',
        nameEn: 'Make-koshi',
        nameJp: '負け越し',
        description: 'Losing Record',
        color: 'red',
      })
    })
  })

  describe('SEKITORI_DIVISIONS', () => {
    it('should include Makuuchi and Juryo', () => {
      expect(SEKITORI_DIVISIONS).toContain('Makuuchi')
      expect(SEKITORI_DIVISIONS).toContain('Juryo')
      expect(SEKITORI_DIVISIONS).toHaveLength(2)
    })
  })

  describe('getRecordStatus', () => {
    describe('sekitori divisions (Makuuchi, Juryo)', () => {
      it('should return kachi-koshi for 8+ wins in Makuuchi', () => {
        expect(getRecordStatus(8, 7, 'Makuuchi')).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
        expect(getRecordStatus(10, 5, 'Makuuchi')).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
        expect(getRecordStatus(15, 0, 'Makuuchi')).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
      })

      it('should return make-koshi for 8+ losses in Makuuchi', () => {
        expect(getRecordStatus(7, 8, 'Makuuchi')).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
        expect(getRecordStatus(5, 10, 'Makuuchi')).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
        expect(getRecordStatus(0, 15, 'Makuuchi')).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })

      it('should return null if record not yet determined in Makuuchi', () => {
        expect(getRecordStatus(7, 7, 'Makuuchi')).toBeNull()
        expect(getRecordStatus(5, 5, 'Makuuchi')).toBeNull()
        expect(getRecordStatus(0, 0, 'Makuuchi')).toBeNull()
      })

      it('should return kachi-koshi for 8+ wins in Juryo', () => {
        expect(getRecordStatus(8, 7, 'Juryo')).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
      })

      it('should return make-koshi for 8+ losses in Juryo', () => {
        expect(getRecordStatus(7, 8, 'Juryo')).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })
    })

    describe('amateur/apprentice divisions', () => {
      it('should return kachi-koshi for 4+ wins in Makushita', () => {
        expect(getRecordStatus(4, 3, 'Makushita')).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
        expect(getRecordStatus(7, 0, 'Makushita')).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
      })

      it('should return make-koshi for 4+ losses in Makushita', () => {
        expect(getRecordStatus(3, 4, 'Makushita')).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
        expect(getRecordStatus(0, 7, 'Makushita')).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })

      it('should return null if record not yet determined in Makushita', () => {
        expect(getRecordStatus(3, 3, 'Makushita')).toBeNull()
        expect(getRecordStatus(2, 2, 'Makushita')).toBeNull()
      })

      it('should use amateur threshold for Sandanme', () => {
        expect(getRecordStatus(4, 3, 'Sandanme')).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
        expect(getRecordStatus(3, 4, 'Sandanme')).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })

      it('should use amateur threshold for Jonidan', () => {
        expect(getRecordStatus(4, 3, 'Jonidan')).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
        expect(getRecordStatus(3, 4, 'Jonidan')).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })

      it('should use amateur threshold for Jonokuchi', () => {
        expect(getRecordStatus(4, 3, 'Jonokuchi')).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
        expect(getRecordStatus(3, 4, 'Jonokuchi')).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })
    })

    describe('absences counting towards losses', () => {
      it('should count absences towards losses in Makuuchi', () => {
        // 7 losses + 1 absence = 8 total losses
        expect(getRecordStatus(7, 7, 'Makuuchi', 1)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
        // 5 losses + 3 absences = 8 total losses
        expect(getRecordStatus(7, 5, 'Makuuchi', 3)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
        // 0 losses + 15 absences = 15 total losses (full absence)
        expect(getRecordStatus(0, 0, 'Makuuchi', 15)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })

      it('should count absences towards losses in amateur divisions', () => {
        // 3 losses + 1 absence = 4 total losses
        expect(getRecordStatus(3, 3, 'Makushita', 1)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
        // 2 losses + 2 absences = 4 total losses
        expect(getRecordStatus(3, 2, 'Makushita', 2)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })

      it('should not affect kachi-koshi determination', () => {
        // Wins still need to reach threshold regardless of absences
        expect(getRecordStatus(8, 5, 'Makuuchi', 2)).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
        expect(getRecordStatus(4, 2, 'Makushita', 1)).toBe(RECORD_STATUS_TYPES.KACHI_KOSHI)
      })

      it('should default absences to 0 when not provided', () => {
        expect(getRecordStatus(7, 7, 'Makuuchi')).toBeNull()
        expect(getRecordStatus(3, 3, 'Makushita')).toBeNull()
      })

      it('should return null when neither threshold is met including absences', () => {
        expect(getRecordStatus(5, 5, 'Makuuchi', 2)).toBeNull()
        expect(getRecordStatus(3, 2, 'Makushita', 1)).toBeNull()
      })
    })
  })

  describe('isYokozuna', () => {
    it('should return true for Yokozuna ranks', () => {
      expect(isYokozuna('Yokozuna 1 East')).toBe(true)
      expect(isYokozuna('Yokozuna 1 West')).toBe(true)
      expect(isYokozuna('Yokozuna')).toBe(true)
    })

    it('should return false for non-Yokozuna ranks', () => {
      expect(isYokozuna('Ozeki 1 East')).toBe(false)
      expect(isYokozuna('Maegashira 5 West')).toBe(false)
      expect(isYokozuna('Sekiwake 1 East')).toBe(false)
    })

    it('should return false for null or undefined', () => {
      expect(isYokozuna(null)).toBe(false)
      expect(isYokozuna(undefined)).toBe(false)
      expect(isYokozuna('')).toBe(false)
    })

    it('should be case insensitive', () => {
      expect(isYokozuna('yokozuna 1 east')).toBe(true)
      expect(isYokozuna('YOKOZUNA 1 EAST')).toBe(true)
    })
  })

  describe('isMaegashira', () => {
    it('should return true for Maegashira ranks', () => {
      expect(isMaegashira('Maegashira 1 East')).toBe(true)
      expect(isMaegashira('Maegashira 17 West')).toBe(true)
      expect(isMaegashira('Maegashira')).toBe(true)
    })

    it('should return false for non-Maegashira ranks', () => {
      expect(isMaegashira('Yokozuna 1 East')).toBe(false)
      expect(isMaegashira('Ozeki 1 East')).toBe(false)
      expect(isMaegashira('Komusubi 1 West')).toBe(false)
    })

    it('should return false for null or undefined', () => {
      expect(isMaegashira(null)).toBe(false)
      expect(isMaegashira(undefined)).toBe(false)
      expect(isMaegashira('')).toBe(false)
    })

    it('should be case insensitive', () => {
      expect(isMaegashira('maegashira 5 west')).toBe(true)
      expect(isMaegashira('MAEGASHIRA 5 WEST')).toBe(true)
    })
  })

  describe('buildRankLookup', () => {
    const eastWrestlers = [
      { rikishiID: 1, rank: 'Yokozuna 1 East' },
      { rikishiID: 2, rank: 'Ozeki 1 East' },
    ]
    const westWrestlers = [
      { rikishiID: 3, rank: 'Maegashira 1 West' },
      { rikishiID: 4, rank: 'Maegashira 2 West' },
    ]

    it('should build a map of rikishiID to rank', () => {
      const lookup = buildRankLookup(eastWrestlers, westWrestlers)
      expect(lookup.get(1)).toBe('Yokozuna 1 East')
      expect(lookup.get(2)).toBe('Ozeki 1 East')
      expect(lookup.get(3)).toBe('Maegashira 1 West')
      expect(lookup.get(4)).toBe('Maegashira 2 West')
    })

    it('should handle empty arrays', () => {
      const lookup = buildRankLookup([], [])
      expect(lookup.size).toBe(0)
    })

    it('should handle undefined arrays', () => {
      const lookup = buildRankLookup(undefined, undefined)
      expect(lookup.size).toBe(0)
    })

    it('should skip wrestlers without rikishiID or rank', () => {
      const wrestlers = [
        { rikishiID: 1, rank: 'Yokozuna 1 East' },
        { rikishiID: null, rank: 'Ozeki 1 East' },
        { rikishiID: 2, rank: null },
        { rikishiID: 3 },
      ]
      const lookup = buildRankLookup(wrestlers, [])
      expect(lookup.size).toBe(1)
      expect(lookup.get(1)).toBe('Yokozuna 1 East')
    })
  })

  describe('getKinboshiCount', () => {
    const rankLookup = new Map([
      [1, 'Yokozuna 1 East'],
      [2, 'Yokozuna 1 West'],
      [3, 'Maegashira 5 East'],
      [4, 'Maegashira 10 West'],
      [5, 'Ozeki 1 East'],
    ])

    describe('for Maegashira wrestlers', () => {
      it('should count wins against Yokozuna', () => {
        const record = [
          { result: 'win', opponentID: 1 }, // vs Yokozuna - kinboshi
          { result: 'win', opponentID: 2 }, // vs Yokozuna - kinboshi
          { result: 'loss', opponentID: 5 }, // vs Ozeki - not kinboshi
        ]
        expect(getKinboshiCount('Maegashira 5 East', record, rankLookup)).toBe(2)
      })

      it('should not count losses against Yokozuna', () => {
        const record = [
          { result: 'loss', opponentID: 1 }, // loss vs Yokozuna - not kinboshi
          { result: 'win', opponentID: 5 }, // win vs Ozeki - not kinboshi
        ]
        expect(getKinboshiCount('Maegashira 5 East', record, rankLookup)).toBe(0)
      })

      it('should not count wins against non-Yokozuna', () => {
        const record = [
          { result: 'win', opponentID: 5 }, // vs Ozeki - not kinboshi
          { result: 'win', opponentID: 4 }, // vs Maegashira - not kinboshi
        ]
        expect(getKinboshiCount('Maegashira 5 East', record, rankLookup)).toBe(0)
      })
    })

    describe('for Yokozuna wrestlers', () => {
      it('should count losses against Maegashira', () => {
        const record = [
          { result: 'loss', opponentID: 3 }, // vs Maegashira - kinboshi given
          { result: 'loss', opponentID: 4 }, // vs Maegashira - kinboshi given
          { result: 'win', opponentID: 5 }, // vs Ozeki - not relevant
        ]
        expect(getKinboshiCount('Yokozuna 1 East', record, rankLookup)).toBe(2)
      })

      it('should not count wins against Maegashira', () => {
        const record = [
          { result: 'win', opponentID: 3 }, // win vs Maegashira - not kinboshi
          { result: 'win', opponentID: 4 }, // win vs Maegashira - not kinboshi
        ]
        expect(getKinboshiCount('Yokozuna 1 East', record, rankLookup)).toBe(0)
      })

      it('should not count losses against non-Maegashira', () => {
        const record = [
          { result: 'loss', opponentID: 5 }, // loss vs Ozeki - not kinboshi
          { result: 'loss', opponentID: 2 }, // loss vs Yokozuna - not kinboshi
        ]
        expect(getKinboshiCount('Yokozuna 1 East', record, rankLookup)).toBe(0)
      })
    })

    describe('for other ranks', () => {
      it('should return 0 for Ozeki', () => {
        const record = [
          { result: 'win', opponentID: 1 },
          { result: 'loss', opponentID: 3 },
        ]
        expect(getKinboshiCount('Ozeki 1 East', record, rankLookup)).toBe(0)
      })

      it('should return 0 for Sekiwake', () => {
        const record = [{ result: 'win', opponentID: 1 }]
        expect(getKinboshiCount('Sekiwake 1 East', record, rankLookup)).toBe(0)
      })
    })

    describe('edge cases', () => {
      it('should return 0 for null record', () => {
        expect(getKinboshiCount('Maegashira 5 East', null, rankLookup)).toBe(0)
      })

      it('should return 0 for undefined record', () => {
        expect(getKinboshiCount('Maegashira 5 East', undefined, rankLookup)).toBe(0)
      })

      it('should return 0 for empty record', () => {
        expect(getKinboshiCount('Maegashira 5 East', [], rankLookup)).toBe(0)
      })

      it('should return 0 for null rankLookup', () => {
        const record = [{ result: 'win', opponentID: 1 }]
        expect(getKinboshiCount('Maegashira 5 East', record, null)).toBe(0)
      })

      it('should handle opponent not in lookup', () => {
        const record = [{ result: 'win', opponentID: 999 }]
        expect(getKinboshiCount('Maegashira 5 East', record, rankLookup)).toBe(0)
      })
    })
  })

  describe('isKinboshiMatch', () => {
    const rankLookup = new Map([
      [1, 'Yokozuna 1 East'],
      [2, 'Maegashira 5 West'],
    ])

    describe('for Maegashira wrestlers', () => {
      it('should return true for win against Yokozuna', () => {
        const match = { result: 'win', opponentID: 1 }
        expect(isKinboshiMatch('Maegashira 5 East', match, rankLookup)).toBe(true)
      })

      it('should return false for loss against Yokozuna', () => {
        const match = { result: 'loss', opponentID: 1 }
        expect(isKinboshiMatch('Maegashira 5 East', match, rankLookup)).toBe(false)
      })

      it('should return false for win against non-Yokozuna', () => {
        const match = { result: 'win', opponentID: 2 }
        expect(isKinboshiMatch('Maegashira 5 East', match, rankLookup)).toBe(false)
      })
    })

    describe('for Yokozuna wrestlers', () => {
      it('should return true for loss against Maegashira', () => {
        const match = { result: 'loss', opponentID: 2 }
        expect(isKinboshiMatch('Yokozuna 1 East', match, rankLookup)).toBe(true)
      })

      it('should return false for win against Maegashira', () => {
        const match = { result: 'win', opponentID: 2 }
        expect(isKinboshiMatch('Yokozuna 1 East', match, rankLookup)).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should return false for null match', () => {
        expect(isKinboshiMatch('Maegashira 5 East', null, rankLookup)).toBe(false)
      })

      it('should return false for null rankLookup', () => {
        const match = { result: 'win', opponentID: 1 }
        expect(isKinboshiMatch('Maegashira 5 East', match, null)).toBe(false)
      })

      it('should return false for Ozeki wrestler', () => {
        const match = { result: 'win', opponentID: 1 }
        expect(isKinboshiMatch('Ozeki 1 East', match, rankLookup)).toBe(false)
      })
    })
  })
})
