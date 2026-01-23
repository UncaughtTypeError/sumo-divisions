import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRikishi, useAllRikishi } from '../../hooks/useRikishi'
import { QueryClientWrapper } from '../testUtils'
import * as rikishiService from '../../services/api/rikishiService'

// Mock the rikishi service
vi.mock('../../services/api/rikishiService', () => ({
  getRikishi: vi.fn(),
  getAllRikishi: vi.fn(),
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
