// Sumo division and rank constants

// Valid basho months (tournaments occur in odd months only)
export const VALID_BASHO_MONTHS = [1, 3, 5, 7, 9, 11];

// Division hierarchy (top to bottom)
export const DIVISIONS = {
  MAKUUCHI: 'Makuuchi',
  JURYO: 'Juryo',
  MAKUSHITA: 'Makushita',
  SANDANME: 'Sandanme',
  JONIDAN: 'Jonidan',
  JONOKUCHI: 'Jonokuchi',
};

// Ranks within divisions (pyramid levels)
export const RANKS = {
  YOKOZUNA: 'Yokozuna',
  OZEKI: 'Ozeki',
  SEKIWAKE: 'Sekiwake',
  KOMUSUBI: 'Komusubi',
  MAEGASHIRA: 'Maegashira',
  JURYO: 'Juryo',
  MAKUSHITA: 'Makushita',
  SANDANME: 'Sandanme',
  JONIDAN: 'Jonidan',
  JONOKUCHI: 'Jonokuchi',
};

// Rank information with kanji
export const RANK_INFO = {
  [RANKS.YOKOZUNA]: {
    nameEn: 'Yokozuna',
    nameJp: '横綱',
    description: 'Grand Champion',
  },
  [RANKS.OZEKI]: {
    nameEn: 'Ōzeki',
    nameJp: '大関',
    description: 'Champion',
  },
  [RANKS.SEKIWAKE]: {
    nameEn: 'Sekiwake',
    nameJp: '関脇',
    description: 'Junior Champion',
  },
  [RANKS.KOMUSUBI]: {
    nameEn: 'Komusubi',
    nameJp: '小結',
    description: 'Junior Champion 2nd Class',
  },
  [RANKS.MAEGASHIRA]: {
    nameEn: 'Maegashira',
    nameJp: '前頭',
    description: 'Senior Wrestler',
  },
  [RANKS.JURYO]: {
    nameEn: 'Jūryō',
    nameJp: '十両',
    description: 'Second Division',
  },
  [RANKS.MAKUSHITA]: {
    nameEn: 'Makushita',
    nameJp: '幕下',
    description: 'Third Division',
  },
  [RANKS.SANDANME]: {
    nameEn: 'Sandanme',
    nameJp: '三段目',
    description: 'Fourth Division',
  },
  [RANKS.JONIDAN]: {
    nameEn: 'Jonidan',
    nameJp: '序二段',
    description: 'Fifth Division',
  },
  [RANKS.JONOKUCHI]: {
    nameEn: 'Jonokuchi',
    nameJp: '序ノ口',
    description: 'Sixth Division',
  },
};

// Division information with kanji
export const DIVISION_INFO = {
  [DIVISIONS.MAKUUCHI]: {
    nameEn: 'Makuuchi',
    nameJp: '幕内',
    description: 'Top Division',
  },
  [DIVISIONS.JURYO]: {
    nameEn: 'Jūryō',
    nameJp: '十両',
    description: 'Second Division',
  },
  [DIVISIONS.MAKUSHITA]: {
    nameEn: 'Makushita',
    nameJp: '幕下',
    description: 'Third Division',
  },
  [DIVISIONS.SANDANME]: {
    nameEn: 'Sandanme',
    nameJp: '三段目',
    description: 'Fourth Division',
  },
  [DIVISIONS.JONIDAN]: {
    nameEn: 'Jonidan',
    nameJp: '序二段',
    description: 'Fifth Division',
  },
  [DIVISIONS.JONOKUCHI]: {
    nameEn: 'Jonokuchi',
    nameJp: '序ノ口',
    description: 'Sixth Division',
  },
};

// Rank group information with kanji
export const RANK_GROUP_INFO = {
  sekitori: {
    nameEn: 'Sekitori',
    nameJp: '関取',
    description: 'Professionals',
  },
  sanyaku: {
    nameEn: "San'yaku",
    nameJp: '三役',
    description: 'Three Ranks',
  },
  minarai: {
    nameEn: 'Minarai',
    nameJp: '見習',
    description: 'Apprentices',
  },
};

// Pyramid structure (10 levels from top to bottom)
export const PYRAMID_LEVELS = [
  {
    id: 1,
    rank: RANKS.YOKOZUNA,
    division: DIVISIONS.MAKUUCHI,
    color: 'yokozuna',
    apiDivision: 'Makuuchi',
  },
  {
    id: 2,
    rank: RANKS.OZEKI,
    division: DIVISIONS.MAKUUCHI,
    color: 'sanyaku',
    apiDivision: 'Makuuchi',
  },
  {
    id: 3,
    rank: RANKS.SEKIWAKE,
    division: DIVISIONS.MAKUUCHI,
    color: 'sanyaku',
    apiDivision: 'Makuuchi',
  },
  {
    id: 4,
    rank: RANKS.KOMUSUBI,
    division: DIVISIONS.MAKUUCHI,
    color: 'sanyaku',
    apiDivision: 'Makuuchi',
  },
  {
    id: 5,
    rank: RANKS.MAEGASHIRA,
    division: DIVISIONS.MAKUUCHI,
    color: 'makuuchi',
    apiDivision: 'Makuuchi',
  },
  {
    id: 6,
    rank: RANKS.JURYO,
    division: DIVISIONS.JURYO,
    color: 'juryo',
    apiDivision: 'Juryo',
  },
  {
    id: 7,
    rank: RANKS.MAKUSHITA,
    division: DIVISIONS.MAKUSHITA,
    color: 'makushita',
    apiDivision: 'Makushita',
  },
  {
    id: 8,
    rank: RANKS.SANDANME,
    division: DIVISIONS.SANDANME,
    color: 'sandanme',
    apiDivision: 'Sandanme',
  },
  {
    id: 9,
    rank: RANKS.JONIDAN,
    division: DIVISIONS.JONIDAN,
    color: 'jonidan',
    apiDivision: 'Jonidan',
  },
  {
    id: 10,
    rank: RANKS.JONOKUCHI,
    division: DIVISIONS.JONOKUCHI,
    color: 'jonokuchi',
    apiDivision: 'Jonokuchi',
  },
];

// Grouping labels for Y-axis legend
export const DIVISION_LEGEND = [
  {
    name: DIVISIONS.MAKUUCHI,
    description: 'Division 1',
    color: '#c5c5c5',
  },
  {
    name: DIVISIONS.JURYO,
    description: 'Division 2',
    color: '#c5c5c5',
  },
  {
    name: DIVISIONS.MAKUSHITA,
    description: 'Division 3',
    color: '#c5c5c5',
  },
  {
    name: DIVISIONS.SANDANME,
    description: 'Division 4',
    color: '#c5c5c5',
  },
  {
    name: DIVISIONS.JONIDAN,
    description: 'Division 5',
    color: '#c5c5c5',
  },
  {
    name: DIVISIONS.JONOKUCHI,
    description: 'Division 6',
    color: '#c5c5c5',
  },
];

// Grouping labels for Y-axis legend
export const RANK_GROUPS = [
  {
    id: 'sanyaku',
    name: "San'yaku",
    description: 'Three Ranks',
    levelIds: [1, 2, 3, 4], // Yokozuna, Ozeki, Sekiwake, Komusubi
    color: '#ff6b6b',
  },
  {
    id: 'sekitori',
    name: 'Sekitori',
    description: 'Professionals',
    levelIds: [1, 2, 3, 4, 5, 6], // Maku-uchi + Juryo
    color: '#daa520',
  },
  {
    id: 'minarai',
    name: 'Minarai',
    description: 'Apprentices',
    levelIds: [7, 8, 9, 10], // Makushita, Sandanme, Jonidan, Jonokuchi
    color: '#b8a88a',
  },
];

// Match result types
export const MATCH_RESULTS = {
  WIN: 'win',
  LOSS: 'loss',
  FUSEN_WIN: 'fusen win',
  FUSEN_LOSS: 'fusen loss',
  ABSENT: 'absent',
  EMPTY: '',
};

// Results that count as "competing" on a given day
// (wrestler was present and had a bout outcome — fusen win counts, fusen loss does not)
export const COMPETING_RESULTS = new Set(['win', 'loss', 'fusen win']);

// Ordered rank list from highest to lowest
export const RANK_ORDER = [
  RANKS.YOKOZUNA,
  RANKS.OZEKI,
  RANKS.SEKIWAKE,
  RANKS.KOMUSUBI,
  RANKS.MAEGASHIRA,
  RANKS.JURYO,
  RANKS.MAKUSHITA,
  RANKS.SANDANME,
  RANKS.JONIDAN,
  RANKS.JONOKUCHI,
];

// Sekitori (professional) ranks - 15-bout tournaments, 8-win kachi-koshi
export const SEKITORI_RANK_ORDER = [
  RANKS.YOKOZUNA,
  RANKS.OZEKI,
  RANKS.SEKIWAKE,
  RANKS.KOMUSUBI,
  RANKS.MAEGASHIRA,
  RANKS.JURYO,
];

// Apprentice (lower division) ranks - 7-bout tournaments, 4-win kachi-koshi
export const APPRENTICE_RANK_ORDER = [
  RANKS.MAKUSHITA,
  RANKS.SANDANME,
  RANKS.JONIDAN,
  RANKS.JONOKUCHI,
];

// Short abbreviations for rank display in badges
export const RANK_ABBREVIATIONS = {
  [RANKS.YOKOZUNA]: 'Y',
  [RANKS.OZEKI]: 'O',
  [RANKS.SEKIWAKE]: 'S',
  [RANKS.KOMUSUBI]: 'K',
  [RANKS.MAEGASHIRA]: 'M',
  [RANKS.JURYO]: 'J',
  [RANKS.MAKUSHITA]: 'Ms',
  [RANKS.SANDANME]: 'Sd',
  [RANKS.JONIDAN]: 'Jd',
  [RANKS.JONOKUCHI]: 'Jk',
};

/**
 * Abbreviate a full rank string (e.g. "Makushita 60 TD") using RANK_ABBREVIATIONS
 * so that divisions sharing the same first letter are distinguishable
 * (Maegashira=M, Makushita=Ms, Juryo=J, Jonidan=Jd, Jonokuchi=Jk, etc.).
 *
 * @param {string|null} rank  e.g. "Maegashira 3 East" | "Makushita 60 TD"
 * @returns {string|null}     e.g. "M3e" | "Ms60TD"
 */
export function abbreviateRank(rank) {
  if (!rank) return null;
  const match = rank.match(/^(\w+)(?:\s+(\d+)(?:\s+(\S+))?)?$/i);
  if (!match) return rank;
  const [, rankName, num, suffix] = match;
  const abbr = RANK_ABBREVIATIONS[rankName] ?? rankName[0];
  const numStr = num ?? '';
  if (!suffix) return `${abbr}${numStr}`;
  if (suffix.toLowerCase() === 'east') return `${abbr}${numStr}e`;
  if (suffix.toLowerCase() === 'west') return `${abbr}${numStr}w`;
  return `${abbr}${numStr}${suffix}`;
}

// CSS variable color name per rank (matches --color-* variables)
export const RANK_COLORS = {
  [RANKS.YOKOZUNA]: 'yokozuna',
  [RANKS.OZEKI]: 'sanyaku',
  [RANKS.SEKIWAKE]: 'sanyaku',
  [RANKS.KOMUSUBI]: 'sanyaku',
  [RANKS.MAEGASHIRA]: 'makuuchi',
  [RANKS.JURYO]: 'juryo',
  [RANKS.MAKUSHITA]: 'makushita',
  [RANKS.SANDANME]: 'sandanme',
  [RANKS.JONIDAN]: 'jonidan',
  [RANKS.JONOKUCHI]: 'jonokuchi',
};

/**
 * All selectable views for the wrestler sidebar, ordered top to bottom.
 * Each entry drives the header colour, banzuke fetch division, and rank filter.
 */
export const SIDEBAR_VIEWS = [
  { value: 'makuuchi', label: 'Makuuchi', nameJp: '幕内', apiDivision: 'Makuuchi', color: 'makuuchi', isDivisionView: true,  rank: null },
  { value: 'yokozuna',  label: 'Yokozuna',  nameJp: '横綱', apiDivision: 'Makuuchi', color: 'yokozuna',  isDivisionView: false, rank: 'Yokozuna'  },
  { value: 'ozeki',     label: 'Ozeki',     nameJp: '大関', apiDivision: 'Makuuchi', color: 'sanyaku',  isDivisionView: false, rank: 'Ozeki'     },
  { value: 'sekiwake',  label: 'Sekiwake',  nameJp: '関脇', apiDivision: 'Makuuchi', color: 'sanyaku',  isDivisionView: false, rank: 'Sekiwake'  },
  { value: 'komusubi',  label: 'Komusubi',  nameJp: '小結', apiDivision: 'Makuuchi', color: 'sanyaku',  isDivisionView: false, rank: 'Komusubi'  },
  { value: 'maegashira',label: 'Maegashira',nameJp: '前頭', apiDivision: 'Makuuchi', color: 'makuuchi', isDivisionView: false, rank: 'Maegashira' },
  { value: 'juryo',     label: 'Juryo',     nameJp: '十両', apiDivision: 'Juryo',    color: 'juryo',    isDivisionView: false, rank: 'Juryo'     },
  { value: 'makushita', label: 'Makushita', nameJp: '幕下', apiDivision: 'Makushita',color: 'makushita',isDivisionView: false, rank: 'Makushita' },
  { value: 'sandanme',  label: 'Sandanme',  nameJp: '三段目',apiDivision: 'Sandanme', color: 'sandanme', isDivisionView: false, rank: 'Sandanme'  },
  { value: 'jonidan',   label: 'Jonidan',   nameJp: '序二段',apiDivision: 'Jonidan',  color: 'jonidan',  isDivisionView: false, rank: 'Jonidan'   },
  { value: 'jonokuchi', label: 'Jonokuchi', nameJp: '序ノ口',apiDivision: 'Jonokuchi',color: 'jonokuchi',isDivisionView: false, rank: 'Jonokuchi' },
];

// Maps a rank name to its API division string (used for award/record lookups)
export const RANK_TO_API_DIVISION = {
  [RANKS.YOKOZUNA]: 'Makuuchi',
  [RANKS.OZEKI]: 'Makuuchi',
  [RANKS.SEKIWAKE]: 'Makuuchi',
  [RANKS.KOMUSUBI]: 'Makuuchi',
  [RANKS.MAEGASHIRA]: 'Makuuchi',
  [RANKS.JURYO]: 'Juryo',
  [RANKS.MAKUSHITA]: 'Makushita',
  [RANKS.SANDANME]: 'Sandanme',
  [RANKS.JONIDAN]: 'Jonidan',
  [RANKS.JONOKUCHI]: 'Jonokuchi',
};
