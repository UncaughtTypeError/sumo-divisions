// Sumo division and rank constants

// Valid basho months (tournaments occur in odd months only)
export const VALID_BASHO_MONTHS = [1, 3, 5, 7, 9, 11]

// Division hierarchy (top to bottom)
export const DIVISIONS = {
  MAKUUCHI: 'Makuuchi',
  JURYO: 'Juryo',
  MAKUSHITA: 'Makushita',
  SANDANME: 'Sandanme',
  JONIDAN: 'Jonidan',
  JONOKUCHI: 'Jonokuchi',
}

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
}

// Pyramid structure (10 levels from top to bottom)
export const PYRAMID_LEVELS = [
  {
    id: 1,
    rank: RANKS.YOKOZUNA,
    division: DIVISIONS.MAKUUCHI,
    color: 'sanyaku',
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
]

// Grouping labels for Y-axis legend
export const RANK_GROUPS = [
  {
    name: "San'yaku",
    description: 'Three Ranks',
    levelIds: [1, 2, 3, 4], // Yokozuna, Ozeki, Sekiwake, Komusubi
    color: '#ff6b6b',
  },
  {
    name: 'Maku-uchi',
    description: 'Division 1',
    levelIds: [1, 2, 3, 4, 5], // San'yaku + Maegashira
    color: '#ffa07a',
  },
  {
    name: 'Sekitori',
    description: 'Professionals',
    levelIds: [1, 2, 3, 4, 5, 6], // Maku-uchi + Juryo
    color: '#daa520',
  },
  {
    name: 'Minarai',
    description: 'Apprentices',
    levelIds: [7, 8, 9, 10], // Makushita, Sandanme, Jonidan, Jonokuchi
    color: '#b8a88a',
  },
]

// Match result types
export const MATCH_RESULTS = {
  WIN: 'win',
  LOSS: 'loss',
  FUSEN_LOSS: 'fusen loss',
  EMPTY: '',
}
