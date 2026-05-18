import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useHeyaData, extractRankCategory } from '../../hooks/useHeyaData'
import { QueryClientWrapper } from '../testUtils'

vi.mock('../../hooks/useRikishi', () => ({
  useAllRikishi: vi.fn(),
}))

import { useAllRikishi } from '../../hooks/useRikishi'

const mockRecords = [
  { id: 1, shikonaEn: 'Terunofuji', heya: 'Isegahama', currentRank: 'Yokozuna 1 East' },
  { id: 2, shikonaEn: 'Hoshoryu', heya: 'Tatsunami', currentRank: 'Ozeki 1 East' },
  { id: 3, shikonaEn: 'Kotozakura', heya: 'Kotozakura', currentRank: 'Ozeki 1 West' },
  { id: 4, shikonaEn: 'Abi', heya: 'Shikoroyama', currentRank: 'Maegashira 3 East' },
  { id: 5, shikonaEn: 'Mitoryu', heya: 'Tatsunami', currentRank: 'Juryo 1 East' },
  { id: 6, shikonaEn: 'SomeRikishi', heya: 'Isegahama', currentRank: 'Makushita 5 East' },
]

describe('extractRankCategory', () => {
  it('extracts Yokozuna from "Yokozuna 1 East"', () => {
    expect(extractRankCategory('Yokozuna 1 East')).toBe('Yokozuna')
  })

  it('extracts Maegashira from "Maegashira 10 West"', () => {
    expect(extractRankCategory('Maegashira 10 West')).toBe('Maegashira')
  })

  it('extracts Juryo from "Juryo 3 East"', () => {
    expect(extractRankCategory('Juryo 3 East')).toBe('Juryo')
  })

  it('extracts Makushita from "Makushita 5 East"', () => {
    expect(extractRankCategory('Makushita 5 East')).toBe('Makushita')
  })

  it('returns null for null input', () => {
    expect(extractRankCategory(null)).toBeNull()
  })

  it('returns null for unrecognised rank string', () => {
    expect(extractRankCategory('Unknown Rank')).toBeNull()
  })
})

describe('useHeyaData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty heyaList while loading', () => {
    useAllRikishi.mockReturnValue({ data: null, isLoading: true, error: null })

    const { result } = renderHook(() => useHeyaData(), { wrapper: QueryClientWrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.heyaList).toEqual([])
  })

  it('returns error from useAllRikishi', () => {
    const error = new Error('Network error')
    useAllRikishi.mockReturnValue({ data: null, isLoading: false, error })

    const { result } = renderHook(() => useHeyaData(), { wrapper: QueryClientWrapper })

    expect(result.current.error).toEqual(error)
  })

  it('groups rikishi by heya', async () => {
    useAllRikishi.mockReturnValue({
      data: { records: mockRecords },
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useHeyaData(), { wrapper: QueryClientWrapper })

    await waitFor(() => {
      expect(result.current.heyaList.length).toBeGreaterThan(0)
    })

    const isegahama = result.current.heyaList.find((h) => h.name === 'Isegahama')
    expect(isegahama).toBeDefined()
    expect(isegahama.total).toBe(2)
  })

  it('buckets rikishi by rank within each heya', async () => {
    useAllRikishi.mockReturnValue({
      data: { records: mockRecords },
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useHeyaData(), { wrapper: QueryClientWrapper })

    await waitFor(() => {
      expect(result.current.heyaList.length).toBeGreaterThan(0)
    })

    const isegahama = result.current.heyaList.find((h) => h.name === 'Isegahama')
    expect(isegahama.byRank['Yokozuna']).toHaveLength(1)
    expect(isegahama.byRank['Makushita']).toHaveLength(1)
  })

  it('returns heya list sorted alphabetically by default', async () => {
    useAllRikishi.mockReturnValue({
      data: { records: mockRecords },
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useHeyaData(), { wrapper: QueryClientWrapper })

    await waitFor(() => {
      expect(result.current.heyaList.length).toBeGreaterThan(0)
    })

    const names = result.current.heyaList.map((h) => h.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('skips rikishi without a heya', async () => {
    const recordsWithMissingHeya = [
      ...mockRecords,
      { id: 99, shikonaEn: 'NoHeya', heya: null, currentRank: 'Maegashira 1 East' },
    ]
    useAllRikishi.mockReturnValue({
      data: { records: recordsWithMissingHeya },
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useHeyaData(), { wrapper: QueryClientWrapper })

    await waitFor(() => {
      expect(result.current.heyaList.length).toBeGreaterThan(0)
    })

    const heyaNames = result.current.heyaList.map((h) => h.name)
    expect(heyaNames).not.toContain(null)
  })

  it('tatsunami heya has two rikishi from different divisions', async () => {
    useAllRikishi.mockReturnValue({
      data: { records: mockRecords },
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useHeyaData(), { wrapper: QueryClientWrapper })

    await waitFor(() => {
      expect(result.current.heyaList.length).toBeGreaterThan(0)
    })

    const tatsunami = result.current.heyaList.find((h) => h.name === 'Tatsunami')
    expect(tatsunami.total).toBe(2)
    expect(tatsunami.byRank['Ozeki']).toHaveLength(1)
    expect(tatsunami.byRank['Juryo']).toHaveLength(1)
  })
})
