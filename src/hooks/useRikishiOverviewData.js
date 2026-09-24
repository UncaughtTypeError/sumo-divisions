import { useCareerStats } from './useCareerStats';
import { getFlagData } from '../components/common/flags';
import { AWARD_INFO, AWARD_TYPES } from '../utils/awards';

export const DIVISION_ORDER = ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'];

export const SPECIAL_PRIZES = [
  { key: 'shukunsho', label: AWARD_INFO[AWARD_TYPES.SHUKUN_SHO].nameEn, translation: AWARD_INFO[AWARD_TYPES.SHUKUN_SHO].description },
  { key: 'kantosho',  label: AWARD_INFO[AWARD_TYPES.KANTO_SHO].nameEn,  translation: AWARD_INFO[AWARD_TYPES.KANTO_SHO].description },
  { key: 'ginosho',   label: AWARD_INFO[AWARD_TYPES.GINO_SHO].nameEn,   translation: AWARD_INFO[AWARD_TYPES.GINO_SHO].description },
];

const MAKUUCHI_TITLES = new Set(['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira']);

function divisionFromRank(rank) {
  if (!rank) return null;
  const title = rank.split(' ')[0];
  return MAKUUCHI_TITLES.has(title) ? 'Makuuchi' : title;
}

function getDivisionDebuts(rankHistory) {
  if (!rankHistory?.length) return {};
  const firsts = {};
  const sorted = [...rankHistory]
    .filter((h) => h.rankValue == null || h.rankValue < 2000)
    .sort((a, b) => a.bashoId.localeCompare(b.bashoId));
  for (const h of sorted) {
    const div = divisionFromRank(h.rank);
    if (div && !firsts[div]) firsts[div] = h.bashoId;
  }
  return firsts;
}

export function formatDebut(debut) {
  if (!debut) return null;
  const year = debut.slice(0, 4);
  const month = parseInt(debut.slice(4, 6), 10);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[month - 1]} ${year}`;
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatIntai(intai) {
  if (!intai) return null;
  const d = new Date(intai);
  if (isNaN(d.getTime())) return null;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Derives every value the Details / Career / History sections need from a
 * rikishi's profile + career stats. Shared by RikishiOverview (single-scroll
 * layout) and RikishiDetailModal (tabbed layout) so the two surfaces can
 * never drift out of sync with each other.
 *
 * @param {object|null} rikishiDetails
 * @returns {object|null} null when rikishiDetails is not yet available
 */
export function useRikishiOverviewData(rikishiDetails) {
  const careerStats = useCareerStats(rikishiDetails?.id ?? null);

  if (!rikishiDetails) return null;

  const {
    shikonaEn, shikonaJp, currentRank,
    heya, shusshin, height, weight, birthDate, debut, intai, rankHistory,
  } = rikishiDetails;

  const validHistory = (rankHistory ?? []).filter((h) => h.rankValue != null && h.rankValue < 2000);
  const careerHighRank = validHistory.length > 0
    ? validHistory.reduce((best, h) => (h.rankValue < best.rankValue ? h : best)).rank
    : null;

  const flagData      = getFlagData(shusshin);
  const FlagComponent = flagData?.component;
  const countryCode   = flagData?.code;
  const countryName   = flagData?.name;
  const age            = calculateAge(birthDate);
  const debutFormatted = formatDebut(debut);
  const intaiFormatted = formatIntai(intai);
  const isRetired      = !!intai;

  const yushoByDiv = careerStats?.yushoByDivision ?? {};
  const totalYusho = DIVISION_ORDER.reduce((sum, d) => sum + (yushoByDiv[d] ?? 0), 0);
  const totalPrizes = SPECIAL_PRIZES.reduce((sum, { key }) => sum + (careerStats?.[key] ?? 0), 0);
  const divisionHistory = DIVISION_ORDER.map((d) => ({
    division: d,
    count: careerStats?.bashosByDivision?.[d] ?? 0,
  }));
  const totalBouts = (careerStats?.totalWins ?? 0) + (careerStats?.totalLosses ?? 0);
  const winPct = careerStats && totalBouts > 0
    ? ((careerStats.totalWins / totalBouts) * 100).toFixed(1)
    : null;
  const careerBashos = careerStats
    ? divisionHistory.reduce((sum, { count }) => sum + count, 0)
    : 0;

  const divisionDebuts = getDivisionDebuts(rankHistory);
  const careerStart    = debut ? parseInt(debut.slice(0, 4), 10) : null;
  const careerEnd      = intai ? new Date(intai).getUTCFullYear() : null;
  const careerYears    = careerStart !== null
    ? (careerEnd ?? new Date().getFullYear()) - careerStart
    : null;

  const hasHistory = !!(careerStart || DIVISION_ORDER.some((d) => divisionDebuts[d]) || careerStats);

  return {
    shikonaEn, shikonaJp, currentRank, isRetired,
    FlagComponent, countryCode, countryName, shusshin, heya, careerHighRank,
    height, weight, age, debutFormatted, intaiFormatted,
    careerStats, yushoByDiv, totalYusho, totalPrizes, totalBouts, winPct, careerBashos,
    divisionHistory, divisionDebuts, careerStart, careerEnd, careerYears, hasHistory,
  };
}
