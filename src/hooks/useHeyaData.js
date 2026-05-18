import { useMemo } from 'react'
import { useAllRikishi } from './useRikishi'
import { RANK_ORDER } from '../utils/constants'

/**
 * Extract the base rank category from a full rank string.
 * e.g. "Maegashira 5 East" → "Maegashira", "Yokozuna 1 East" → "Yokozuna"
 *
 * @param {string} currentRank - Full rank string from the API
 * @returns {string|null} Base rank name or null if unrecognised
 */
export function extractRankCategory(currentRank) {
  if (!currentRank) return null
  for (const rank of RANK_ORDER) {
    if (currentRank.startsWith(rank)) return rank
  }
  return null
}

/**
 * Derives a list of heya (stable) objects from the full rikishi roster.
 * Each heya object contains: name, total, rikishi[], byRank{ rank: rikishi[] }.
 *
 * @param {object} options - Options forwarded to useAllRikishi
 * @returns {{ heyaList: Array, isLoading: boolean, error: unknown }}
 */
export function useHeyaData(options = {}) {
  const { data, isLoading, error } = useAllRikishi(options)

  const heyaList = useMemo(() => {
    if (!data?.records) return []

    const heyaMap = {}
    for (const rikishi of data.records) {
      const heya = rikishi.heya
      if (!heya) continue

      if (!heyaMap[heya]) {
        heyaMap[heya] = { name: heya, byRank: {}, rikishi: [], total: 0 }
      }

      const rankCategory = extractRankCategory(rikishi.currentRank)
      if (rankCategory) {
        if (!heyaMap[heya].byRank[rankCategory]) {
          heyaMap[heya].byRank[rankCategory] = []
        }
        heyaMap[heya].byRank[rankCategory].push(rikishi)
      }

      heyaMap[heya].rikishi.push(rikishi)
      heyaMap[heya].total++
    }

    return Object.values(heyaMap).sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  return { heyaList, isLoading, error }
}

export default useHeyaData
