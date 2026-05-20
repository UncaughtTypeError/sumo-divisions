import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRikishi, useAllRikishi, useRikishiList, useRikishiMatches } from '../../hooks/useRikishi'
import { QueryClientWrapper } from '../testUtils'
import * as rikishiService from '../../services/api/rikishiService'

// Mock the rikishi service
vi.mock('../../services/api/rikishiService', () => ({
  getRikishi: vi.fn(),
  getAllRikishi: vi.fn(),
  getRikishiMatches: vi.fn(),
}))

describe('useRikishi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch rikishi details when rikishiId is provided', async () => {
    const mockRikishi = {
      id: 19,
      shikonaEn: 'Hoshoryu',
      heya: 'Tatsunami',
      shusshin: 'Mongolia, Ulaanbaatar',
    }

    rikishiService.getRikishi.mockResolvedValueOnce(mockRikishi)

    const { result } = renderHook(() => useRikishi(19), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockRikishi)
    expect(rikishiService.getRikishi).toHaveBeenCalledWith(19)
  })

  it('should not fetch when rikishiId is null', () => {
    const { result } = renderHook(() => useRikishi(null), {
      wrapper: QueryClientWrapper,
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(rikishiService.getRikishi).not.toHaveBeenCalled()
  })

  it('should not fetch when rikishiId is undefined', () => {
    const { result } = renderHook(() => useRikishi(undefined), {
      wrapper: QueryClientWrapper,
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(rikishiService.getRikishi).not.toHaveBeenCalled()
  })

  it('should handle API errors', async () => {
    const error = new Error('Network error')
    rikishiService.getRikishi.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useRikishi(19), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('useRikishiList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty maps and no loading when IDs list is empty', () => {
    const { result } = renderHook(() => useRikishiList([]), { wrapper: QueryClientWrapper })
    expect(result.current.rikishiMap.size).toBe(0)
    expect(result.current.rankHistoryMap.size).toBe(0)
    expect(result.current.isLoading).toBe(false)
    expect(rikishiService.getRikishi).not.toHaveBeenCalled()
  })

  it('does not fetch when enabled is false', () => {
    renderHook(() => useRikishiList([1, 2], { enabled: false }), { wrapper: QueryClientWrapper })
    expect(rikishiService.getRikishi).not.toHaveBeenCalled()
  })

  it('fetches one query per ID and builds rikishiMap', async () => {
    const record1 = { id: 1, shikonaEn: 'Terunofuji', heya: 'Isegahama' }
    const record2 = { id: 2, shikonaEn: 'Hoshoryu',   heya: 'Tatsunami' }
    rikishiService.getRikishi
      .mockResolvedValueOnce(record1)
      .mockResolvedValueOnce(record2)

    const { result } = renderHook(() => useRikishiList([1, 2]), { wrapper: QueryClientWrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.rikishiMap.size).toBe(2)
    expect(result.current.rikishiMap.get(1).heya).toBe('Isegahama')
    expect(result.current.rikishiMap.get(2).heya).toBe('Tatsunami')
  })

  it('builds rankHistoryMap only for wrestlers that have rankHistory', async () => {
    const rankHistory = [{ bashoId: '202605', rank: 'Yokozuna 1 East', rankValue: 101 }]
    const record1 = { id: 1, shikonaEn: 'Terunofuji', rankHistory }
    const record2 = { id: 2, shikonaEn: 'Hoshoryu' }            // no rankHistory
    rikishiService.getRikishi
      .mockResolvedValueOnce(record1)
      .mockResolvedValueOnce(record2)

    const { result } = renderHook(() => useRikishiList([1, 2]), { wrapper: QueryClientWrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.rankHistoryMap.size).toBe(1)
    expect(result.current.rankHistoryMap.get(1)).toEqual(rankHistory)
    expect(result.current.rankHistoryMap.has(2)).toBe(false)
  })

  it('does not include wrestler in rankHistoryMap when rankHistory is empty array', async () => {
    const record = { id: 1, shikonaEn: 'Terunofuji', rankHistory: [] }
    rikishiService.getRikishi.mockResolvedValueOnce(record)

    const { result } = renderHook(() => useRikishiList([1]), { wrapper: QueryClientWrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.rikishiMap.size).toBe(1)  // wrestler found
    expect(result.current.rankHistoryMap.size).toBe(0) // but no rank history
  })
})

describe('useRikishiMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch when either ID is missing', () => {
    renderHook(() => useRikishiMatches(null, 2), { wrapper: QueryClientWrapper })
    renderHook(() => useRikishiMatches(1, null), { wrapper: QueryClientWrapper })
    expect(rikishiService.getRikishiMatches).not.toHaveBeenCalled()
  })

  it('fetches match history when both IDs are provided', async () => {
    const mockMatches = { records: [{ bashoId: '202605', result: 'win' }] }
    rikishiService.getRikishiMatches.mockResolvedValueOnce(mockMatches)

    const { result } = renderHook(() => useRikishiMatches(1, 2), { wrapper: QueryClientWrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rikishiService.getRikishiMatches).toHaveBeenCalledWith(1, 2)
    expect(result.current.data).toEqual(mockMatches)
  })
})

describe('useAllRikishi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch all rikishi and build a lookup map', async () => {
    const mockAllRikishi = {
      limit: 1000,
      skip: 0,
      total: 3,
      records: [
        { id: 1, shikonaEn: 'Terunofuji', heya: 'Isegahama', shusshin: 'Mongolia' },
        { id: 2, shikonaEn: 'Hoshoryu', heya: 'Tatsunami', shusshin: 'Mongolia, Ulaanbaatar' },
        { id: 3, shikonaEn: 'Takakeisho', heya: 'Tokiwayama', shusshin: 'Hyogo' },
      ],
    }

    rikishiService.getAllRikishi.mockResolvedValueOnce(mockAllRikishi)

    const { result } = renderHook(() => useAllRikishi(), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockAllRikishi)
    expect(result.current.rikishiMap.size).toBe(3)
    expect(result.current.rikishiMap.get(1).shikonaEn).toBe('Terunofuji')
    expect(result.current.rikishiMap.get(2).heya).toBe('Tatsunami')
  })

  it('should return empty map when no data', () => {
    const { result } = renderHook(() => useAllRikishi({ enabled: false }), {
      wrapper: QueryClientWrapper,
    })

    expect(result.current.rikishiMap.size).toBe(0)
  })

  it('should handle API errors', async () => {
    const error = new Error('Network error')
    rikishiService.getAllRikishi.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAllRikishi(), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})
