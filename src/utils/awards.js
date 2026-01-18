/**
 * Award type definitions and utilities
 */

export const AWARD_TYPES = {
  YUSHO: 'yusho',
  SHUKUN_SHO: 'Shukun-sho',
  KANTO_SHO: 'Kanto-sho',
  GINO_SHO: 'Gino-sho',
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
