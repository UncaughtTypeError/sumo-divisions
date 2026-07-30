/**
 * Bout record utilities — record status (KK/MK), day-accurate computation,
 * kyujo detection, rank classification, rank lookup, and kinboshi calculation.
 */

/**
 * Professional (sekitori) divisions that hold 15-bout tournaments.
 * Lower divisions run 7-bout tournaments with scheduled non-fight days.
 */
export const SEKITORI_DIVISIONS = ['Makuuchi', 'Juryo'];

// ─── Record status (kachi-koshi / make-koshi) ─────────────────────────────────

export const RECORD_STATUS_TYPES = {
  KACHI_KOSHI: 'kachi-koshi',
  MAKE_KOSHI:  'make-koshi',
};

export const RECORD_STATUS_INFO = {
  [RECORD_STATUS_TYPES.KACHI_KOSHI]: {
    abbrev:      'KK',
    nameEn:      'Kachi-koshi',
    nameJp:      '勝ち越し',
    description: 'Winning Record',
    color:       'green',
  },
  [RECORD_STATUS_TYPES.MAKE_KOSHI]: {
    abbrev:      'MK',
    nameEn:      'Make-koshi',
    nameJp:      '負け越し',
    description: 'Losing Record',
    color:       'red',
  },
};

/**
 * Get the record status (kachi-koshi or make-koshi) for a wrestler.
 * Threshold is 8 wins/losses for sekitori, 4 for lower divisions.
 *
 * @param {number} wins
 * @param {number} losses
 * @param {string} division - API division name
 * @param {number} [absences] - Absences count toward losses
 * @returns {string|null}
 */
export function getRecordStatus(wins, losses, division, absences = 0) {
  const threshold   = SEKITORI_DIVISIONS.includes(division) ? 8 : 4;
  const totalLosses = losses + absences;
  if (wins       >= threshold) return RECORD_STATUS_TYPES.KACHI_KOSHI;
  if (totalLosses >= threshold) return RECORD_STATUS_TYPES.MAKE_KOSHI;
  return null;
}

// ─── Day-accurate record computation ─────────────────────────────────────────

/**
 * Compute a wrestler's cumulative win/loss/absence record up to and including
 * the given tournament day.
 *
 * When `division` is provided, only genuine kyujo absences are counted —
 * scheduled non-bout days for lower-division wrestlers are excluded via
 * isAbsentKyujo. Without division, all 'absent' entries count (legacy behaviour).
 *
 * @param {Array}  record   - Wrestler's record array from banzuke data
 * @param {number} day      - 1-based day to compute up to
 * @param {string} [division] - API division name; enables kyujo-aware absence counting
 * @returns {{ wins: number, losses: number, absences: number } | null}
 */
export function computeRecordOnDay(record, day, division = null) {
  if (!day || !Array.isArray(record)) return null;
  let wins = 0, losses = 0, absences = 0;
  for (let i = 0; i < day; i++) {
    const r = record[i]?.result;
    if (r === undefined || r === '') break;
    if (r === 'win'  || r === 'fusen win')  wins++;
    else if (r === 'loss' || r === 'fusen loss') losses++;
    else if (r === 'absent') {
      if (!division || isAbsentKyujo(record, i + 1, division)) absences++;
    }
  }
  return { wins, losses, absences };
}

// ─── Kyujo detection ──────────────────────────────────────────────────────────

/**
 * Determine whether an 'absent' result on a specific day is a genuine kyujo
 * withdrawal rather than a scheduled non-fight day.
 *
 * Sekitori fight every day, so any absence is genuine kyujo.
 * Lower-division wrestlers only fight 7 bouts per basho, so 'absent' on
 * off-days is normal scheduling. We treat it as genuine kyujo only when no
 * subsequent win/loss/fusen-win appears in the record after that day.
 *
 * @param {Array}   record   - Wrestler's full record array
 * @param {number}  day      - 1-based day being inspected
 * @param {string}  division - API division name
 * @returns {boolean}
 */
export function isAbsentKyujo(record, day, division) {
  if (!Array.isArray(record)) return false;
  if (SEKITORI_DIVISIONS.includes(division)) return true;
  return !record.slice(day).some(
    (r) => r.result === 'win' || r.result === 'loss' || r.result === 'fusen win',
  );
}

/**
 * Returns true if a wrestler has withdrawn from the basho — i.e. they have at
 * least one 'absent' day with no subsequent win, loss, or fusen-win. Works for
 * all divisions (unlike isAbsentKyujo, does not short-circuit for sekitori).
 * Use this for the full-tournament default view where we want to detect current
 * withdrawal regardless of division.
 *
 * @param {Array} record - Wrestler's full record array
 * @returns {boolean}
 */
export function isWithdrawn(record, division = null) {
  if (!Array.isArray(record)) return false;

  // Lower division wrestlers fight 7 bouts across a 15-day basho; the remaining
  // days are scheduled rest days, not kyujo. Once all 7 bouts are fought, any
  // trailing 'absent' entries must not be treated as withdrawal.
  if (division && !SEKITORI_DIVISIONS.includes(division)) {
    const boutsFought = record.filter(
      (r) => r.result === 'win' || r.result === 'loss' || r.result === 'fusen win' || r.result === 'fusen loss'
    ).length;
    if (boutsFought >= 7) return false;
  }

  return record.some(
    (entry, i) =>
      entry.result === 'absent' &&
      !record.slice(i + 1).some(
        (r) => r.result === 'win' || r.result === 'loss' || r.result === 'fusen win',
      ),
  );
}

// ─── Rank classification ──────────────────────────────────────────────────────

/** @param {string} rank @returns {boolean} */
export function isYokozuna(rank) {
  if (!rank) return false;
  return rank.toLowerCase().startsWith('yokozuna');
}

/** @param {string} rank @returns {boolean} */
export function isMaegashira(rank) {
  if (!rank) return false;
  return rank.toLowerCase().startsWith('maegashira');
}

// ─── Rank lookup ──────────────────────────────────────────────────────────────

/**
 * Build a Map from rikishiID to rank string.
 *
 * @param {Array} [eastWrestlers]
 * @param {Array} [westWrestlers]
 * @returns {Map<number, string>}
 */
export function buildRankLookup(eastWrestlers = [], westWrestlers = []) {
  const lookup = new Map();
  [...eastWrestlers, ...westWrestlers].forEach((w) => {
    if (w.rikishiID && w.rank) lookup.set(w.rikishiID, w.rank);
  });
  return lookup;
}

// ─── Kinboshi ─────────────────────────────────────────────────────────────────

/**
 * Count kinboshi (gold stars) for a wrestler.
 * Maegashira: wins against Yokozuna. Yokozuna: losses to Maegashira.
 *
 * @param {string} wrestlerRank
 * @param {Array}  record
 * @param {Map}    rankLookup
 * @returns {number}
 */
export function getKinboshiCount(wrestlerRank, record, rankLookup) {
  if (!record || !Array.isArray(record) || !rankLookup) return 0;

  const isMaegashiraWrestler = isMaegashira(wrestlerRank);
  const isYokozunaWrestler   = isYokozuna(wrestlerRank);

  if (!isMaegashiraWrestler && !isYokozunaWrestler) return 0;

  return record.filter((match) => {
    const opponentRank = rankLookup.get(match.opponentID);
    if (isMaegashiraWrestler) return match.result === 'win'  && isYokozuna(opponentRank);
    return                           match.result === 'loss' && isMaegashira(opponentRank);
  }).length;
}

/**
 * Check whether a single match is a kinboshi match.
 *
 * @param {string} wrestlerRank
 * @param {object} match
 * @param {Map}    rankLookup
 * @returns {boolean}
 */
export function isKinboshiMatch(wrestlerRank, match, rankLookup) {
  if (!match || !rankLookup) return false;

  const opponentRank         = rankLookup.get(match.opponentID);
  const isMaegashiraWrestler = isMaegashira(wrestlerRank);
  const isYokozunaWrestler   = isYokozuna(wrestlerRank);

  if (isMaegashiraWrestler) return match.result === 'win'  && isYokozuna(opponentRank);
  if (isYokozunaWrestler)   return match.result === 'loss' && isMaegashira(opponentRank);
  return false;
}
