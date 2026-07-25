import { useQuery } from '@tanstack/react-query';

async function fetchCareerStats() {
  const res = await fetch('/career-stats.json');
  if (!res.ok) return null; // file not yet generated — degrade gracefully
  return res.json();
}

/**
 * Returns career statistics for a single wrestler from the pre-generated
 * public/career-stats.json. The JSON is fetched once and cached for the
 * session; subsequent lookups are instant Map reads.
 *
 * Returns null when the file doesn't exist yet or the wrestler has no entry.
 *
 * @param {number|null} rikishiId
 * @returns {{ yusho, shukunsho, kantosho, ginosho,
 *             kinboshiWon, kinboshiGiven,
 *             totalWins, totalLosses, totalAbsences,
 *             bashosByDivision } | null}
 */
export function useCareerStats(rikishiId) {
  const { data } = useQuery({
    queryKey: ['careerStats'],
    queryFn:  fetchCareerStats,
    staleTime: 1000 * 60 * 60 * 24, // 24 h — file only updates after bashos
    retry: false,
  });

  if (!data || !rikishiId) return null;
  return data.records?.[String(rikishiId)] ?? null;
}
