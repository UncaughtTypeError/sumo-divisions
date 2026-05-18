import { describe, it, expect } from 'vitest'
import {
  VALID_BASHO_MONTHS,
  DIVISIONS,
  RANKS,
  PYRAMID_LEVELS,
  DIVISION_LEGEND,
  RANK_GROUPS,
  MATCH_RESULTS,
  RANK_ORDER,
  SEKITORI_RANK_ORDER,
  APPRENTICE_RANK_ORDER,
  RANK_ABBREVIATIONS,
  RANK_COLORS,
  RANK_TO_API_DIVISION,
} from '../../utils/constants'

describe('constants', () => {
  describe('VALID_BASHO_MONTHS', () => {
    it('should contain exactly 6 months', () => {
      expect(VALID_BASHO_MONTHS).toHaveLength(6)
    })

    it('should only contain odd months', () => {
      expect(VALID_BASHO_MONTHS).toEqual([1, 3, 5, 7, 9, 11])
    })

    it('should be in ascending order', () => {
      const sorted = [...VALID_BASHO_MONTHS].sort((a, b) => a - b)
      expect(VALID_BASHO_MONTHS).toEqual(sorted)
    })
  })

  describe('DIVISIONS', () => {
    it('should have 6 divisions', () => {
      expect(Object.keys(DIVISIONS)).toHaveLength(6)
    })

    it('should have all expected divisions', () => {
      expect(DIVISIONS).toEqual({
        MAKUUCHI: 'Makuuchi',
        JURYO: 'Juryo',
        MAKUSHITA: 'Makushita',
        SANDANME: 'Sandanme',
        JONIDAN: 'Jonidan',
        JONOKUCHI: 'Jonokuchi',
      })
    })
  })

  describe('RANKS', () => {
    it('should have 10 ranks', () => {
      expect(Object.keys(RANKS)).toHaveLength(10)
    })

    it('should have all expected ranks', () => {
      expect(RANKS).toHaveProperty('YOKOZUNA', 'Yokozuna')
      expect(RANKS).toHaveProperty('OZEKI', 'Ozeki')
      expect(RANKS).toHaveProperty('SEKIWAKE', 'Sekiwake')
      expect(RANKS).toHaveProperty('KOMUSUBI', 'Komusubi')
      expect(RANKS).toHaveProperty('MAEGASHIRA', 'Maegashira')
      expect(RANKS).toHaveProperty('JURYO', 'Juryo')
      expect(RANKS).toHaveProperty('MAKUSHITA', 'Makushita')
      expect(RANKS).toHaveProperty('SANDANME', 'Sandanme')
      expect(RANKS).toHaveProperty('JONIDAN', 'Jonidan')
      expect(RANKS).toHaveProperty('JONOKUCHI', 'Jonokuchi')
    })
  })

  describe('PYRAMID_LEVELS', () => {
    it('should have 10 levels', () => {
      expect(PYRAMID_LEVELS).toHaveLength(10)
    })

    it('should have sequential IDs from 1 to 10', () => {
      const ids = PYRAMID_LEVELS.map((level) => level.id)
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should have required properties for each level', () => {
      PYRAMID_LEVELS.forEach((level) => {
        expect(level).toHaveProperty('id')
        expect(level).toHaveProperty('rank')
        expect(level).toHaveProperty('division')
        expect(level).toHaveProperty('color')
        expect(level).toHaveProperty('apiDivision')
      })
    })

    it('should have correct structure for Yokozuna level', () => {
      const yokozuna = PYRAMID_LEVELS.find((l) => l.rank === RANKS.YOKOZUNA)
      expect(yokozuna).toEqual({
        id: 1,
        rank: RANKS.YOKOZUNA,
        division: DIVISIONS.MAKUUCHI,
        color: 'yokozuna',
        apiDivision: 'Makuuchi',
      })
    })

    it('should have all Makuuchi levels at the top (IDs 1-5)', () => {
      const makuuchiLevels = PYRAMID_LEVELS.filter(
        (l) => l.division === DIVISIONS.MAKUUCHI
      )
      expect(makuuchiLevels).toHaveLength(5)
      expect(makuuchiLevels.every((l) => l.id <= 5)).toBe(true)
    })
  })

  describe('DIVISION_LEGEND', () => {
    it('should have 6 entries matching divisions', () => {
      expect(DIVISION_LEGEND).toHaveLength(6)
    })

    it('should have required properties for each entry', () => {
      DIVISION_LEGEND.forEach((entry) => {
        expect(entry).toHaveProperty('name')
        expect(entry).toHaveProperty('description')
        expect(entry).toHaveProperty('color')
      })
    })

    it('should have correct division names', () => {
      const names = DIVISION_LEGEND.map((d) => d.name)
      expect(names).toEqual([
        DIVISIONS.MAKUUCHI,
        DIVISIONS.JURYO,
        DIVISIONS.MAKUSHITA,
        DIVISIONS.SANDANME,
        DIVISIONS.JONIDAN,
        DIVISIONS.JONOKUCHI,
      ])
    })

    it('should have sequential division descriptions', () => {
      DIVISION_LEGEND.forEach((entry, index) => {
        expect(entry.description).toBe(`Division ${index + 1}`)
      })
    })
  })

  describe('RANK_GROUPS', () => {
    it('should have 3 groups', () => {
      expect(RANK_GROUPS).toHaveLength(3)
    })

    it('should have required properties for each group', () => {
      RANK_GROUPS.forEach((group) => {
        expect(group).toHaveProperty('id')
        expect(group).toHaveProperty('name')
        expect(group).toHaveProperty('description')
        expect(group).toHaveProperty('levelIds')
        expect(group).toHaveProperty('color')
      })
    })

    it('should have correct sanyaku group', () => {
      const sanyaku = RANK_GROUPS.find((g) => g.id === 'sanyaku')
      expect(sanyaku).toEqual({
        id: 'sanyaku',
        name: "San'yaku",
        description: 'Three Ranks',
        levelIds: [1, 2, 3, 4],
        color: '#ff6b6b',
      })
    })

    it('should have correct sekitori group including all professional ranks', () => {
      const sekitori = RANK_GROUPS.find((g) => g.id === 'sekitori')
      expect(sekitori.levelIds).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should have correct minarai group for apprentices', () => {
      const minarai = RANK_GROUPS.find((g) => g.id === 'minarai')
      expect(minarai.levelIds).toEqual([7, 8, 9, 10])
    })
  })

  describe('MATCH_RESULTS', () => {
    it('should have all expected result types', () => {
      expect(MATCH_RESULTS).toEqual({
        WIN: 'win',
        LOSS: 'loss',
        FUSEN_WIN: 'fusen win',
        FUSEN_LOSS: 'fusen loss',
        ABSENT: 'absent',
        EMPTY: '',
      })
    })
  })

  describe('RANK_ORDER', () => {
    it('should contain all 10 ranks', () => {
      expect(RANK_ORDER).toHaveLength(10)
    })

    it('should start with Yokozuna and end with Jonokuchi', () => {
      expect(RANK_ORDER[0]).toBe('Yokozuna')
      expect(RANK_ORDER[RANK_ORDER.length - 1]).toBe('Jonokuchi')
    })

    it('should list Makuuchi ranks before lower divisions', () => {
      const maegashiraIdx = RANK_ORDER.indexOf('Maegashira')
      const juryoIdx = RANK_ORDER.indexOf('Juryo')
      expect(maegashiraIdx).toBeLessThan(juryoIdx)
    })
  })

  describe('SEKITORI_RANK_ORDER', () => {
    it('should contain 6 ranks (Yokozuna through Juryo)', () => {
      expect(SEKITORI_RANK_ORDER).toHaveLength(6)
    })

    it('should start with Yokozuna and end with Juryo', () => {
      expect(SEKITORI_RANK_ORDER[0]).toBe('Yokozuna')
      expect(SEKITORI_RANK_ORDER[SEKITORI_RANK_ORDER.length - 1]).toBe('Juryo')
    })

    it('should not include apprentice ranks', () => {
      expect(SEKITORI_RANK_ORDER).not.toContain('Makushita')
      expect(SEKITORI_RANK_ORDER).not.toContain('Jonokuchi')
    })
  })

  describe('APPRENTICE_RANK_ORDER', () => {
    it('should contain 4 ranks (Makushita through Jonokuchi)', () => {
      expect(APPRENTICE_RANK_ORDER).toHaveLength(4)
    })

    it('should start with Makushita and end with Jonokuchi', () => {
      expect(APPRENTICE_RANK_ORDER[0]).toBe('Makushita')
      expect(APPRENTICE_RANK_ORDER[APPRENTICE_RANK_ORDER.length - 1]).toBe('Jonokuchi')
    })

    it('should not include sekitori ranks', () => {
      expect(APPRENTICE_RANK_ORDER).not.toContain('Yokozuna')
      expect(APPRENTICE_RANK_ORDER).not.toContain('Juryo')
    })
  })

  describe('RANK_ABBREVIATIONS', () => {
    it('should have an entry for every rank in RANK_ORDER', () => {
      RANK_ORDER.forEach((rank) => {
        expect(RANK_ABBREVIATIONS).toHaveProperty(rank)
      })
    })

    it('should use expected abbreviations', () => {
      expect(RANK_ABBREVIATIONS['Yokozuna']).toBe('Y')
      expect(RANK_ABBREVIATIONS['Ozeki']).toBe('O')
      expect(RANK_ABBREVIATIONS['Maegashira']).toBe('M')
      expect(RANK_ABBREVIATIONS['Makushita']).toBe('Ms')
      expect(RANK_ABBREVIATIONS['Sandanme']).toBe('Sd')
      expect(RANK_ABBREVIATIONS['Jonidan']).toBe('Jd')
      expect(RANK_ABBREVIATIONS['Jonokuchi']).toBe('Jk')
    })
  })

  describe('RANK_COLORS', () => {
    it('should have an entry for every rank in RANK_ORDER', () => {
      RANK_ORDER.forEach((rank) => {
        expect(RANK_COLORS).toHaveProperty(rank)
      })
    })

    it('should map Yokozuna to yokozuna color', () => {
      expect(RANK_COLORS['Yokozuna']).toBe('yokozuna')
    })

    it('should map sanyaku ranks to sanyaku color', () => {
      expect(RANK_COLORS['Ozeki']).toBe('sanyaku')
      expect(RANK_COLORS['Sekiwake']).toBe('sanyaku')
      expect(RANK_COLORS['Komusubi']).toBe('sanyaku')
    })

    it('should map Maegashira to makuuchi color', () => {
      expect(RANK_COLORS['Maegashira']).toBe('makuuchi')
    })
  })

  describe('RANK_TO_API_DIVISION', () => {
    it('should have an entry for every rank in RANK_ORDER', () => {
      RANK_ORDER.forEach((rank) => {
        expect(RANK_TO_API_DIVISION).toHaveProperty(rank)
      })
    })

    it('should map all Makuuchi ranks to Makuuchi', () => {
      expect(RANK_TO_API_DIVISION['Yokozuna']).toBe('Makuuchi')
      expect(RANK_TO_API_DIVISION['Ozeki']).toBe('Makuuchi')
      expect(RANK_TO_API_DIVISION['Maegashira']).toBe('Makuuchi')
    })

    it('should map Juryo to Juryo', () => {
      expect(RANK_TO_API_DIVISION['Juryo']).toBe('Juryo')
    })

    it('should map lower division ranks to their own names', () => {
      expect(RANK_TO_API_DIVISION['Makushita']).toBe('Makushita')
      expect(RANK_TO_API_DIVISION['Jonokuchi']).toBe('Jonokuchi')
    })
  })
})
