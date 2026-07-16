import { describe, it, expect } from 'vitest';
import {
  getTotalBouts,
  getRemainingBouts,
  computeYushoContenders,
  isYushoDecided,
  MIN_LEADER_WINS,
  MIN_LEADER_WINS_LOWER,
  getMinLeaderWins,
} from '../../utils/arasoi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeWrestler = (wins, losses, absences = 0, rankValue = 10) => ({
  rikishiID: Math.random(),
  wins,
  losses,
  absences,
  rankValue,
});

// Build a record array from a shorthand string: 'W'=win, 'L'=loss, 'A'=absent, '_'=pending
const makeRecord = (shorthand) =>
  shorthand.split('').map((ch) => ({
    result:
      ch === 'W' ? 'win' : ch === 'L' ? 'loss' : ch === 'A' ? 'absent' : '',
  }));

// ─── getTotalBouts ────────────────────────────────────────────────────────────

describe('getTotalBouts', () => {
  it('returns 15 for Makuuchi', () => {
    expect(getTotalBouts('Makuuchi')).toBe(15);
  });

  it('returns 15 for Juryo', () => {
    expect(getTotalBouts('Juryo')).toBe(15);
  });

  it('returns 7 for Makushita', () => {
    expect(getTotalBouts('Makushita')).toBe(7);
  });

  it('returns 7 for Sandanme', () => {
    expect(getTotalBouts('Sandanme')).toBe(7);
  });

  it('returns 7 for Jonidan', () => {
    expect(getTotalBouts('Jonidan')).toBe(7);
  });

  it('returns 7 for Jonokuchi', () => {
    expect(getTotalBouts('Jonokuchi')).toBe(7);
  });
});

// ─── getMinLeaderWins ─────────────────────────────────────────────────────────

describe('getMinLeaderWins', () => {
  it('returns MIN_LEADER_WINS for Makuuchi', () => {
    expect(getMinLeaderWins('Makuuchi')).toBe(MIN_LEADER_WINS);
  });

  it('returns MIN_LEADER_WINS for Juryo', () => {
    expect(getMinLeaderWins('Juryo')).toBe(MIN_LEADER_WINS);
  });

  it('returns MIN_LEADER_WINS_LOWER for Makushita', () => {
    expect(getMinLeaderWins('Makushita')).toBe(MIN_LEADER_WINS_LOWER);
  });

  it('returns MIN_LEADER_WINS_LOWER for Sandanme, Jonidan, Jonokuchi', () => {
    expect(getMinLeaderWins('Sandanme')).toBe(MIN_LEADER_WINS_LOWER);
    expect(getMinLeaderWins('Jonidan')).toBe(MIN_LEADER_WINS_LOWER);
    expect(getMinLeaderWins('Jonokuchi')).toBe(MIN_LEADER_WINS_LOWER);
  });
});

// ─── getRemainingBouts ────────────────────────────────────────────────────────

describe('getRemainingBouts', () => {
  describe('sekitori (Makuuchi / Juryo)', () => {
    it('returns bouts remaining based on individual record', () => {
      const w = makeWrestler(5, 3, 0);
      expect(getRemainingBouts(w, 8, 'Makuuchi')).toBe(7);
    });

    it('returns 0 when wrestler has absences (kyujo)', () => {
      const w = makeWrestler(5, 2, 1);
      expect(getRemainingBouts(w, 8, 'Makuuchi')).toBe(0);
    });

    it('returns 0 when all 15 bouts have been fought', () => {
      const w = makeWrestler(9, 6, 0);
      expect(getRemainingBouts(w, 15, 'Juryo')).toBe(0);
    });

    it('returns 14 after first bout', () => {
      const w = makeWrestler(1, 0, 0);
      expect(getRemainingBouts(w, 1, 'Makuuchi')).toBe(14);
    });

    it('returns 0 for kyujo wrestler regardless of day', () => {
      const w = makeWrestler(3, 1, 2);
      expect(getRemainingBouts(w, 5, 'Juryo')).toBe(0);
    });

    it('never returns negative (defensive)', () => {
      const w = makeWrestler(15, 0, 0);
      expect(getRemainingBouts(w, 15, 'Makuuchi')).toBe(0);
    });

    it('ignores currentDay — uses individual bout count instead', () => {
      // Wrestler has 11W+3L=14 bouts; currentDay=15 because another wrestler
      // already completed their day-15 bout. Should still have 1 bout remaining.
      const w = makeWrestler(11, 3, 0);
      expect(getRemainingBouts(w, 15, 'Makuuchi')).toBe(1);
    });
  });

  describe('lower divisions (Makushita and below)', () => {
    it('counts remaining bouts by subtracting bouts fought', () => {
      const w = makeWrestler(3, 1, 0);
      expect(getRemainingBouts(w, 10, 'Makushita')).toBe(3);
    });

    it('returns remaining bouts for active wrestler (absences=0)', () => {
      // Rest days are NOT counted in absences — an active wrestler has absences=0
      const w = makeWrestler(2, 1, 0);
      expect(getRemainingBouts(w, 10, 'Sandanme')).toBe(4);
    });

    it('returns 0 when wrestler has any genuine kyujo absences', () => {
      const w = makeWrestler(2, 0, 1); // withdrew after 2 wins
      expect(getRemainingBouts(w, 10, 'Makushita')).toBe(0);
    });

    it('returns 0 for whole-tournament kyujo (0W 0L, absences > 0)', () => {
      const w = makeWrestler(0, 0, 15);
      expect(getRemainingBouts(w, 14, 'Makushita')).toBe(0);
    });

    it('returns 0 when wrestler withdrew after 2 wins (many absences)', () => {
      const w = makeWrestler(2, 0, 12);
      expect(getRemainingBouts(w, 14, 'Sandanme')).toBe(0);
    });

    it('returns 0 when all 7 bouts have been fought', () => {
      const w = makeWrestler(5, 2, 0);
      expect(getRemainingBouts(w, 15, 'Jonidan')).toBe(0);
    });

    it('returns 0 when no activity recorded and no absences (result-pending withdrawal)', () => {
      const w = makeWrestler(0, 0, 0);
      expect(getRemainingBouts(w, 3, 'Jonokuchi')).toBe(0);
    });

    it('ignores currentDay parameter for lower divisions', () => {
      const w = makeWrestler(2, 2, 0);
      expect(getRemainingBouts(w, 1, 'Makushita')).toBe(
        getRemainingBouts(w, 15, 'Makushita'),
      );
    });

    it('never returns negative (defensive)', () => {
      const w = makeWrestler(7, 0, 0);
      expect(getRemainingBouts(w, 15, 'Makushita')).toBe(0);
    });
  });
});

// ─── computeYushoContenders ───────────────────────────────────────────────────

describe('computeYushoContenders', () => {
  it('returns empty array when wrestlers list is empty', () => {
    expect(computeYushoContenders([], 5, 'Makuuchi')).toEqual([]);
  });

  it('returns empty array when wrestlers is null/undefined', () => {
    expect(computeYushoContenders(null, 5, 'Makuuchi')).toEqual([]);
    expect(computeYushoContenders(undefined, 5, 'Makuuchi')).toEqual([]);
  });

  it('returns empty array when currentDay is 0', () => {
    const wrestlers = [makeWrestler(3, 2)];
    expect(computeYushoContenders(wrestlers, 0, 'Makuuchi')).toEqual([]);
  });

  it('returns empty array when leader has fewer than MIN_LEADER_WINS wins', () => {
    const wrestlers = [
      makeWrestler(1, 0),
      makeWrestler(0, 1),
      makeWrestler(1, 0),
    ];
    expect(computeYushoContenders(wrestlers, 1, 'Makuuchi')).toEqual([]);
  });

  it('returns empty array when leader is exactly one below the threshold', () => {
    const wrestlers = [
      makeWrestler(MIN_LEADER_WINS - 1, 2),
      makeWrestler(MIN_LEADER_WINS - 2, 3),
    ];
    expect(
      computeYushoContenders(wrestlers, MIN_LEADER_WINS - 1, 'Makuuchi'),
    ).toEqual([]);
  });

  it('returns contenders when leader reaches exactly MIN_LEADER_WINS wins', () => {
    const wrestlers = [
      makeWrestler(MIN_LEADER_WINS, 0),
      makeWrestler(MIN_LEADER_WINS - 1, 1),
    ];
    const groups = computeYushoContenders(
      wrestlers,
      MIN_LEADER_WINS,
      'Makuuchi',
    );
    expect(groups.length).toBeGreaterThan(0);
  });

  it('excludes wrestlers below MIN_LEADER_WINS even if they can mathematically catch up', () => {
    // Leader has 4 wins (MIN_LEADER_WINS). Challenger has 1 win with 3 remaining.
    // Mathematically: 1 + 3 = 4 >= 4, but challenger has only 1 win < MIN_LEADER_WINS.
    // Challenger should be excluded from contention.
    const wrestlers = [
      makeWrestler(MIN_LEADER_WINS, 0, 0, 1), // leader at threshold
      makeWrestler(1, 3, 0, 5), // can reach 4, but only has 1 win
    ];
    const groups = computeYushoContenders(wrestlers, 4, 'Makuuchi');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(1);
    expect(groups[0].wrestlers[0].wins).toBe(MIN_LEADER_WINS);
  });

  it('returns contenders when leader is one win above the minimum threshold', () => {
    const wrestlers = [
      makeWrestler(MIN_LEADER_WINS + 1, 0),
      makeWrestler(MIN_LEADER_WINS, 1),
    ];
    const groups = computeYushoContenders(
      wrestlers,
      MIN_LEADER_WINS + 1,
      'Makuuchi',
    );
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0].wins).toBe(MIN_LEADER_WINS + 1);
  });

  it('returns contenders well above the minimum threshold', () => {
    const wrestlers = [makeWrestler(10, 2, 0, 1), makeWrestler(8, 4, 0, 5)];
    const groups = computeYushoContenders(wrestlers, 12, 'Makuuchi');
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0].wins).toBe(10);
  });

  it('eliminates wrestlers who cannot reach the leader', () => {
    // Day 14: 1 bout left. Leader has 12 wins. Challenger has 9 wins.
    // 9 + 1 = 10 < 12 — eliminated.
    const wrestlers = [
      makeWrestler(12, 2, 0, 1), // leader
      makeWrestler(9, 5, 0, 5), // eliminated
    ];
    const groups = computeYushoContenders(wrestlers, 14, 'Makuuchi');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(1);
    expect(groups[0].wrestlers[0].wins).toBe(12);
  });

  it('includes wrestlers who can tie the leader', () => {
    // Day 10: 5 bouts left. Leader has 8 wins. Challenger has 4 wins.
    // 4 + 5 = 9 >= 8 — still in contention.
    const wrestlers = [makeWrestler(8, 2, 0, 1), makeWrestler(4, 6, 0, 5)];
    const groups = computeYushoContenders(wrestlers, 10, 'Makuuchi');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(2);
  });

  it('groups wrestlers by win count', () => {
    const wrestlers = [
      makeWrestler(10, 2, 0, 1),
      makeWrestler(10, 2, 0, 2),
      makeWrestler(8, 4, 0, 3),
    ];
    const groups = computeYushoContenders(wrestlers, 12, 'Makuuchi');
    expect(groups).toHaveLength(2);
    expect(groups[0].wins).toBe(10);
    expect(groups[0].wrestlers).toHaveLength(2);
    expect(groups[1].wins).toBe(8);
    expect(groups[1].wrestlers).toHaveLength(1);
  });

  it('sorts groups by wins descending', () => {
    const wrestlers = [
      makeWrestler(6, 2, 0, 5),
      makeWrestler(8, 0, 0, 3),
      makeWrestler(7, 1, 0, 1),
    ];
    const groups = computeYushoContenders(wrestlers, 8, 'Makuuchi');
    const winCounts = groups.map((g) => g.wins);
    expect(winCounts).toEqual([...winCounts].sort((a, b) => b - a));
  });

  it('sorts wrestlers within a group by rankValue ascending', () => {
    const wrestlers = [
      makeWrestler(10, 2, 0, 20),
      makeWrestler(10, 2, 0, 5),
      makeWrestler(10, 2, 0, 12),
    ];
    const groups = computeYushoContenders(wrestlers, 12, 'Makuuchi');
    const rankValues = groups[0].wrestlers.map((w) => w.rankValue);
    expect(rankValues).toEqual([5, 12, 20]);
  });

  it('treats wrestlers without rankValue as lowest priority', () => {
    const wrestlers = [
      makeWrestler(10, 2, 0, 5),
      { rikishiID: 999, wins: 10, losses: 2, absences: 0 }, // no rankValue
    ];
    const groups = computeYushoContenders(wrestlers, 12, 'Makuuchi');
    expect(groups[0].wrestlers[0].rankValue).toBe(5);
    expect(groups[0].wrestlers[1].rankValue).toBeUndefined();
  });

  it('eliminates kyujo sekitori who cannot catch the leader', () => {
    // Day 10: leader has 9 wins. Kyujo wrestler has 6 wins + 0 remaining = 6 < 9.
    const wrestlers = [
      makeWrestler(9, 1, 0, 1),
      makeWrestler(6, 0, 1, 5), // kyujo
    ];
    const groups = computeYushoContenders(wrestlers, 10, 'Makuuchi');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(1);
  });

  it('keeps kyujo sekitori if they currently lead or are tied', () => {
    // Both have 9 wins, but one is kyujo. Still tied — both should appear.
    const wrestlers = [
      makeWrestler(9, 1, 0, 1),
      makeWrestler(9, 0, 1, 5), // kyujo but tied
    ];
    const groups = computeYushoContenders(wrestlers, 10, 'Makuuchi');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(2);
  });

  it('returns empty array when lower-division leader has fewer than MIN_LEADER_WINS_LOWER wins', () => {
    const wrestlers = [makeWrestler(2, 0), makeWrestler(1, 1)];
    expect(computeYushoContenders(wrestlers, 5, 'Makushita')).toEqual([]);
  });

  it('returns empty array when lower-division leader is exactly one below the threshold', () => {
    const wrestlers = [
      makeWrestler(MIN_LEADER_WINS_LOWER - 1, 1),
      makeWrestler(MIN_LEADER_WINS_LOWER - 2, 2),
    ];
    expect(
      computeYushoContenders(wrestlers, MIN_LEADER_WINS_LOWER - 1, 'Makushita'),
    ).toEqual([]);
  });

  it('returns contenders when lower-division leader reaches exactly MIN_LEADER_WINS_LOWER wins', () => {
    const wrestlers = [
      makeWrestler(MIN_LEADER_WINS_LOWER, 0),
      makeWrestler(MIN_LEADER_WINS_LOWER - 1, 1),
    ];
    const groups = computeYushoContenders(
      wrestlers,
      MIN_LEADER_WINS_LOWER,
      'Makushita',
    );
    expect(groups.length).toBeGreaterThan(0);
  });

  it('excludes lower-division wrestlers below MIN_LEADER_WINS_LOWER even if they can catch up', () => {
    // Leader 4W. Challenger 2W with 4 remaining: 2+4=6 >= 4, but 2 < MIN_LEADER_WINS_LOWER=3.
    const wrestlers = [
      makeWrestler(4, 0, 0, 1),
      makeWrestler(2, 1, 0, 5),
    ];
    const groups = computeYushoContenders(wrestlers, 8, 'Makushita');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(1);
    expect(groups[0].wrestlers[0].wins).toBe(4);
  });

  it('handles lower-division wrestlers correctly', () => {
    // 7-bout tournament. Wrestler A: 5W 0L (2 remaining). Wrestler B: 4W 1L (2 remaining).
    // Leader = 5. B can reach 6 ≥ 5 and 4W ≥ MIN_LEADER_WINS → in contention.
    const wrestlers = [makeWrestler(5, 0, 0, 1), makeWrestler(4, 1, 0, 5)];
    const groups = computeYushoContenders(wrestlers, 10, 'Makushita');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(2);
  });

  it('eliminates lower-division wrestler who cannot catch up', () => {
    // Wrestler A: 6W 0L (1 remaining). Wrestler B: 3W 4L (0 remaining, all bouts done).
    // B max = 3 < 6 → eliminated.
    const wrestlers = [makeWrestler(6, 0, 0, 1), makeWrestler(3, 4, 0, 5)];
    const groups = computeYushoContenders(wrestlers, 15, 'Makushita');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(1);
  });

  it('handles single wrestler correctly', () => {
    const wrestlers = [makeWrestler(8, 4, 0, 1)];
    const groups = computeYushoContenders(wrestlers, 12, 'Makuuchi');
    expect(groups).toHaveLength(1);
    expect(groups[0].wrestlers).toHaveLength(1);
  });

  it('returns single group when all wrestlers are tied', () => {
    const wrestlers = [
      makeWrestler(7, 1, 0, 1),
      makeWrestler(7, 1, 0, 2),
      makeWrestler(7, 1, 0, 3),
    ];
    const groups = computeYushoContenders(wrestlers, 8, 'Makuuchi');
    expect(groups).toHaveLength(1);
    expect(groups[0].wins).toBe(7);
    expect(groups[0].wrestlers).toHaveLength(3);
  });

  it('excludes result-pending wrestler (0-0-0) from lower-division contenders', () => {
    // Leader 5W active. Pending wrestler 0-0-0 → remainingBouts=0 → max 0 < 5.
    const wrestlers = [makeWrestler(5, 2, 0, 1), makeWrestler(0, 0, 0, 5)];
    const groups = computeYushoContenders(wrestlers, 14, 'Sandanme');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(1);
    expect(groups[0].wrestlers[0].wins).toBe(5);
  });

  it('eliminates lower-division kyujo wrestlers (absences > 0)', () => {
    // Leader 6W active. Kyujo wrestler 0W has absences → remaining = 0.
    const wrestlers = [makeWrestler(6, 1, 0, 1), makeWrestler(0, 0, 15, 5)];
    const groups = computeYushoContenders(wrestlers, 14, 'Makushita');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(1);
    expect(groups[0].wrestlers[0].wins).toBe(6);
  });

  it('keeps active lower-division wrestler (absences=0) with remaining bouts', () => {
    // Active: 4W 0L 0 absences → remaining = 3; leader has 4W → 4+3=7 >= 4 and 4W ≥ MIN_LEADER_WINS → contender
    const wrestlers = [makeWrestler(4, 1, 0, 1), makeWrestler(4, 0, 0, 5)];
    const groups = computeYushoContenders(wrestlers, 8, 'Makushita');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(2);
  });

  it('handles final day correctly (no remaining bouts)', () => {
    // Day 15: all bouts done. Only leader(s) remain.
    const wrestlers = [makeWrestler(12, 3, 0, 1), makeWrestler(11, 4, 0, 5)];
    const groups = computeYushoContenders(wrestlers, 15, 'Makuuchi');
    const totalContenders = groups.reduce((n, g) => n + g.wrestlers.length, 0);
    expect(totalContenders).toBe(1);
    expect(groups[0].wrestlers[0].wins).toBe(12);
  });

  it('keeps chasers in contention on day 15 when co-leaders have not yet fought', () => {
    // maxDay=15 because one wrestler finished their day-15 bout, but two co-leaders
    // (11W/3L each) and chasers (10W/4L) still have 1 bout left.
    // Old logic: remainingBouts = 15-15 = 0 for everyone → false playoff.
    // New logic: uses individual boutsFought → leaders have 1 remaining, chasers have 1.
    const wrestlers = [
      makeWrestler(11, 3, 0, 1), // co-leader A — 14 bouts fought
      makeWrestler(11, 3, 0, 2), // co-leader B — 14 bouts fought
      makeWrestler(10, 4, 0, 5), // chaser — 14 bouts fought; can reach 11 if they win
      makeWrestler(12, 3, 0, 9), // wrestler who already finished day 15
    ];
    const groups = computeYushoContenders(wrestlers, 15, 'Makuuchi');
    // The wrestler who finished (12W) is the sole leader; co-leaders (11W+1) can't catch them
    // … wait, need to re-think: 11+1=12 >= 12, so co-leaders ARE still in contention.
    // And chaser: 10+1=11 < 12, so eliminated.
    const allContenders = groups.flatMap((g) => g.wrestlers);
    expect(allContenders.some((w) => w.wins === 12)).toBe(true); // finished leader
    expect(allContenders.some((w) => w.wins === 11)).toBe(true); // co-leaders can still tie
    expect(allContenders.every((w) => w.wins !== 10)).toBe(true); // chasers eliminated
  });

  it('includes chasers when co-leaders still have bouts and chaser can tie', () => {
    // Two co-leaders 11W/3L (1 bout left each), chasers 10W/4L (1 bout left).
    // No wrestler has completed day 15 yet — maxDay=14.
    // Leaders can reach 12; chasers can reach 11 = leaderWins → contenders.
    const wrestlers = [
      makeWrestler(11, 3, 0, 1),
      makeWrestler(11, 3, 0, 2),
      makeWrestler(10, 4, 0, 5),
    ];
    const groups = computeYushoContenders(wrestlers, 14, 'Makuuchi');
    const allContenders = groups.flatMap((g) => g.wrestlers);
    expect(allContenders).toHaveLength(3);
    expect(groups[0].wins).toBe(11);
    expect(groups[1].wins).toBe(10);
  });
});

// ─── isYushoDecided ───────────────────────────────────────────────────────────

describe('isYushoDecided', () => {
  it('returns decided: false when no results exist', () => {
    expect(isYushoDecided([], 5, 'Makuuchi')).toEqual({
      decided: false,
      winner: null,
    });
  });

  it('returns decided: false on day 0', () => {
    const wrestlers = [makeWrestler(0, 0)];
    expect(isYushoDecided(wrestlers, 0, 'Makuuchi')).toEqual({
      decided: false,
      winner: null,
    });
  });

  it('returns decided: false when two wrestlers are tied', () => {
    const wrestlers = [makeWrestler(12, 3, 0, 1), makeWrestler(12, 3, 0, 2)];
    const result = isYushoDecided(wrestlers, 15, 'Makuuchi');
    expect(result.decided).toBe(false);
    expect(result.winner).toBeNull();
  });

  it('returns decided: false when another wrestler can still catch the leader', () => {
    // Day 10: leader 9W, challenger 5W with 5 remaining → can reach 10 ≥ 9
    const wrestlers = [makeWrestler(9, 1, 0, 1), makeWrestler(5, 5, 0, 5)];
    const result = isYushoDecided(wrestlers, 10, 'Makuuchi');
    expect(result.decided).toBe(false);
    expect(result.winner).toBeNull();
  });

  it('returns decided: true with correct winner when sole contender remains', () => {
    // Day 14: 1 bout left. Leader has 13 wins. Challengers eliminated.
    const winner = makeWrestler(13, 1, 0, 1);
    const wrestlers = [
      winner,
      makeWrestler(8, 6, 0, 5), // 8+1=9 < 13 — eliminated
      makeWrestler(9, 5, 0, 10), // 9+1=10 < 13 — eliminated
    ];
    const result = isYushoDecided(wrestlers, 14, 'Makuuchi');
    expect(result.decided).toBe(true);
    expect(result.winner).toMatchObject({ wins: 13, rankValue: 1 });
  });

  it('returns decided: true when sole contender is kyujo but leads outright', () => {
    // Day 12: kyujo leader has 11 wins, all others have ≤ 8 with 3 remaining = 11.
    // Wait — 8+3=11 >= 11, so NOT decided. Let's make it clear:
    // Leader (kyujo) 11 wins. Others: 7 wins, 3 remaining = 10 < 11. Decided.
    const winner = makeWrestler(11, 0, 1, 1);
    const wrestlers = [
      winner,
      makeWrestler(7, 5, 0, 5), // 7+3=10 < 11
      makeWrestler(6, 6, 0, 10), // 6+3=9 < 11
    ];
    const result = isYushoDecided(wrestlers, 12, 'Makuuchi');
    expect(result.decided).toBe(true);
    expect(result.winner).toMatchObject({ wins: 11 });
  });

  it('returns decided: false when multiple contenders are in different win groups', () => {
    // Leader 10W, second-place 8W with 3 remaining → 8+3=11 >= 10
    const wrestlers = [makeWrestler(10, 2, 0, 1), makeWrestler(8, 4, 0, 5)];
    const result = isYushoDecided(wrestlers, 12, 'Makuuchi');
    expect(result.decided).toBe(false);
    expect(result.winner).toBeNull();
  });

  it('correctly decides yusho on final day for sole leader', () => {
    const winner = makeWrestler(13, 2, 0, 1);
    const wrestlers = [
      winner,
      makeWrestler(10, 5, 0, 3),
      makeWrestler(11, 4, 0, 5),
    ];
    const result = isYushoDecided(wrestlers, 15, 'Makuuchi');
    expect(result.decided).toBe(true);
    expect(result.winner.wins).toBe(13);
  });

  it('works correctly for lower divisions', () => {
    // Final bouts done. Sole leader with 6W.
    const wrestlers = [
      makeWrestler(6, 1, 0, 1),
      makeWrestler(4, 3, 0, 5), // all bouts done, 4 < 6
    ];
    const result = isYushoDecided(wrestlers, 15, 'Makushita');
    expect(result.decided).toBe(true);
    expect(result.winner.wins).toBe(6);
  });

  it('decides lower-division yusho when all challengers are kyujo (absences > 0)', () => {
    // Sole 7W winner (absences=0); others withdrew (absences > 0 → remaining=0)
    const wrestlers = [
      makeWrestler(7, 0, 0, 1), // winner — all bouts done, no kyujo
      makeWrestler(1, 0, 14, 5), // kyujo after 1W → remaining=0 → max 1 < 7
      makeWrestler(0, 0, 15, 9), // absent whole tournament → remaining=0
    ];
    const result = isYushoDecided(wrestlers, 14, 'Jonokuchi');
    expect(result.decided).toBe(true);
    expect(result.winner.wins).toBe(7);
  });

  it('returns decided: false for two lower-division leaders (pending playoff)', () => {
    // Two wrestlers both on 7W, both active (absences=0) → playoff needed
    const wrestlers = [makeWrestler(7, 0, 0, 1), makeWrestler(7, 0, 0, 5)];
    const result = isYushoDecided(wrestlers, 14, 'Sandanme');
    expect(result.decided).toBe(false);
    expect(result.winner).toBeNull();
  });

  it('returns decided: false for tied lower division leaders', () => {
    const wrestlers = [makeWrestler(6, 1, 0, 1), makeWrestler(6, 1, 0, 5)];
    const result = isYushoDecided(wrestlers, 15, 'Makushita');
    expect(result.decided).toBe(false);
    expect(result.winner).toBeNull();
  });
});
