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
  FUSEN_LOSS: 'fusen loss',
  EMPTY: '',
};
