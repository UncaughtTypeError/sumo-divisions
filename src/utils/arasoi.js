/**
 * Yusho Arasoi (優勝争い) — tournament title race utilities.
 *
 * Computes which wrestlers are mathematically still in contention for the
 * basho championship at any point during an ongoing tournament.
 *
 * Mathematical contention rule:
 *   A wrestler can still win (or force a playoff) as long as:
 *     currentWins + remainingBouts >= leaderWins
 *
 * This is conservative: it assumes the best case for the challenger
 * (wins every remaining bout) and the worst case for the leader (wins
 * none). Anyone who satisfies the inequality could end up tied and
 * eligible for a playoff.
 */

import { SEKITORI_DIVISIONS } from './records';

// ─── Appearance threshold ─────────────────────────────────────────────────────

/**
 * The arasoi is suppressed until the tournament leader reaches this many wins.
 * Below this threshold the field is too open to be meaningful.
 */
export const MIN_LEADER_WINS = 4;

// ─── Division constants ───────────────────────────────────────────────────────

/**
 * Total scheduled bouts per tournament by division type.
 * Sekitori compete once per day in a 15-day basho.
 * Lower divisions have 7 bouts spread across the same 15-day period.
 *
 * @param {string} division - API division name
 * @returns {number}
 */
export function getTotalBouts(division) {
  return SEKITORI_DIVISIONS.includes(division) ? 15 : 7;
}

// ─── Remaining bouts ─────────────────────────────────────────────────────────

/**
 * Maximum additional wins a wrestler can still accumulate in this basho.
 *
 * **Sekitori (Makuuchi / Juryo)**
 * Fight one bout every day. Any absence is a genuine kyujo (withdrawal)
 * — the wrestler will not compete again, so remaining bouts drop to 0.
 *
 * **Lower divisions (Makushita and below)**
 * Have 7 bouts scheduled across the 15-day period; the other 8 days are
 * rest days. The API's `absences` field counts only genuine kyujo days —
 * scheduled rest days are never included — so `absences > 0` reliably
 * detects withdrawal, identical to the sekitori check.
 *
 * @param {{ wins: number, losses: number, absences: number }} wrestler
 * @param {number} currentDay  Highest day with any completed result (maxDay)
 * @param {string} division
 * @returns {number}
 */
export function getRemainingBouts(wrestler, currentDay, division) {
  const total = getTotalBouts(division);

  if (SEKITORI_DIVISIONS.includes(division)) {
    if (wrestler.absences > 0) return 0;
    const boutsFought = wrestler.wins + wrestler.losses;
    return Math.max(0, total - boutsFought);
  }

  // Lower divisions: genuine kyujo is reflected in `absences` (rest days are not).
  if (wrestler.absences > 0) return 0;
  // No activity recorded and no absences = pre-tournament or result-pending withdrawal.
  if (wrestler.wins === 0 && wrestler.losses === 0) return 0;

  const boutsFought = wrestler.wins + wrestler.losses;
  return Math.max(0, total - boutsFought);
}

// ─── Contender groups ─────────────────────────────────────────────────────────

/**
 * Compute yusho contender groups for the current tournament snapshot.
 *
 * Returns an array of { wins, wrestlers } objects sorted by wins
 * descending (highest win group first). Within each group wrestlers are
 * sorted by banzuke position (rankValue ascending = closer to Yokozuna).
 *
 * Returns an empty array when there are no results yet (currentDay === 0)
 * or the wrestler list is empty.
 *
 * @param {Array<{
 *   rikishiID: number,
 *   wins: number,
 *   losses: number,
 *   absences: number,
 *   rankValue?: number,
 * }>} wrestlers
 * @param {number} currentDay  Current tournament day (maxDay from sidebar)
 * @param {string} division
 * @returns {Array<{ wins: number, wrestlers: Array }>}
 */
export function computeYushoContenders(wrestlers, currentDay, division) {
  if (!wrestlers?.length || !currentDay) return [];

  const withRemaining = wrestlers.map((w) => ({
    ...w,
    remainingBouts: getRemainingBouts(w, currentDay, division),
  }));

  const leaderWins = Math.max(0, ...withRemaining.map((w) => w.wins));

  if (leaderWins < MIN_LEADER_WINS) return [];

  const contenders = withRemaining.filter(
    (w) => w.wins + w.remainingBouts >= leaderWins && w.wins >= MIN_LEADER_WINS,
  );

  if (!contenders.length) return [];

  const groupMap = new Map();
  contenders.forEach((w) => {
    if (!groupMap.has(w.wins)) groupMap.set(w.wins, []);
    groupMap.get(w.wins).push(w);
  });

  return [...groupMap.entries()]
    .sort(([a], [b]) => b - a)
    .map(([wins, group]) => ({
      wins,
      wrestlers: [...group].sort(
        (a, b) => (a.rankValue ?? Infinity) - (b.rankValue ?? Infinity),
      ),
    }));
}

// ─── Yusho decided ────────────────────────────────────────────────────────────

/**
 * Determine whether the yusho has been mathematically clinched.
 *
 * The title is decided when exactly one wrestler remains after eliminating
 * everyone who can no longer tie the current leader — meaning their lead
 * cannot be matched even if they lose every remaining bout.
 *
 * Returns { decided: false, winner: null } when:
 *   - No results exist yet
 *   - Two or more wrestlers are tied at the top
 *   - Any other wrestler can still reach the leader's win total
 *
 * @param {Array} wrestlers
 * @param {number} currentDay
 * @param {string} division
 * @returns {{ decided: boolean, winner: object | null }}
 */
export function isYushoDecided(wrestlers, currentDay, division) {
  const groups = computeYushoContenders(wrestlers, currentDay, division);

  if (!groups.length) return { decided: false, winner: null };

  if (groups.length === 1 && groups[0].wrestlers.length === 1) {
    return { decided: true, winner: groups[0].wrestlers[0] };
  }

  return { decided: false, winner: null };
}
