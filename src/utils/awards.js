/**
 * Tournament award type definitions and utilities.
 */

export const AWARD_TYPES = {
  YUSHO:      'yusho',
  SHUKUN_SHO: 'Shukun-sho',
  KANTO_SHO:  'Kanto-sho',
  GINO_SHO:   'Gino-sho',
};

export const AWARD_INFO = {
  [AWARD_TYPES.YUSHO]: {
    abbrev:      'Y',
    icon:        '🏆',
    nameEn:      'Yusho',
    nameJp:      '優勝',
    description: 'Tournament Champion',
  },
  [AWARD_TYPES.SHUKUN_SHO]: {
    abbrev:      'S',
    icon:        null,
    nameEn:      'Shukun-shō',
    nameJp:      '殊勲賞',
    description: 'Outstanding Performance',
  },
  [AWARD_TYPES.KANTO_SHO]: {
    abbrev:      'K',
    icon:        null,
    nameEn:      'Kantō-shō',
    nameJp:      '敢闘賞',
    description: 'Fighting Spirit',
  },
  [AWARD_TYPES.GINO_SHO]: {
    abbrev:      'G',
    icon:        null,
    nameEn:      'Ginō-shō',
    nameJp:      '技能賞',
    description: 'Technique',
  },
};

/**
 * Get the tournament awards earned by a wrestler in a given basho.
 *
 * @param {number} rikishiId    - Wrestler ID
 * @param {object} bashoResults - Basho results containing yusho and specialPrizes
 * @param {string} division     - Division to check for yusho (e.g. 'Makuuchi')
 * @returns {string[]}
 */
export function getWrestlerAwards(rikishiId, bashoResults, division) {
  if (!bashoResults || !rikishiId) return [];

  const awards = [];

  const divisionYusho = bashoResults.yusho?.find((y) => y.type === division);
  if (divisionYusho && divisionYusho.rikishiId === rikishiId) {
    awards.push(AWARD_TYPES.YUSHO);
  }

  if (division === 'Makuuchi' && bashoResults.specialPrizes) {
    for (const prize of bashoResults.specialPrizes) {
      if (prize.rikishiId === rikishiId) awards.push(prize.type);
    }
  }

  return awards;
}
