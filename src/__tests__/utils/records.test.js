import { describe, it, expect } from 'vitest'
import {
  SEKITORI_DIVISIONS,
  RECORD_STATUS_TYPES,
  RECORD_STATUS_INFO,
  getRecordStatus,
  computeRecordOnDay,
  isAbsentKyujo,
  isYokozuna,
  isMaegashira,
  buildRankLookup,
  getKinboshiCount,
  isKinboshiMatch,
} from '../../utils/records'

describe('records utilities', () => {
  describe('SEKITORI_DIVISIONS', () => {
    it('should include Makuuchi and Juryo', () => {
      expect(SEKITORI_DIVISIONS).toContain('Makuuchi')
      expect(SEKITORI_DIVISIONS).toContain('Juryo')
      expect(SEKITORI_DIVISIONS).toHaveLength(2)
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
        expect(getRecordStatus(7, 7, 'Makuuchi', 1)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
        expect(getRecordStatus(7, 5, 'Makuuchi', 3)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
        expect(getRecordStatus(0, 0, 'Makuuchi', 15)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })

      it('should count absences towards losses in amateur divisions', () => {
        expect(getRecordStatus(3, 3, 'Makushita', 1)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
        expect(getRecordStatus(3, 2, 'Makushita', 2)).toBe(RECORD_STATUS_TYPES.MAKE_KOSHI)
      })

      it('should not affect kachi-koshi determination', () => {
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

  describe('computeRecordOnDay', () => {
    const r = (result) => ({ result })

    it('returns null for falsy day', () => {
      expect(computeRecordOnDay([r('win')], 0)).toBeNull()
      expect(computeRecordOnDay([r('win')], null)).toBeNull()
    })

    it('returns null for non-array record', () => {
      expect(computeRecordOnDay(null, 5)).toBeNull()
      expect(computeRecordOnDay(undefined, 5)).toBeNull()
    })

    it('counts wins, losses, and all absences without division (legacy behaviour)', () => {
      const record = [r('win'), r('absent'), r('loss'), r('absent'), r('win')]
      expect(computeRecordOnDay(record, 5)).toEqual({ wins: 2, losses: 1, absences: 2 })
    })

    it('stops at undefined or empty-string result', () => {
      const record = [r('win'), r('loss'), { result: '' }, r('win')]
      expect(computeRecordOnDay(record, 4)).toEqual({ wins: 1, losses: 1, absences: 0 })
    })

    it('counts fusen win and fusen loss correctly', () => {
      const record = [r('fusen win'), r('fusen loss')]
      expect(computeRecordOnDay(record, 2)).toEqual({ wins: 1, losses: 1, absences: 0 })
    })

    describe('with division — kyujo-aware absence counting', () => {
      it('counts all absences for sekitori because every absence is genuine kyujo', () => {
        // day 2 is absent with future bouts — still counted for sekitori
        const record = [r('win'), r('absent'), r('win'), r('loss')]
        expect(computeRecordOnDay(record, 2, 'Makuuchi')).toEqual({ wins: 1, losses: 0, absences: 1 })
        expect(computeRecordOnDay(record, 2, 'Juryo')).toEqual({ wins: 1, losses: 0, absences: 1 })
      })

      it('does not count a scheduled off-day absence for lower divisions when future bouts exist', () => {
        // record has a bout on day 1, an off-day on day 2, then a bout on day 3
        const record = [r('win'), r('absent'), r('loss')]
        // on day 2 the 'absent' is a scheduled off-day (future bouts remain)
        expect(computeRecordOnDay(record, 2, 'Makushita')).toEqual({ wins: 1, losses: 0, absences: 0 })
      })

      it('counts a genuine kyujo for lower divisions when no future bouts follow', () => {
        // wrestler withdrew: absent on day 2 with nothing after
        const record = [r('win'), r('absent'), r('absent')]
        expect(computeRecordOnDay(record, 3, 'Sandanme')).toEqual({ wins: 1, losses: 0, absences: 2 })
      })

      it('does not misidentify lower-division off-days mid-tournament as kyujo', () => {
        // 4 bouts fought in alternating days typical of lower divisions
        const record = [r('win'), r('absent'), r('loss'), r('absent'), r('win'), r('absent'), r('win')]
        // on day 7, final state: 3 wins, 1 loss, 0 real absences (all absent entries have future bouts)
        // Wait, the last entry IS a win so by day 7 we're at the actual last entry — no future bouts needed
        // Actually: let's check through day 6 where day 6 is 'absent' with a 'win' after
        expect(computeRecordOnDay(record, 6, 'Jonidan')).toEqual({ wins: 2, losses: 1, absences: 0 })
        expect(computeRecordOnDay(record, 7, 'Jonidan')).toEqual({ wins: 3, losses: 1, absences: 0 })
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
      expect(buildRankLookup([], []).size).toBe(0)
    })

    it('should handle undefined arrays', () => {
      expect(buildRankLookup(undefined, undefined).size).toBe(0)
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
          { result: 'win', opponentID: 1 },
          { result: 'win', opponentID: 2 },
          { result: 'loss', opponentID: 5 },
        ]
        expect(getKinboshiCount('Maegashira 5 East', record, rankLookup)).toBe(2)
      })

      it('should not count losses against Yokozuna', () => {
        const record = [
          { result: 'loss', opponentID: 1 },
          { result: 'win', opponentID: 5 },
        ]
        expect(getKinboshiCount('Maegashira 5 East', record, rankLookup)).toBe(0)
      })

      it('should not count wins against non-Yokozuna', () => {
        const record = [
          { result: 'win', opponentID: 5 },
          { result: 'win', opponentID: 4 },
        ]
        expect(getKinboshiCount('Maegashira 5 East', record, rankLookup)).toBe(0)
      })
    })

    describe('for Yokozuna wrestlers', () => {
      it('should count losses against Maegashira', () => {
        const record = [
          { result: 'loss', opponentID: 3 },
          { result: 'loss', opponentID: 4 },
          { result: 'win', opponentID: 5 },
        ]
        expect(getKinboshiCount('Yokozuna 1 East', record, rankLookup)).toBe(2)
      })

      it('should not count wins against Maegashira', () => {
        const record = [
          { result: 'win', opponentID: 3 },
          { result: 'win', opponentID: 4 },
        ]
        expect(getKinboshiCount('Yokozuna 1 East', record, rankLookup)).toBe(0)
      })

      it('should not count losses against non-Maegashira', () => {
        const record = [
          { result: 'loss', opponentID: 5 },
          { result: 'loss', opponentID: 2 },
        ]
        expect(getKinboshiCount('Yokozuna 1 East', record, rankLookup)).toBe(0)
      })
    })

    describe('for other ranks', () => {
      it('should return 0 for Ozeki', () => {
        const record = [{ result: 'win', opponentID: 1 }, { result: 'loss', opponentID: 3 }]
        expect(getKinboshiCount('Ozeki 1 East', record, rankLookup)).toBe(0)
      })

      it('should return 0 for Sekiwake', () => {
        expect(getKinboshiCount('Sekiwake 1 East', [{ result: 'win', opponentID: 1 }], rankLookup)).toBe(0)
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
        expect(getKinboshiCount('Maegashira 5 East', [{ result: 'win', opponentID: 1 }], null)).toBe(0)
      })

      it('should handle opponent not in lookup', () => {
        expect(getKinboshiCount('Maegashira 5 East', [{ result: 'win', opponentID: 999 }], rankLookup)).toBe(0)
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
        expect(isKinboshiMatch('Maegashira 5 East', { result: 'win', opponentID: 1 }, rankLookup)).toBe(true)
      })

      it('should return false for loss against Yokozuna', () => {
        expect(isKinboshiMatch('Maegashira 5 East', { result: 'loss', opponentID: 1 }, rankLookup)).toBe(false)
      })

      it('should return false for win against non-Yokozuna', () => {
        expect(isKinboshiMatch('Maegashira 5 East', { result: 'win', opponentID: 2 }, rankLookup)).toBe(false)
      })
    })

    describe('for Yokozuna wrestlers', () => {
      it('should return true for loss against Maegashira', () => {
        expect(isKinboshiMatch('Yokozuna 1 East', { result: 'loss', opponentID: 2 }, rankLookup)).toBe(true)
      })

      it('should return false for win against Maegashira', () => {
        expect(isKinboshiMatch('Yokozuna 1 East', { result: 'win', opponentID: 2 }, rankLookup)).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should return false for null match', () => {
        expect(isKinboshiMatch('Maegashira 5 East', null, rankLookup)).toBe(false)
      })

      it('should return false for null rankLookup', () => {
        expect(isKinboshiMatch('Maegashira 5 East', { result: 'win', opponentID: 1 }, null)).toBe(false)
      })

      it('should return false for Ozeki wrestler', () => {
        expect(isKinboshiMatch('Ozeki 1 East', { result: 'win', opponentID: 1 }, rankLookup)).toBe(false)
      })
    })
  })

  describe('isAbsentKyujo', () => {
    const r = (result) => ({ result })

    describe('sekitori divisions', () => {
      it('returns true for Makuuchi — every absent is genuine kyujo', () => {
        expect(isAbsentKyujo([r('win'), r('absent'), r('win')], 2, 'Makuuchi')).toBe(true)
      })

      it('returns true for Juryo', () => {
        expect(isAbsentKyujo([r('win'), r('absent'), r('win')], 2, 'Juryo')).toBe(true)
      })
    })

    describe('lower divisions — scheduled non-fight day', () => {
      it('returns false when a win follows the absent day', () => {
        expect(isAbsentKyujo([r('win'), r('absent'), r('win')], 2, 'Makushita')).toBe(false)
      })

      it('returns false when a loss follows the absent day', () => {
        expect(isAbsentKyujo([r('win'), r('absent'), r('loss')], 2, 'Sandanme')).toBe(false)
      })

      it('returns false when a fusen win follows the absent day', () => {
        expect(isAbsentKyujo([r('win'), r('absent'), r('fusen win')], 2, 'Jonidan')).toBe(false)
      })
    })

    describe('lower divisions — genuine kyujo', () => {
      it('returns true when no bouts follow the absent day', () => {
        expect(isAbsentKyujo([r('win'), r('absent'), r('absent'), r('absent')], 2, 'Makushita')).toBe(true)
      })

      it('returns true when only future empty entries follow', () => {
        expect(isAbsentKyujo([r('win'), r('absent'), r(''), r('')], 2, 'Makushita')).toBe(true)
      })

      it('returns true when kyujo from the very start (no bouts at all)', () => {
        expect(isAbsentKyujo([r('absent'), r('absent'), r('absent')], 1, 'Jonokuchi')).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('returns false for non-array record', () => {
        expect(isAbsentKyujo(null, 1, 'Makushita')).toBe(false)
      })

      it('returns true when only fusen loss follows — not evidence of subsequent presence', () => {
        expect(isAbsentKyujo([r('win'), r('absent'), r('fusen loss')], 2, 'Makushita')).toBe(true)
      })
    })
  })
})
