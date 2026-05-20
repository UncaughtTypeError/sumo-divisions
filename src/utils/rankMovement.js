/**
 * Rank movement utilities.
 *
 * Derives rank change direction + magnitude, career-high status, and debut
 * status from a wrestler's `rankHistory` array (returned by the API when
 * `ranks=true` is requested).
 *
 * computeWrestlerRankIndicators returns:
 *   isCareerHigh  {boolean}       – strictly new career best (never been higher)
 *   debutType     {string|null}   – 'sanyaku-debut' | 'division-debut' | null
 *   rankMovement  {string|null}   – 'up' | 'down' | 'same' | null
 *   rankDelta     {number}        – abs magnitude in 0.5-unit rank steps
 *
 * Notes on badge rendering intent:
 *  - debutType and isCareerHigh are mutually exclusive (a debut IS a career
 *    high; no need to show both).
 *  - rankMovement ('up'/'down') is independent and CAN appear alongside a
 *    debut or career-high badge.
 *  - 'same' suppresses any rank indicator (no badge, no arrow).
 */

// ─── Previous basho ───────────────────────────────────────────────────────────

const VALID_BASHO_MONTHS = ['01', '03', '05', '07', '09', '11'];

/**
 * Return the bashoId immediately before the given one.
 * e.g. '202605' → '202603', '202601' → '202511'
 */
export function getPreviousBashoId(bashoId) {
  if (!bashoId || bashoId.length !== 6) return null;
  const year = parseInt(bashoId.slice(0, 4), 10);
  const month = bashoId.slice(4, 6);
  const idx = VALID_BASHO_MONTHS.indexOf(month);
  if (idx < 0) return null;
  if (idx === 0) return `${year - 1}11`;
  return `${year}${VALID_BASHO_MONTHS[idx - 1]}`;
}

// ─── Banzuke position ─────────────────────────────────────────────────────────

const RANK_BASE_ORDER = [
  'Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira',
  'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi',
];

const DIVISION_OFFSETS = (() => {
  const maxPerSide = {
    // Sanyaku: 1 per side so adjacent ranks are exactly 1 banzuke slot apart.
    // e.g. S1E(4)→O1W(3) = 0.5 ranks; O1W(3)→Y1E(0) = 1.5 ranks.
    Yokozuna: 1, Ozeki: 1, Sekiwake: 1, Komusubi: 1, Maegashira: 17,
    Juryo: 14, Makushita: 60, Sandanme: 100, Jonidan: 100, Jonokuchi: 20,
  };
  const offsets = {};
  let cum = 0;
  for (const base of RANK_BASE_ORDER) {
    offsets[base] = cum;
    cum += (maxPerSide[base] ?? 20) * 2;
  }
  return offsets;
})();

/**
 * Parse the base rank name from a full rank string.
 * "Maegashira 16 East" → "Maegashira"
 */
export function parseBanzukeRankBase(rank) {
  if (!rank) return null;
  const m = rank.match(/^(.+?)\s+\d+/);
  return m ? m[1].trim() : null;
}

export function getBanzukePosition(rank) {
  if (!rank) return null;
  const m = rank.match(/^(.+?)\s+(\d+)\s+(East|West)$/i);
  if (!m) return null;
  const base = m[1].trim();
  const num  = parseInt(m[2], 10);
  const west = m[3].toLowerCase() === 'west';
  const offset = DIVISION_OFFSETS[base];
  if (offset === undefined) return null;
  return offset + (num - 1) * 2 + (west ? 1 : 0);
}

/**
 * Determine movement direction using rankValue when available, falling back to
 * banzuke position only for same-rankValue East/West distinction.
 *
 * Using rankValue avoids the edge case where rank numbers > 1 for sanyaku
 * (e.g. Ozeki 2 West) bleed past the next group's start in the position
 * formula and produce the wrong direction.
 */
function directionFromRankValue(currRankValue, prevRankValue, currRank, prevRank) {
  if (currRankValue != null && prevRankValue != null && currRankValue !== prevRankValue) {
    return currRankValue < prevRankValue ? 'up' : 'down';
  }
  // Same rankValue (e.g. Y1E vs Y1W both = 101) — use position for E/W
  const d = computeRankDelta(currRank, prevRank);
  if (d < 0) return 'up';
  if (d > 0) return 'down';
  return 'same';
}

/**
 * Corrected delta for cross-group movements where the position formula returns 0
 * due to rank-number bleeding (e.g. Ozeki 2 West ≡ Sekiwake 1 West in position space).
 *
 * The worse-ranked entry's within-group position tells us how many banzuke slots
 * separate it from the group boundary.  Add 1 for the boundary crossing itself.
 * e.g. S1W → O2W: worseWithin(S1W)=1 → (1+1)×0.5 = 1.0 ✓
 *      S1E → O1W: worseWithin(S1E)=0 → (0+1)×0.5 = 0.5 ✓ (but position gives 0.5 anyway)
 *
 * Returns the corrected delta, or null if the ranks are in the same group (no fix needed).
 */
function crossGroupDelta(currRank, currRankValue, prevRank, prevRankValue) {
  const currM = currRank?.match(/^(.+?)\s+(\d+)\s+(East|West)$/i);
  const prevM = prevRank?.match(/^(.+?)\s+(\d+)\s+(East|West)$/i);
  if (!currM || !prevM || currM[1] === prevM[1]) return null; // same group — no fix needed

  // The worse entry (higher rankValue) is the one further from the group boundary
  const worseM = (currRankValue ?? Infinity) > (prevRankValue ?? 0) ? currM : prevM;
  const worseNum    = parseInt(worseM[2], 10);
  const worseIsWest = worseM[3].toLowerCase() === 'west';
  return ((worseNum - 1) * 2 + (worseIsWest ? 1 : 0) + 1) * 0.5;
}

/**
 * Compute signed rank delta between two rank strings.
 * Negative = improved (moved up banzuke), positive = worsened (moved down).
 * Each East/West slot = 0.5 "rank units" displayed to the user.
 */
export function computeRankDelta(currentRank, previousRank) {
  const curr = getBanzukePosition(currentRank);
  const prev = getBanzukePosition(previousRank);
  if (curr === null || prev === null) return 0;
  return (curr - prev) * 0.5;
}

// ─── Debut classification ────────────────────────────────────────────────────

// San'yaku ranks get a specific "rank debut" badge (New Yokozuna, New Ozeki…)
// because reaching one is a significant career milestone beyond just a
// division crossing.
const SANYAKU_RANKS = new Set(['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi']);

// Maps each rank base to its division string.  All Makuuchi ranks share one
// division; lower divisions each map to themselves.
const DIVISION_FOR_RANK = {
  Yokozuna: 'Makuuchi', Ozeki: 'Makuuchi', Sekiwake: 'Makuuchi',
  Komusubi: 'Makuuchi', Maegashira: 'Makuuchi',
  Juryo: 'Juryo', Makushita: 'Makushita',
  Sandanme: 'Sandanme', Jonidan: 'Jonidan', Jonokuchi: 'Jonokuchi',
};

// ─── Per-wrestler enrichment ──────────────────────────────────────────────────

/**
 * @param {object} wrestler          - Banzuke wrestler object (rank, rankValue, rikishiID…)
 * @param {Array|null} rankHistory   - rankHistory array from useRankHistory, or null/undefined
 *                                     when the wrestler is not in the rank-history response.
 * @param {string} currentBashoId
 * @param {string|null} previousBashoId
 */
/**
 * Compute per-row indicators for a single entry in the rank history table.
 *
 * The history array must be sorted newest-first (as the API returns it).
 * "Previous" basho = the next element in the array (index + 1 = one basho earlier).
 *
 * @param {object} entry        - Current rank history entry { rank, rankValue, bashoId }
 * @param {number} index        - Its index in validHistory (newest = 0)
 * @param {Array}  validHistory - Pre-filtered history (no Mae-zumo / Banzuke-gai)
 * @returns {{ movement: string|null, delta: number, debutType: string|null, isCareerHigh: boolean }}
 */
export function computeHistoryRowIndicators(entry, index, validHistory) {
  // All entries older than the current one
  const priorEntries = validHistory.slice(index + 1);
  // Immediately preceding basho (one older)
  const prevEntry = validHistory[index + 1] ?? null;

  // ── Career high ────────────────────────────────────────────────────────────
  const currentPosition = getBanzukePosition(entry.rank);
  const priorPositions  = priorEntries.map(h => getBanzukePosition(h.rank)).filter(p => p !== null);
  const prevBestPos     = priorPositions.length > 0 ? Math.min(...priorPositions) : Infinity;
  const isNewCareerHigh = currentPosition !== null && currentPosition < prevBestPos;

  // ── Debut ──────────────────────────────────────────────────────────────────
  const currentBase = parseBanzukeRankBase(entry.rank);
  let debutType = null;

  if (currentBase) {
    if (priorEntries.length === 0) {
      debutType = 'division-debut';
    } else if (SANYAKU_RANKS.has(currentBase)) {
      if (!priorEntries.some(h => parseBanzukeRankBase(h.rank) === currentBase)) {
        debutType = 'sanyaku-debut';
      }
    } else {
      const currentDiv = DIVISION_FOR_RANK[currentBase] ?? currentBase;
      const hadDivision = priorEntries.some(h => {
        const base = parseBanzukeRankBase(h.rank);
        return (DIVISION_FOR_RANK[base] ?? base) === currentDiv;
      });
      if (!hadDivision) debutType = 'division-debut';
    }
  }

  const isCareerHigh = isNewCareerHigh && !debutType;

  // ── Movement ───────────────────────────────────────────────────────────────
  let movement = null;
  let delta    = 0;

  if (prevEntry) {
    movement = directionFromRankValue(entry.rankValue, prevEntry.rankValue, entry.rank, prevEntry.rank);
    delta    = Math.abs(computeRankDelta(entry.rank, prevEntry.rank));

    if (movement === 'same') {
      movement = null; // no indicator when rank is unchanged
    } else if (delta === 0 && movement !== null) {
      // Position formula returned 0 due to rank-number bleeding (e.g. O2W ≡ S1W).
      // Apply cross-group correction; if still 0, suppress the arrow entirely.
      delta    = crossGroupDelta(entry.rank, entry.rankValue, prevEntry.rank, prevEntry.rankValue) ?? 0;
      if (delta === 0) movement = null;
    }
  }

  return { movement, delta, debutType, isCareerHigh };
}

export function computeWrestlerRankIndicators(wrestler, rankHistory, currentBashoId, previousBashoId) {
  // When rank history is unavailable we cannot determine debut or career-high
  // status — return all nulls rather than firing false positives.
  if (!rankHistory?.length) {
    return { isCareerHigh: false, debutType: null, rankMovement: null, rankDelta: 0 };
  }

  // History before the current basho — used for debut detection and movement.
  const priorEntries = rankHistory.filter(h => h.bashoId < currentBashoId);

  // ── Career high ────────────────────────────────────────────────────────────
  // Compare using the banzuke POSITION formula (which distinguishes East from
  // West at the same rank number) rather than the raw rankValue from
  // rankHistory (where East and West of the same number share one value).
  //
  // For example, M2E and M2W both have rankValue 502 in rankHistory, so a
  // raw value comparison would wrongly suppress the High badge when a wrestler
  // improves from M2W to M2E. The position formula gives M2E < M2W, so the
  // improvement is detected correctly.
  //
  // Mae-zumo / Banzuke-gai entries have no valid banzuke position (regex
  // won't match) → getBanzukePosition returns null → filtered out.
  const currentPosition = getBanzukePosition(wrestler.rank);
  const priorPositions  = priorEntries
    .map(h => getBanzukePosition(h.rank))
    .filter(p => p !== null);
  const previousBestPosition = priorPositions.length > 0 ? Math.min(...priorPositions) : Infinity;
  const isNewCareerHigh = currentPosition !== null && currentPosition < previousBestPosition;

  // ── Debut detection ────────────────────────────────────────────────────────
  const currentBase = parseBanzukeRankBase(wrestler.rank);
  let debutType = null;

  if (currentBase) {
    if (priorEntries.length === 0) {
      // Absolutely first basho ever recorded → division debut
      debutType = 'division-debut';
    } else if (SANYAKU_RANKS.has(currentBase)) {
      // San'yaku debut: first time at this specific rank (Y / O / S / K).
      // Being at Ozeki East and then Ozeki West is NOT a debut — same rank base.
      const hadRankBefore = priorEntries.some(
        h => parseBanzukeRankBase(h.rank) === currentBase,
      );
      if (!hadRankBefore) debutType = 'sanyaku-debut';
    } else {
      // Non-san'yaku: debut only if wrestler has never been in this division.
      // Moving up within Maegashira (M16 → M8) is NOT a debut.
      // Promoting from Juryo to Maegashira IS a Makuuchi division debut.
      const currentDiv = DIVISION_FOR_RANK[currentBase] ?? currentBase;
      const hadDivisionBefore = priorEntries.some(h => {
        const base = parseBanzukeRankBase(h.rank);
        const div  = DIVISION_FOR_RANK[base] ?? base;
        return div === currentDiv;
      });
      if (!hadDivisionBefore) debutType = 'division-debut';
    }
  }

  // A debut IS a career high — no need to show both badges simultaneously.
  const isCareerHigh = isNewCareerHigh && !debutType;

  // ── Movement ───────────────────────────────────────────────────────────────
  // Computed independently so it can appear alongside a debut or career-high
  // badge (showing how many ranks the wrestler climbed/dropped).
  let rankMovement = null;
  let rankDelta    = 0;

  if (priorEntries.length > 0) {
    // Prefer the immediately previous basho; fall back to most recent prior.
    const prevEntry = previousBashoId
      ? (rankHistory.find(h => h.bashoId === previousBashoId)
         ?? [...priorEntries].sort((a, b) => b.bashoId.localeCompare(a.bashoId))[0])
      : [...priorEntries].sort((a, b) => b.bashoId.localeCompare(a.bashoId))[0];

    if (prevEntry) {
      rankMovement = directionFromRankValue(wrestler.rankValue, prevEntry.rankValue, wrestler.rank, prevEntry.rank);
      rankDelta    = Math.abs(computeRankDelta(wrestler.rank, prevEntry.rank));

      if (rankMovement === 'same') {
        rankMovement = null;
      } else if (rankDelta === 0 && rankMovement !== null) {
        rankDelta    = crossGroupDelta(wrestler.rank, wrestler.rankValue, prevEntry.rank, prevEntry.rankValue) ?? 0;
        if (rankDelta === 0) rankMovement = null;
      }
    }
  }

  return { isCareerHigh, debutType, rankMovement, rankDelta };
}
