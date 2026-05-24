import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCareerStats } from '../../hooks/useCareerStats'
import { QueryClientWrapper } from '../testUtils'

const mockStats = {
  yusho: 3,
  yushoByDivision: { Makuuchi: 2, Juryo: 1 },
  shukunsho: 1,
  kantosho: 0,
  ginosho: 2,
  totalWins: 500,
  totalLosses: 200,
  totalAbsences: 10,
  bashosByDivision: { Makuuchi: 30, Juryo: 5 },
}

const mockCareerStatsFile = {
  generated: '2025-01-01T00:00:00.000Z',
  lastBashoId: '202501',
  records: {
    '42': mockStats,
    '99': { yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0, totalWins: 10, totalLosses: 15, totalAbsences: 0, bashosByDivision: {} },
  },
}

function mockFetchOk(body) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  })
}

function mockFetchNotOk() {
  return vi.fn().mockResolvedValue({ ok: false })
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useCareerStats', () => {
  it('returns null while data is still loading', () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})))

    const { result } = renderHook(() => useCareerStats(42), {
      wrapper: QueryClientWrapper,
    })

    expect(result.current).toBeNull()
  })

  it('returns null when rikishiId is null and data is available', async () => {
    vi.stubGlobal('fetch', mockFetchOk(mockCareerStatsFile))

    const { result } = renderHook(() => useCareerStats(null), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })

    expect(result.current).toBeNull()
  })

  it('returns null when fetch returns a non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetchNotOk())

    const { result } = renderHook(() => useCareerStats(42), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })

    expect(result.current).toBeNull()
  })

  it('returns null when wrestler ID is not found in records', async () => {
    vi.stubGlobal('fetch', mockFetchOk(mockCareerStatsFile))

    const { result } = renderHook(() => useCareerStats(9999), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(result.current).toBeNull()
    })
  })

  it('returns correct stats for a known rikishiId', async () => {
    vi.stubGlobal('fetch', mockFetchOk(mockCareerStatsFile))

    const { result } = renderHook(() => useCareerStats(42), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(result.current).not.toBeNull()
    })

    expect(result.current).toEqual(mockStats)
  })

  it('looks up by String key so numeric rikishiId matches string-keyed records', async () => {
    vi.stubGlobal('fetch', mockFetchOk(mockCareerStatsFile))

    const { result } = renderHook(() => useCareerStats(99), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(result.current).not.toBeNull()
    })

    expect(result.current.totalWins).toBe(10)
  })

  it('fetches /career-stats.json', async () => {
    vi.stubGlobal('fetch', mockFetchOk(mockCareerStatsFile))

    renderHook(() => useCareerStats(42), { wrapper: QueryClientWrapper })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/career-stats.json')
    })
  })
})
