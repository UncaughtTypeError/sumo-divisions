/**
 * Award type definitions and utilities
 */

export const AWARD_TYPES = {
  YUSHO: 'yusho',
  SHUKUN_SHO: 'Shukun-sho',
  KANTO_SHO: 'Kanto-sho',
  GINO_SHO: 'Gino-sho',
};

/**
 * Record status types (kachi-koshi / make-koshi)
 */
export const RECORD_STATUS_TYPES = {
  KACHI_KOSHI: 'kachi-koshi',
  MAKE_KOSHI: 'make-koshi',
};

/**
 * Professional divisions (sekitori) with 15 bouts
 * Amateur/apprentice divisions have only 7 bouts
 */
export const SEKITORI_DIVISIONS = ['Makuuchi', 'Juryo'];

export const RECORD_STATUS_INFO = {
  [RECORD_STATUS_TYPES.KACHI_KOSHI]: {
    abbrev: 'KK',
    nameEn: 'Kachi-koshi',
    nameJp: '勝ち越し',
    description: 'Winning Record',
    color: 'green',
  },
  [RECORD_STATUS_TYPES.MAKE_KOSHI]: {
    abbrev: 'MK',
    nameEn: 'Make-koshi',
    nameJp: '負け越し',
    description: 'Losing Record',
    color: 'red',
  },
};

export const AWARD_INFO = {
  [AWARD_TYPES.YUSHO]: {
    abbrev: 'Y',
    icon: '🏆',
    nameEn: 'Yusho',
    nameJp: '優勝',
    description: 'Tournament Champion',
  },
  [AWARD_TYPES.SHUKUN_SHO]: {
    abbrev: 'S',
    icon: null,
    nameEn: 'Shukun-shō',
    nameJp: '殊勲賞',
    description: 'Outstanding Performance',
  },
  [AWARD_TYPES.KANTO_SHO]: {
    abbrev: 'K',
    icon: null,
    nameEn: 'Kantō-shō',
    nameJp: '敢闘賞',
    description: 'Fighting Spirit',
  },
  [AWARD_TYPES.GINO_SHO]: {
    abbrev: 'G',
    icon: null,
    nameEn: 'Ginō-shō',
    nameJp: '技能賞',
    description: 'Technique',
  },
};

/**
 * Get awards for a wrestler based on basho results
 * @param {number} rikishiId - The wrestler's ID
 * @param {object} bashoResults - The basho results containing yusho and specialPrizes
 * @param {string} division - The division to check for yusho (e.g., 'Makuuchi', 'Juryo')
 * @returns {string[]} Array of award type keys the wrestler won
 */
export function getWrestlerAwards(rikishiId, bashoResults, division) {
  if (!bashoResults || !rikishiId) return [];

  const awards = [];

  // Check for yusho in this division
  const divisionYusho = bashoResults.yusho?.find((y) => y.type === division);
  if (divisionYusho && divisionYusho.rikishiId === rikishiId) {
    awards.push(AWARD_TYPES.YUSHO);
  }

  // Check for special prizes (only for Makuuchi division)
  if (division === 'Makuuchi' && bashoResults.specialPrizes) {
    for (const prize of bashoResults.specialPrizes) {
      if (prize.rikishiId === rikishiId) {
        awards.push(prize.type);
      }
    }
  }

  return awards;
}

/**
 * Get the record status (kachi-koshi or make-koshi) for a wrestler
 * @param {number} wins - Number of wins
 * @param {number} losses - Number of losses
 * @param {string} division - The division (affects threshold: 8 for sekitori, 4 for others)
 * @param {number} absences - Number of absences (count towards losses)
 * @returns {string|null} Record status type or null if not yet determined
 */
export function getRecordStatus(wins, losses, division, absences = 0) {
  const threshold = SEKITORI_DIVISIONS.includes(division) ? 8 : 4;
  const totalLosses = losses + absences;

  if (wins >= threshold) {
    return RECORD_STATUS_TYPES.KACHI_KOSHI;
  }
  if (totalLosses >= threshold) {
    return RECORD_STATUS_TYPES.MAKE_KOSHI;
  }

  return null;
}

/**
 * Check if a rank string indicates a Yokozuna
 * @param {string} rank - The rank string (e.g., "Yokozuna 1 East", "Maegashira 5 West")
 * @returns {boolean} True if the rank is Yokozuna
 */
export function isYokozuna(rank) {
  if (!rank) return false;
  return rank.toLowerCase().startsWith('yokozuna');
}

/**
 * Check if a rank string indicates a Maegashira
 * @param {string} rank - The rank string (e.g., "Maegashira 5 West")
 * @returns {boolean} True if the rank is Maegashira
 */
export function isMaegashira(rank) {
  if (!rank) return false;
  return rank.toLowerCase().startsWith('maegashira');
}

/**
 * Build a lookup map from wrestler ID to rank
 * @param {Array} eastWrestlers - Array of wrestlers from east side
 * @param {Array} westWrestlers - Array of wrestlers from west side
 * @returns {Map} Map of rikishiID to rank string
 */
export function buildRankLookup(eastWrestlers = [], westWrestlers = []) {
  const lookup = new Map();
  [...eastWrestlers, ...westWrestlers].forEach((wrestler) => {
    if (wrestler.rikishiID && wrestler.rank) {
      lookup.set(wrestler.rikishiID, wrestler.rank);
    }
  });
  return lookup;
}

/**
 * Calculate kinboshi count - wins/losses between Maegashira and Yokozuna
 * For Maegashira: counts wins against Yokozuna (gold stars earned)
 * For Yokozuna: counts losses against Maegashira (gold stars given away)
 * @param {string} wrestlerRank - The wrestler's rank
 * @param {Array} record - The wrestler's match record array
 * @param {Map} rankLookup - Map of opponentID to rank string
 * @returns {number} Number of kinboshi
 */
export function getKinboshiCount(wrestlerRank, record, rankLookup) {
  if (!record || !Array.isArray(record) || !rankLookup) {
    return 0;
  }

  const isMaegashiraWrestler = isMaegashira(wrestlerRank);
  const isYokozunaWrestler = isYokozuna(wrestlerRank);

  if (!isMaegashiraWrestler && !isYokozunaWrestler) {
    return 0;
  }

  return record.filter((match) => {
    const opponentRank = rankLookup.get(match.opponentID);
    if (isMaegashiraWrestler) {
      return match.result === 'win' && isYokozuna(opponentRank);
    }
    // Yokozuna: count losses to Maegashira
    return match.result === 'loss' && isMaegashira(opponentRank);
  }).length;
}

/**
 * Check if a specific match is a kinboshi match
 * @param {string} wrestlerRank - The wrestler's rank
 * @param {object} match - The match object with result and opponentID
 * @param {Map} rankLookup - Map of opponentID to rank string
 * @returns {boolean} True if this match is a kinboshi
 */
export function isKinboshiMatch(wrestlerRank, match, rankLookup) {
  if (!match || !rankLookup) return false;

  const opponentRank = rankLookup.get(match.opponentID);
  const isMaegashiraWrestler = isMaegashira(wrestlerRank);
  const isYokozunaWrestler = isYokozuna(wrestlerRank);

  if (isMaegashiraWrestler) {
    return match.result === 'win' && isYokozuna(opponentRank);
  }
  if (isYokozunaWrestler) {
    return match.result === 'loss' && isMaegashira(opponentRank);
  }
  return false;
}
