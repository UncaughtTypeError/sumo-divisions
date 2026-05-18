import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAllDivisionsBanzuke } from '../../hooks/useAllDivisionsBanzuke'
import { QueryClientWrapper, mockBanzukeData } from '../testUtils'

vi.mock('../../services/api/banzukeService', () => ({
  getBanzuke: vi.fn(),
}))

import { getBanzuke } from '../../services/api/banzukeService'

const DIVISION_COUNT = 6

describe('useAllDivisionsBanzuke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch when enabled is false', () => {
    renderHook(
      () => useAllDivisionsBanzuke('202601', { enabled: false }),
      { wrapper: QueryClientWrapper }
    )

    expect(getBanzuke).not.toHaveBeenCalled()
  })

  it('does not fetch when bashoId is missing', () => {
    renderHook(
      () => useAllDivisionsBanzuke(null),
      { wrapper: QueryClientWrapper }
    )

    expect(getBanzuke).not.toHaveBeenCalled()
  })

  it('fires one query per division (six total)', async () => {
    getBanzuke.mockResolvedValue({ ...mockBanzukeData, east: [], west: [], isEmpty: true })

    renderHook(
      () => useAllDivisionsBanzuke('202601'),
      { wrapper: QueryClientWrapper }
    )

    await waitFor(() => {
      expect(getBanzuke).toHaveBeenCalledTimes(DIVISION_COUNT)
    })
  })

  it('uses the same query key format as useBanzuke', async () => {
    getBanzuke.mockResolvedValue({ ...mockBanzukeData, east: [], west: [], isEmpty: true })

    renderHook(
      () => useAllDivisionsBanzuke('202601'),
      { wrapper: QueryClientWrapper }
    )

    await waitFor(() => {
      expect(getBanzuke).toHaveBeenCalledWith('202601', 'Makuuchi')
      expect(getBanzuke).toHaveBeenCalledWith('202601', 'Juryo')
      expect(getBanzuke).toHaveBeenCalledWith('202601', 'Makushita')
      expect(getBanzuke).toHaveBeenCalledWith('202601', 'Sandanme')
      expect(getBanzuke).toHaveBeenCalledWith('202601', 'Jonidan')
      expect(getBanzuke).toHaveBeenCalledWith('202601', 'Jonokuchi')
    })
  })

  it('returns isLoading true while fetching', () => {
    getBanzuke.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBanzukeData), 500))
    )

    const { result } = renderHook(
      () => useAllDivisionsBanzuke('202601'),
      { wrapper: QueryClientWrapper }
    )

    expect(result.current.isLoading).toBe(true)
  })

  it('flattens east and west wrestlers from all divisions into allWrestlers', async () => {
    const east = mockBanzukeData.east
    const west = mockBanzukeData.west
    getBanzuke.mockResolvedValue({ ...mockBanzukeData, east, west, isEmpty: false })

    const { result } = renderHook(
      () => useAllDivisionsBanzuke('202601'),
      { wrapper: QueryClientWrapper }
    )

    await waitFor(() => {
      // 6 divisions × (east.length + west.length) from mockBanzukeData
      expect(result.current.allWrestlers).toHaveLength(
        DIVISION_COUNT * (east.length + west.length)
      )
    })
  })

  it('returns isError true when any division fetch fails', async () => {
    getBanzuke
      .mockResolvedValueOnce({ ...mockBanzukeData, east: [], west: [], isEmpty: true })
      .mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(
      () => useAllDivisionsBanzuke('202601'),
      { wrapper: QueryClientWrapper }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
