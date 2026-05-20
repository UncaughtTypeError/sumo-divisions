import { describe, it, expect } from 'vitest'
import {
  getPreviousBashoId,
  parseBanzukeRankBase,
  computeRankDelta,
  computeWrestlerRankIndicators,
  computeHistoryRowIndicators,
} from '../../utils/rankMovement'

// ─── computeHistoryRowIndicators ─────────────────────────────────────────────

describe('computeHistoryRowIndicators', () => {
  const history = [
    { bashoId: '202605', rank: 'Yokozuna 1 East',   rankValue: 101 }, // index 0 (newest)
    { bashoId: '202603', rank: 'Ozeki 1 East',      rankValue: 201 }, // index 1
    { bashoId: '202601', rank: 'Sekiwake 1 East',   rankValue: 301 }, // index 2
    { bashoId: '202511', rank: 'Maegashira 5 East', rankValue: 505 }, // index 3 (oldest)
  ]

  it('returns "up" movement when rank improved from previous basho', () => {
    // index 0 (Yokozuna) vs index 1 (Ozeki) — 101 < 201 → up
    const { movement, delta } = computeHistoryRowIndicators(history[0], 0, history)
    expect(movement).toBe('up')
    expect(delta).toBeGreaterThan(0)
  })

  it('returns "down" movement when rank worsened from previous basho', () => {
    // index 2 (Sekiwake) vs index 3 (Maegashira) — 301 < 505 → index 2 is better
    // But we compare index 2 (current) against index 3 (previous/older)
    // 301 < 505 → current is BETTER → movement = 'up'
    // To test 'down', invert: compare index 3 against index 4 (there is none)
    // Use a custom mini-history
    const h = [
      { bashoId: '202605', rank: 'Maegashira 10 East', rankValue: 510 },
      { bashoId: '202603', rank: 'Maegashira 5 East',  rankValue: 505 },
    ]
    const { movement } = computeHistoryRowIndicators(h[0], 0, h)
    expect(movement).toBe('down')
  })

  it('returns null movement for the oldest entry (no prior basho)', () => {
    const { movement } = computeHistoryRowIndicators(history[3], 3, history)
    expect(movement).toBeNull()
  })

  it('returns sanyaku-debut for first time at Yokozuna', () => {
    const { debutType } = computeHistoryRowIndicators(history[0], 0, history)
    expect(debutType).toBe('sanyaku-debut')
  })

  it('returns sanyaku-debut for first time at Ozeki', () => {
    // index 1 (Ozeki) — prior entries are Sekiwake and Maegashira, no Ozeki
    const { debutType } = computeHistoryRowIndicators(history[1], 1, history)
    expect(debutType).toBe('sanyaku-debut')
  })

  it('returns sanyaku-debut for first time at Sekiwake', () => {
    const h = [
      { bashoId: '202605', rank: 'Sekiwake 1 East', rankValue: 301 },
      { bashoId: '202603', rank: 'Komusubi 1 East', rankValue: 401 },
      { bashoId: '202601', rank: 'Maegashira 1 East', rankValue: 501 },
    ]
    expect(computeHistoryRowIndicators(h[0], 0, h).debutType).toBe('sanyaku-debut')
  })

  it('returns sanyaku-debut for first time at Komusubi', () => {
    const h = [
      { bashoId: '202605', rank: 'Komusubi 1 East', rankValue: 401 },
      { bashoId: '202603', rank: 'Maegashira 2 East', rankValue: 502 },
    ]
    expect(computeHistoryRowIndicators(h[0], 0, h).debutType).toBe('sanyaku-debut')
  })

  it('returns null debutType when wrestler returns to a sanyaku rank they held before', () => {
    const h = [
      { bashoId: '202605', rank: 'Ozeki 1 East', rankValue: 201 }, // returning to Ozeki
      { bashoId: '202603', rank: 'Sekiwake 1 East', rankValue: 301 }, // demoted to S
      { bashoId: '202601', rank: 'Ozeki 1 West', rankValue: 201 }, // was Ozeki before
    ]
    expect(computeHistoryRowIndicators(h[0], 0, h).debutType).toBeNull()
  })

  it('returns division-debut for the very first (oldest) entry', () => {
    const { debutType } = computeHistoryRowIndicators(history[3], 3, history)
    expect(debutType).toBe('division-debut')
  })

  it('returns isCareerHigh for first time at this position (with no debut)', () => {
    // index 1 (Ozeki 201) — prior entries are Sekiwake (301) and Maegashira (505)
    // 201 < min(301, 505) → new career high; NOT a debut (Ozeki is sanyaku-debut would fire)
    // Actually Ozeki debut fires here, so isCareerHigh is suppressed
    const { debutType, isCareerHigh } = computeHistoryRowIndicators(history[1], 1, history)
    expect(debutType).toBe('sanyaku-debut')
    expect(isCareerHigh).toBe(false) // suppressed by debut
  })

  it('isCareerHigh and movement "up" can appear together when no debut', () => {
    const h = [
      { bashoId: '202605', rank: 'Maegashira 3 East', rankValue: 503 }, // new best
      { bashoId: '202603', rank: 'Maegashira 5 East', rankValue: 505 },
      { bashoId: '202601', rank: 'Maegashira 7 East', rankValue: 507 },
    ]
    const { movement, isCareerHigh, debutType } = computeHistoryRowIndicators(h[0], 0, h)
    expect(movement).toBe('up')
    expect(isCareerHigh).toBe(true)
    expect(debutType).toBeNull()
  })

  it('isCareerHigh is true for non-debut career best', () => {
    const h = [
      { bashoId: '202605', rank: 'Maegashira 3 East', rankValue: 503 }, // new best M3 vs old best M5
      { bashoId: '202603', rank: 'Maegashira 5 East', rankValue: 505 },
      { bashoId: '202601', rank: 'Maegashira 5 West', rankValue: 505 },
    ]
    // index 0 is better than all prior (503 < 505 in position too)
    const { isCareerHigh, debutType } = computeHistoryRowIndicators(h[0], 0, h)
    expect(debutType).toBeNull()   // same division (Maegashira)
    expect(isCareerHigh).toBe(true)
  })

  describe('directionFromRankValue fallback behaviour', () => {
    it('same-rankValue E→W is "down" (uses position formula)', () => {
      // Y1E and Y1W both have rankValue 101 → fall back to position
      const h = [
        { bashoId: '202605', rank: 'Yokozuna 1 West', rankValue: 101 },
        { bashoId: '202603', rank: 'Yokozuna 1 East', rankValue: 101 },
      ]
      const { movement, delta } = computeHistoryRowIndicators(h[0], 0, h)
      expect(movement).toBe('down')  // West = slightly worse than East
      expect(delta).toBe(0.5)
    })

    it('same-rankValue W→E is "up" (uses position formula)', () => {
      const h = [
        { bashoId: '202605', rank: 'Yokozuna 1 East', rankValue: 101 },
        { bashoId: '202603', rank: 'Yokozuna 1 West', rankValue: 101 },
      ]
      const { movement } = computeHistoryRowIndicators(h[0], 0, h)
      expect(movement).toBe('up')
    })

    it('null rankValues fall back to position formula', () => {
      const h = [
        { bashoId: '202605', rank: 'Maegashira 5 East', rankValue: null },
        { bashoId: '202603', rank: 'Maegashira 10 East', rankValue: null },
      ]
      const { movement } = computeHistoryRowIndicators(h[0], 0, h)
      expect(movement).toBe('up') // M5E (lower position) is better than M10E
    })

    it('same rankValue AND same position returns null movement', () => {
      const h = [
        { bashoId: '202605', rank: 'Maegashira 5 East', rankValue: 505 },
        { bashoId: '202603', rank: 'Maegashira 5 East', rankValue: 505 },
      ]
      const { movement } = computeHistoryRowIndicators(h[0], 0, h)
      expect(movement).toBeNull()
    })
  })

  it('returns "up" when going from Sekiwake 1 East to Ozeki 2 West (rankValue fixes direction)', () => {
    // Position formula incorrectly puts O2W (pos 5) below S1E (pos 4).
    // rankValue correctly shows O2W (202) < S1E (301) → improvement → "up".
    const h = [
      { bashoId: '202309', rank: 'Ozeki 2 West',    rankValue: 202 },
      { bashoId: '202307', rank: 'Sekiwake 1 East', rankValue: 301 },
    ]
    const { movement, debutType } = computeHistoryRowIndicators(h[0], 0, h)
    expect(movement).toBe('up')
    expect(debutType).toBe('sanyaku-debut')
  })

  it('no indicators for repeated same rank (no change, no debut, not a new high)', () => {
    const h = [
      { bashoId: '202605', rank: 'Yokozuna 1 East', rankValue: 101 },
      { bashoId: '202603', rank: 'Yokozuna 1 East', rankValue: 101 },
    ]
    const { movement, delta, debutType, isCareerHigh } = computeHistoryRowIndicators(h[0], 0, h)
    expect(movement).toBeNull()
    expect(delta).toBe(0)
    expect(debutType).toBeNull()
    expect(isCareerHigh).toBe(false)
  })
})

// ─── helpers ──────────────────────────────────────────────────────────────────

const mkWrestler = (rank = 'Maegashira 8 East', rankValue = 508) => ({
  rikishiID: 1, rank, rankValue,
})

// computeWrestlerRankIndicators now receives the rankHistory array directly
const h = (bashoId, rank, rankValue) => ({
  id: `${bashoId}-1`, bashoId, rikishiId: 1, rank, rankValue,
})

// ─── getPreviousBashoId ───────────────────────────────────────────────────────

describe('getPreviousBashoId', () => {
  it('returns the previous basho in the same year', () => {
    expect(getPreviousBashoId('202605')).toBe('202603')
    expect(getPreviousBashoId('202609')).toBe('202607')
    expect(getPreviousBashoId('202611')).toBe('202609')
  })

  it('wraps from January to November of the previous year', () => {
    expect(getPreviousBashoId('202601')).toBe('202511')
  })

  it('returns null for invalid input', () => {
    expect(getPreviousBashoId(null)).toBeNull()
    expect(getPreviousBashoId('')).toBeNull()
    expect(getPreviousBashoId('2026')).toBeNull()
    expect(getPreviousBashoId('202602')).toBeNull()
  })
})

// ─── parseBanzukeRankBase ─────────────────────────────────────────────────────

describe('parseBanzukeRankBase', () => {
  it('extracts the base rank name', () => {
    expect(parseBanzukeRankBase('Yokozuna 1 East')).toBe('Yokozuna')
    expect(parseBanzukeRankBase('Maegashira 16 East')).toBe('Maegashira')
    expect(parseBanzukeRankBase('Juryo 3 West')).toBe('Juryo')
    expect(parseBanzukeRankBase('Makushita 10 East')).toBe('Makushita')
  })

  it('returns null for null or empty input', () => {
    expect(parseBanzukeRankBase(null)).toBeNull()
    expect(parseBanzukeRankBase('')).toBeNull()
  })
})

// ─── computeRankDelta ─────────────────────────────────────────────────────────

describe('computeRankDelta', () => {
  it('returns negative delta for promotion (up)', () => {
    expect(computeRankDelta('Maegashira 8 East', 'Maegashira 10 East')).toBeLessThan(0)
  })

  it('returns positive delta for demotion (down)', () => {
    expect(computeRankDelta('Maegashira 10 East', 'Maegashira 8 East')).toBeGreaterThan(0)
  })

  it('returns 0 for the same rank', () => {
    expect(computeRankDelta('Maegashira 8 East', 'Maegashira 8 East')).toBe(0)
  })

  it('each rank number difference = 1 unit (two 0.5 steps)', () => {
    expect(computeRankDelta('Maegashira 6 East', 'Maegashira 4 East')).toBe(2)
  })

  it('East → West of same number = 0.5', () => {
    expect(computeRankDelta('Maegashira 8 West', 'Maegashira 8 East')).toBe(0.5)
  })

  it('cross-division demotion produces positive delta', () => {
    expect(computeRankDelta('Juryo 2 West', 'Maegashira 16 East')).toBeGreaterThan(0)
  })

  it('cross-division promotion produces negative delta', () => {
    expect(computeRankDelta('Maegashira 16 East', 'Juryo 2 West')).toBeLessThan(0)
  })

  it('returns 0 for unrecognised rank strings', () => {
    expect(computeRankDelta('Unknown', 'Maegashira 8 East')).toBe(0)
  })

  it('returns 0 for null currentRank', () => {
    expect(computeRankDelta(null, 'Maegashira 8 East')).toBe(0)
  })

  it('returns 0 for null previousRank', () => {
    expect(computeRankDelta('Maegashira 8 East', null)).toBe(0)
  })

  it('returns 0 for empty string ranks', () => {
    expect(computeRankDelta('', 'Maegashira 8 East')).toBe(0)
    expect(computeRankDelta('Maegashira 8 East', '')).toBe(0)
  })

  describe('sanyaku-specific deltas (maxPerSide=1 for Y/O/S/K)', () => {
    it('O1W → Y1E = 1.5 ranks (3 slots: O1W→O1E→Y1W→Y1E)', () => {
      expect(computeRankDelta('Yokozuna 1 East', 'Ozeki 1 West')).toBe(-1.5)
    })

    it('S1E → O1W = 0.5 ranks (adjacent banzuke slots)', () => {
      expect(computeRankDelta('Ozeki 1 West', 'Sekiwake 1 East')).toBe(-0.5)
    })

    it('S1E → O1E = 1.0 ranks (two slots)', () => {
      expect(computeRankDelta('Ozeki 1 East', 'Sekiwake 1 East')).toBe(-1.0)
    })

    it('Y1E → Y1W = 0.5 ranks (East to West within same rank number)', () => {
      expect(computeRankDelta('Yokozuna 1 West', 'Yokozuna 1 East')).toBe(0.5)
    })
  })
})

// ─── computeWrestlerRankIndicators — no history guard ─────────────────────────

describe('computeWrestlerRankIndicators — no history', () => {
  it('returns all nulls when rankHistory is null', () => {
    const result = computeWrestlerRankIndicators(mkWrestler(), null, '202605', '202603')
    expect(result).toEqual({ isCareerHigh: false, debutType: null, rankMovement: null, rankDelta: 0 })
  })

  it('returns all nulls when rankHistory is an empty array', () => {
    const result = computeWrestlerRankIndicators(mkWrestler(), [], '202605', '202603')
    expect(result).toEqual({ isCareerHigh: false, debutType: null, rankMovement: null, rankDelta: 0 })
  })
})

// ─── computeWrestlerRankIndicators — career high ──────────────────────────────

describe('computeWrestlerRankIndicators — career high', () => {
  it('isCareerHigh is true when current rank is strictly better than all prior', () => {
    const wrestler = mkWrestler('Maegashira 5 East', 505)
    const history  = [
      h('202605', 'Maegashira 5 East', 505),
      h('202603', 'Maegashira 10 East', 510),
    ]
    const { isCareerHigh } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(isCareerHigh).toBe(true)
  })

  it('isCareerHigh is false when current rank equals a previous entry (same position)', () => {
    const wrestler = mkWrestler('Maegashira 5 East', 505)
    const history  = [
      h('202605', 'Maegashira 5 East', 505),
      h('202603', 'Maegashira 5 East', 505),
    ]
    const { isCareerHigh } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(isCareerHigh).toBe(false)
  })

  it('isCareerHigh is false when current rank is worse than a previous entry', () => {
    const wrestler = mkWrestler('Maegashira 10 East', 510)
    const history  = [
      h('202605', 'Maegashira 10 East', 510),
      h('202603', 'Maegashira 5 East', 505),
    ]
    const { isCareerHigh } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(isCareerHigh).toBe(false)
  })

  it('Mae-zumo prior entry produces division-debut which suppresses career-high badge', () => {
    const wrestler = mkWrestler('Jonokuchi 1 East', 1001)
    const history  = [
      h('202605', 'Jonokuchi 1 East', 1001),
      h('202511', 'Mae-zumo', 2000),
    ]
    const { debutType, isCareerHigh } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBe('division-debut')
    expect(isCareerHigh).toBe(false)
  })

  it('excludes Mae-zumo from career-high comparison (no valid banzuke position)', () => {
    const wrestler = mkWrestler('Maegashira 8 East', 508)
    const history  = [
      h('202605', 'Maegashira 8 East', 508),
      h('202603', 'Maegashira 10 East', 510),
      h('202509', 'Mae-zumo', 2000),
    ]
    const { isCareerHigh } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(isCareerHigh).toBe(true)
  })

  it('detects career high when wrestler improves from West to East at same rank number', () => {
    const wrestler = mkWrestler('Maegashira 2 East', 502)
    const history  = [
      h('202605', 'Maegashira 2 East', 502),
      h('202603', 'Maegashira 2 West', 502),
    ]
    const { isCareerHigh } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(isCareerHigh).toBe(true)
  })

  it('future basho entries are excluded from the career-high comparison', () => {
    const wrestler = mkWrestler('Maegashira 8 East', 508)
    const history  = [
      h('202607', 'Maegashira 2 East', 502),
      h('202605', 'Maegashira 8 East', 508),
      h('202603', 'Maegashira 10 East', 510),
    ]
    const { isCareerHigh } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(isCareerHigh).toBe(true)
  })

  it('isCareerHigh is false when wrestler also has a debutType', () => {
    const wrestler = mkWrestler('Ozeki 1 East', 201)
    const history  = [
      h('202605', 'Ozeki 1 East', 201),
      h('202603', 'Sekiwake 1 East', 301),
    ]
    const { isCareerHigh, debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBe('sanyaku-debut')
    expect(isCareerHigh).toBe(false)
  })
})

// ─── computeWrestlerRankIndicators — debutType ───────────────────────────────

describe('computeWrestlerRankIndicators — debutType', () => {
  it('division-debut when wrestler has prior history with only Mae-zumo entries', () => {
    const wrestler = mkWrestler()
    const history  = [
      h('202605', 'Maegashira 8 East', 508),
      h('202511', 'Mae-zumo', 2000),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBe('division-debut')
  })

  it('sanyaku-debut when wrestler never held this sanyaku rank before (Ozeki)', () => {
    const wrestler = mkWrestler('Ozeki 1 East', 201)
    const history  = [
      h('202605', 'Ozeki 1 East', 201),
      h('202603', 'Sekiwake 1 East', 301),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBe('sanyaku-debut')
  })

  it('sanyaku-debut for first time at Yokozuna', () => {
    const wrestler = mkWrestler('Yokozuna 1 East', 101)
    const history  = [
      h('202605', 'Yokozuna 1 East', 101),
      h('202603', 'Ozeki 1 West',   201),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBe('sanyaku-debut')
  })

  it('sanyaku-debut for first time at Sekiwake', () => {
    const wrestler = mkWrestler('Sekiwake 1 East', 301)
    const history  = [
      h('202605', 'Sekiwake 1 East', 301),
      h('202603', 'Maegashira 5 East', 505),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBe('sanyaku-debut')
  })

  it('sanyaku-debut for first time at Komusubi', () => {
    const wrestler = mkWrestler('Komusubi 1 East', 401)
    const history  = [
      h('202605', 'Komusubi 1 East', 401),
      h('202603', 'Maegashira 2 East', 502),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBe('sanyaku-debut')
  })

  it('division-debut for first time in Juryo (from Makushita)', () => {
    const wrestler = mkWrestler('Juryo 14 East', 614)
    const history  = [
      h('202605', 'Juryo 14 East',   614),
      h('202603', 'Makushita 1 East', 701),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBe('division-debut')
  })

  it('no sanyaku-debut when wrestler was at same rank base in a previous basho', () => {
    const wrestler = mkWrestler('Ozeki 1 East', 201)
    const history  = [
      h('202605', 'Ozeki 1 East',  201),
      h('202603', 'Sekiwake 1 East', 301), // demoted
      h('202601', 'Ozeki 1 West',  201), // had been Ozeki before
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBeNull()
  })

  it('NO sanyaku-debut when wrestler held the same sanyaku rank before (even different position)', () => {
    const wrestler = mkWrestler('Ozeki 1 West', 201)
    const history  = [
      h('202605', 'Ozeki 1 West', 201),
      h('202603', 'Ozeki 1 East', 201),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBeNull()
  })

  it('division-debut when wrestler is new to this division (Juryo → Makuuchi)', () => {
    const wrestler = mkWrestler('Maegashira 16 East', 516)
    const history  = [
      h('202605', 'Maegashira 16 East', 516),
      h('202603', 'Juryo 2 West', 602),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBe('division-debut')
  })

  it('NO debut for movement within Maegashira (same division)', () => {
    const wrestler = mkWrestler('Maegashira 8 East', 508)
    const history  = [
      h('202605', 'Maegashira 8 East', 508),
      h('202603', 'Maegashira 16 East', 516),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBeNull()
  })

  it('returns null debutType when wrestler was already at same sanyaku rank base', () => {
    const wrestler = mkWrestler('Sekiwake 1 East', 301)
    const history  = [
      h('202605', 'Sekiwake 1 East', 301),
      h('202603', 'Sekiwake 2 West', 302),
    ]
    const { debutType } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(debutType).toBeNull()
  })
})

// ─── computeWrestlerRankIndicators — rankMovement ────────────────────────────

describe('computeWrestlerRankIndicators — rankMovement', () => {
  it('returns up when current rank is better than previous', () => {
    const wrestler = mkWrestler('Maegashira 5 East', 505)
    const history  = [
      h('202605', 'Maegashira 5 East', 505),
      h('202603', 'Maegashira 10 East', 510),
    ]
    const { rankMovement, rankDelta } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(rankMovement).toBe('up')
    expect(rankDelta).toBeGreaterThan(0)
  })

  it('returns down when current rank is worse than previous', () => {
    const wrestler = mkWrestler('Maegashira 10 East', 510)
    const history  = [
      h('202605', 'Maegashira 10 East', 510),
      h('202603', 'Maegashira 5 East', 505),
    ]
    const { rankMovement, rankDelta } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(rankMovement).toBe('down')
    expect(rankDelta).toBeGreaterThan(0)
  })

  it('returns same when rank is unchanged since previous basho', () => {
    const wrestler = mkWrestler('Maegashira 8 East', 508)
    const history  = [
      h('202605', 'Maegashira 8 East', 508),
      h('202603', 'Maegashira 8 East', 508),
    ]
    const { rankMovement } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(rankMovement).toBe('same')
  })

  it('rankMovement is computed independently — can accompany a debut', () => {
    const wrestler = mkWrestler('Ozeki 1 East', 201)
    const history  = [
      h('202605', 'Ozeki 1 East', 201),
      h('202603', 'Sekiwake 1 East', 301),
    ]
    const { debutType, rankMovement, rankDelta } = computeWrestlerRankIndicators(
      wrestler, history, '202605', '202603',
    )
    expect(debutType).toBe('sanyaku-debut')
    expect(rankMovement).toBe('up')
    expect(rankDelta).toBeGreaterThan(0)
  })

  it('falls back to most recent prior entry when previous basho has no entry', () => {
    const wrestler = mkWrestler('Maegashira 5 East', 505)
    const history  = [
      h('202605', 'Maegashira 5 East', 505),
      h('202601', 'Maegashira 10 East', 510),
    ]
    const { rankMovement } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(rankMovement).toBe('up')
  })

  it('returns null rankMovement when history has only the current basho entry', () => {
    const wrestler = mkWrestler()
    const history  = [h('202605', 'Maegashira 8 East', 508)]
    const { rankMovement } = computeWrestlerRankIndicators(wrestler, history, '202605', '202603')
    expect(rankMovement).toBeNull()
  })
})
