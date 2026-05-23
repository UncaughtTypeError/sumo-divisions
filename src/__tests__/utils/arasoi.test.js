import { describe, it, expect } from 'vitest'
import {
  getTotalBouts,
  getRemainingBouts,
  computeYushoContenders,
  isYushoDecided,
} from '../../utils/arasoi'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeWrestler = (wins, losses, absences = 0, rankValue = 10) => ({
  rikishiID: Math.random(),
  wins,
  losses,
  absences,
  rankValue,
})

// Build a record array from a shorthand string: 'W'=win, 'L'=loss, 'A'=absent, '_'=pending
const makeRecord = (shorthand) =>
  shorthand.split('').map((ch) => ({
    result: ch === 'W' ? 'win' : ch === 'L' ? 'loss' : ch === 'A' ? 'absent' : '',
  }))

// ─── getTotalBouts ────────────────────────────────────────────────────────────

describe('getTotalBouts', () => {
  it('returns 15 for Makuuchi', () => {
    expect(getTotalBouts('Makuuchi')).toBe(15)
  })

  it('returns 15 for Juryo', () => {
    expect(getTotalBouts('Juryo')).toBe(15)
  })

  it('returns 7 for Makushita', () => {
    expect(getTotalBouts('Makushita')).toBe(7)
  })

  it('returns 7 for Sandanme', () => {
    expect(getTotalBouts('Sandanme')).toBe(7)
  })

  it('returns 7 for Jonidan', () => {
    expect(getTotalBouts('Jonidan')).toBe(7)
  })

  it('returns 7 for Jonokuchi', () => {
    expect(getTotalBouts('Jonokuchi')).toBe(7)
  })
})

// ─── getRemainingBouts ────────────────────────────────────────────────────────

describe('getRemainingBouts', () => {
  describe('sekitori (Makuuchi / Juryo)', () => {
    it('returns days remaining when wrestler has no absences', () => {
      const w = makeWrestler(5, 3, 0)
      expect(getRemainingBouts(w, 8, 'Makuuchi')).toBe(7)
    })

    it('returns 0 when wrestler has absences (kyujo)', () => {
      const w = makeWrestler(5, 2, 1)
      expect(getRemainingBouts(w, 8, 'Makuuchi')).toBe(0)
    })

    it('returns 0 on day 15 (no bouts remaining)', () => {
      const w = makeWrestler(9, 6, 0)
      expect(getRemainingBouts(w, 15, 'Juryo')).toBe(0)
    })

    it('returns 14 on day 1', () => {
      const w = makeWrestler(1, 0, 0)
      expect(getRemainingBouts(w, 1, 'Makuuchi')).toBe(14)
    })

    it('returns 0 for kyujo wrestler regardless of day', () => {
      const w = makeWrestler(3, 1, 2)
      expect(getRemainingBouts(w, 5, 'Juryo')).toBe(0)
    })

    it('never returns negative (defensive)', () => {
      const w = makeWrestler(15, 0, 0)
      expect(getRemainingBouts(w, 15, 'Makuuchi')).toBe(0)
    })
  })

  describe('lower divisions (Makushita and below)', () => {
    it('counts remaining bouts by subtracting bouts fought', () => {
      const w = makeWrestler(3, 1, 0)
      expect(getRemainingBouts(w, 10, 'Makushita')).toBe(3)
    })

    it('returns remaining bouts for active wrestler (absences=0)', () => {
      // Rest days are NOT counted in absences — an active wrestler has absences=0
      const w = makeWrestler(2, 1, 0)
      expect(getRemainingBouts(w, 10, 'Sandanme')).toBe(4)
    })

    it('returns 0 when wrestler has any genuine kyujo absences', () => {
      const w = makeWrestler(2, 0, 1) // withdrew after 2 wins
      expect(getRemainingBouts(w, 10, 'Makushita')).toBe(0)
    })

    it('returns 0 for whole-tournament kyujo (0W 0L, absences > 0)', () => {
      const w = makeWrestler(0, 0, 15)
      expect(getRemainingBouts(w, 14, 'Makushita')).toBe(0)
    })

    it('returns 0 when wrestler withdrew after 2 wins (many absences)', () => {
      const w = makeWrestler(2, 0, 12)
      expect(getRemainingBouts(w, 14, 'Sandanme')).toBe(0)
    })

    it('returns 0 when all 7 bouts have been fought', () => {
      const w = makeWrestler(5, 2, 0)
      expect(getRemainingBouts(w, 15, 'Jonidan')).toBe(0)
    })

    it('returns 0 when no activity recorded and no absences (result-pending withdrawal)', () => {
      const w = makeWrestler(0, 0, 0)
      expect(getRemainingBouts(w, 3, 'Jonokuchi')).toBe(0)
    })

    it('ignores currentDay parameter for lower divisions', () => {
      const w = makeWrestler(2, 2, 0)
      expect(getRemainingBouts(w, 1, 'Makushita')).toBe(
        getRemainingBouts(w, 15, 'Makushita'),
      )
    })

    it('never returns negative (defensive)', () => {
      const w = makeWrestler(7, 0, 0)
      expect(getRemainingBouts(w, 15, 'Makushita')).toBe(0)
    })
  })
})

// ─── computeYushoContenders ───────────────────────────────────────────────────

describe('computeYushoContenders', () => {
  it('returns empty array when wrestlers list is empty', () => {
    expect(computeYushoContenders([], 5, 'Makuuchi')).toEqual([])
  })

  it('returns empty array when wrestlers is null/undefined', () => {
    expect(computeYushoContenders(null, 5, 'Makuuchi')).toEqual([])
    expect(computeYushoContenders(undefined, 5, 'Makuuchi')).toEqual([])
  })

  it('returns empty array when currentDay is 0', () => {
    const wrestlers = [makeWrestler(3, 2)]
    expect(computeYushoContenders(wrestlers, 0, 'Makuuchi')).toEqual([])
  })

  it('returns all wrestlers when tournament just started (day 1)', () => {
    const wrestlers = [makeWrestler(1, 0), makeWrestler(0, 1), makeWrestler(1, 0)]
    const groups = computeYushoContenders(wrestlers, 1, 'Makuuchi')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(3)
  })

  it('eliminates wrestlers who cannot reach the leader', () => {
    // Day 14: 1 bout left. Leader has 12 wins. Challenger has 9 wins.
    // 9 + 1 = 10 < 12 — eliminated.
    const wrestlers = [
      makeWrestler(12, 2, 0, 1), // leader
      makeWrestler(9, 5, 0, 5),  // eliminated
    ]
    const groups = computeYushoContenders(wrestlers, 14, 'Makuuchi')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(1)
    expect(groups[0].wrestlers[0].wins).toBe(12)
  })

  it('includes wrestlers who can tie the leader', () => {
    // Day 10: 5 bouts left. Leader has 8 wins. Challenger has 4 wins.
    // 4 + 5 = 9 >= 8 — still in contention.
    const wrestlers = [
      makeWrestler(8, 2, 0, 1),
      makeWrestler(4, 6, 0, 5),
    ]
    const groups = computeYushoContenders(wrestlers, 10, 'Makuuchi')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(2)
  })

  it('groups wrestlers by win count', () => {
    const wrestlers = [
      makeWrestler(10, 2, 0, 1),
      makeWrestler(10, 2, 0, 2),
      makeWrestler(8, 4, 0, 3),
    ]
    const groups = computeYushoContenders(wrestlers, 12, 'Makuuchi')
    expect(groups).toHaveLength(2)
    expect(groups[0].wins).toBe(10)
    expect(groups[0].wrestlers).toHaveLength(2)
    expect(groups[1].wins).toBe(8)
    expect(groups[1].wrestlers).toHaveLength(1)
  })

  it('sorts groups by wins descending', () => {
    const wrestlers = [
      makeWrestler(6, 2, 0, 5),
      makeWrestler(8, 0, 0, 3),
      makeWrestler(7, 1, 0, 1),
    ]
    const groups = computeYushoContenders(wrestlers, 8, 'Makuuchi')
    const winCounts = groups.map((g) => g.wins)
    expect(winCounts).toEqual([...winCounts].sort((a, b) => b - a))
  })

  it('sorts wrestlers within a group by rankValue ascending', () => {
    const wrestlers = [
      makeWrestler(10, 2, 0, 20),
      makeWrestler(10, 2, 0, 5),
      makeWrestler(10, 2, 0, 12),
    ]
    const groups = computeYushoContenders(wrestlers, 12, 'Makuuchi')
    const rankValues = groups[0].wrestlers.map((w) => w.rankValue)
    expect(rankValues).toEqual([5, 12, 20])
  })

  it('treats wrestlers without rankValue as lowest priority', () => {
    const wrestlers = [
      makeWrestler(10, 2, 0, 5),
      { rikishiID: 999, wins: 10, losses: 2, absences: 0 }, // no rankValue
    ]
    const groups = computeYushoContenders(wrestlers, 12, 'Makuuchi')
    expect(groups[0].wrestlers[0].rankValue).toBe(5)
    expect(groups[0].wrestlers[1].rankValue).toBeUndefined()
  })

  it('eliminates kyujo sekitori who cannot catch the leader', () => {
    // Day 10: leader has 9 wins. Kyujo wrestler has 6 wins + 0 remaining = 6 < 9.
    const wrestlers = [
      makeWrestler(9, 1, 0, 1),
      makeWrestler(6, 0, 1, 5), // kyujo
    ]
    const groups = computeYushoContenders(wrestlers, 10, 'Makuuchi')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(1)
  })

  it('keeps kyujo sekitori if they currently lead or are tied', () => {
    // Both have 9 wins, but one is kyujo. Still tied — both should appear.
    const wrestlers = [
      makeWrestler(9, 1, 0, 1),
      makeWrestler(9, 0, 1, 5), // kyujo but tied
    ]
    const groups = computeYushoContenders(wrestlers, 10, 'Makuuchi')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(2)
  })

  it('handles lower-division wrestlers correctly', () => {
    // 7-bout tournament. Wrestler A: 5W 0L (2 remaining). Wrestler B: 3W 2L (2 remaining).
    // Leader = 5. B can reach 5 → in contention.
    const wrestlers = [
      makeWrestler(5, 0, 0, 1),
      makeWrestler(3, 2, 0, 5),
    ]
    const groups = computeYushoContenders(wrestlers, 10, 'Makushita')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(2)
  })

  it('eliminates lower-division wrestler who cannot catch up', () => {
    // Wrestler A: 6W 0L (1 remaining). Wrestler B: 3W 4L (0 remaining, all bouts done).
    // B max = 3 < 6 → eliminated.
    const wrestlers = [
      makeWrestler(6, 0, 0, 1),
      makeWrestler(3, 4, 0, 5),
    ]
    const groups = computeYushoContenders(wrestlers, 15, 'Makushita')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(1)
  })

  it('handles single wrestler correctly', () => {
    const wrestlers = [makeWrestler(8, 4, 0, 1)]
    const groups = computeYushoContenders(wrestlers, 12, 'Makuuchi')
    expect(groups).toHaveLength(1)
    expect(groups[0].wrestlers).toHaveLength(1)
  })

  it('returns single group when all wrestlers are tied', () => {
    const wrestlers = [
      makeWrestler(7, 1, 0, 1),
      makeWrestler(7, 1, 0, 2),
      makeWrestler(7, 1, 0, 3),
    ]
    const groups = computeYushoContenders(wrestlers, 8, 'Makuuchi')
    expect(groups).toHaveLength(1)
    expect(groups[0].wins).toBe(7)
    expect(groups[0].wrestlers).toHaveLength(3)
  })

  it('excludes result-pending wrestler (0-0-0) from lower-division contenders', () => {
    // Leader 5W active. Pending wrestler 0-0-0 → remainingBouts=0 → max 0 < 5.
    const wrestlers = [makeWrestler(5, 2, 0, 1), makeWrestler(0, 0, 0, 5)]
    const groups = computeYushoContenders(wrestlers, 14, 'Sandanme')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(1)
    expect(groups[0].wrestlers[0].wins).toBe(5)
  })

  it('eliminates lower-division kyujo wrestlers (absences > 0)', () => {
    // Leader 6W active. Kyujo wrestler 0W has absences → remaining = 0.
    const wrestlers = [makeWrestler(6, 1, 0, 1), makeWrestler(0, 0, 15, 5)]
    const groups = computeYushoContenders(wrestlers, 14, 'Makushita')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(1)
    expect(groups[0].wrestlers[0].wins).toBe(6)
  })

  it('keeps active lower-division wrestler (absences=0) with remaining bouts', () => {
    // Active: 1W 1L 0 absences → remaining = 5; leader has 4W → 1+5=6 >= 4 → contender
    const wrestlers = [makeWrestler(4, 1, 0, 1), makeWrestler(1, 1, 0, 5)]
    const groups = computeYushoContenders(wrestlers, 8, 'Makushita')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(2)
  })

  it('handles final day correctly (no remaining bouts)', () => {
    // Day 15: all bouts done. Only leader(s) remain.
    const wrestlers = [
      makeWrestler(12, 3, 0, 1),
      makeWrestler(11, 4, 0, 5),
    ]
    const groups = computeYushoContenders(wrestlers, 15, 'Makuuchi')
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0)
    expect(totalContenders).toBe(1)
    expect(groups[0].wrestlers[0].wins).toBe(12)
  })
})

// ─── isYushoDecided ───────────────────────────────────────────────────────────

describe('isYushoDecided', () => {
  it('returns decided: false when no results exist', () => {
    expect(isYushoDecided([], 5, 'Makuuchi')).toEqual({
      decided: false,
      winner: null,
    })
  })

  it('returns decided: false on day 0', () => {
    const wrestlers = [makeWrestler(0, 0)]
    expect(isYushoDecided(wrestlers, 0, 'Makuuchi')).toEqual({
      decided: false,
      winner: null,
    })
  })

  it('returns decided: false when two wrestlers are tied', () => {
    const wrestlers = [
      makeWrestler(12, 3, 0, 1),
      makeWrestler(12, 3, 0, 2),
    ]
    const result = isYushoDecided(wrestlers, 15, 'Makuuchi')
    expect(result.decided).toBe(false)
    expect(result.winner).toBeNull()
  })

  it('returns decided: false when another wrestler can still catch the leader', () => {
    // Day 10: leader 9W, challenger 5W with 5 remaining → can reach 10 ≥ 9
    const wrestlers = [
      makeWrestler(9, 1, 0, 1),
      makeWrestler(5, 5, 0, 5),
    ]
    const result = isYushoDecided(wrestlers, 10, 'Makuuchi')
    expect(result.decided).toBe(false)
    expect(result.winner).toBeNull()
  })

  it('returns decided: true with correct winner when sole contender remains', () => {
    // Day 14: 1 bout left. Leader has 13 wins. Challengers eliminated.
    const winner = makeWrestler(13, 1, 0, 1)
    const wrestlers = [
      winner,
      makeWrestler(8, 6, 0, 5),  // 8+1=9 < 13 — eliminated
      makeWrestler(9, 5, 0, 10), // 9+1=10 < 13 — eliminated
    ]
    const result = isYushoDecided(wrestlers, 14, 'Makuuchi')
    expect(result.decided).toBe(true)
    expect(result.winner).toMatchObject({ wins: 13, rankValue: 1 })
  })

  it('returns decided: true when sole contender is kyujo but leads outright', () => {
    // Day 12: kyujo leader has 11 wins, all others have ≤ 8 with 3 remaining = 11.
    // Wait — 8+3=11 >= 11, so NOT decided. Let's make it clear:
    // Leader (kyujo) 11 wins. Others: 7 wins, 3 remaining = 10 < 11. Decided.
    const winner = makeWrestler(11, 0, 1, 1)
    const wrestlers = [
      winner,
      makeWrestler(7, 5, 0, 5),  // 7+3=10 < 11
      makeWrestler(6, 6, 0, 10), // 6+3=9 < 11
    ]
    const result = isYushoDecided(wrestlers, 12, 'Makuuchi')
    expect(result.decided).toBe(true)
    expect(result.winner).toMatchObject({ wins: 11 })
  })

  it('returns decided: false when multiple contenders are in different win groups', () => {
    // Leader 10W, second-place 8W with 3 remaining → 8+3=11 >= 10
    const wrestlers = [
      makeWrestler(10, 2, 0, 1),
      makeWrestler(8, 4, 0, 5),
    ]
    const result = isYushoDecided(wrestlers, 12, 'Makuuchi')
    expect(result.decided).toBe(false)
    expect(result.winner).toBeNull()
  })

  it('correctly decides yusho on final day for sole leader', () => {
    const winner = makeWrestler(13, 2, 0, 1)
    const wrestlers = [
      winner,
      makeWrestler(10, 5, 0, 3),
      makeWrestler(11, 4, 0, 5),
    ]
    const result = isYushoDecided(wrestlers, 15, 'Makuuchi')
    expect(result.decided).toBe(true)
    expect(result.winner.wins).toBe(13)
  })

  it('works correctly for lower divisions', () => {
    // Final bouts done. Sole leader with 6W.
    const wrestlers = [
      makeWrestler(6, 1, 0, 1),
      makeWrestler(4, 3, 0, 5), // all bouts done, 4 < 6
    ]
    const result = isYushoDecided(wrestlers, 15, 'Makushita')
    expect(result.decided).toBe(true)
    expect(result.winner.wins).toBe(6)
  })

  it('decides lower-division yusho when all challengers are kyujo (absences > 0)', () => {
    // Sole 7W winner (absences=0); others withdrew (absences > 0 → remaining=0)
    const wrestlers = [
      makeWrestler(7, 0, 0, 1),   // winner — all bouts done, no kyujo
      makeWrestler(1, 0, 14, 5),  // kyujo after 1W → remaining=0 → max 1 < 7
      makeWrestler(0, 0, 15, 9),  // absent whole tournament → remaining=0
    ]
    const result = isYushoDecided(wrestlers, 14, 'Jonokuchi')
    expect(result.decided).toBe(true)
    expect(result.winner.wins).toBe(7)
  })

  it('returns decided: false for two lower-division leaders (pending playoff)', () => {
    // Two wrestlers both on 7W, both active (absences=0) → playoff needed
    const wrestlers = [makeWrestler(7, 0, 0, 1), makeWrestler(7, 0, 0, 5)]
    const result = isYushoDecided(wrestlers, 14, 'Sandanme')
    expect(result.decided).toBe(false)
    expect(result.winner).toBeNull()
  })

  it('returns decided: false for tied lower division leaders', () => {
    const wrestlers = [
      makeWrestler(6, 1, 0, 1),
      makeWrestler(6, 1, 0, 5),
    ]
    const result = isYushoDecided(wrestlers, 15, 'Makushita')
    expect(result.decided).toBe(false)
    expect(result.winner).toBeNull()
  })
})
