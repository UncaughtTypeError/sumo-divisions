import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBanzuke } from '../../hooks/useBanzuke'
import { QueryClientWrapper, mockBanzukeData } from '../testUtils'

// Mock the banzuke service
vi.mock('../../services/api/banzukeService', () => ({
  getBanzuke: vi.fn(),
}))

import { getBanzuke } from '../../services/api/banzukeService'

describe('useBanzuke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not fetch when bashoId is missing', () => {
    renderHook(() => useBanzuke(null, 'Makuuchi'), {
      wrapper: QueryClientWrapper,
    })

    expect(getBanzuke).not.toHaveBeenCalled()
  })

  it('should not fetch when division is missing', () => {
    renderHook(() => useBanzuke('202601', null), {
      wrapper: QueryClientWrapper,
    })

    expect(getBanzuke).not.toHaveBeenCalled()
  })

  it('should fetch when both bashoId and division are provided', async () => {
    getBanzuke.mockResolvedValue(mockBanzukeData)

    renderHook(() => useBanzuke('202601', 'Makuuchi'), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(getBanzuke).toHaveBeenCalledWith('202601', 'Makuuchi')
    })
  })

  it('should return loading state initially', () => {
    getBanzuke.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBanzukeData), 100))
    )

    const { result } = renderHook(() => useBanzuke('202601', 'Makuuchi'), {
      wrapper: QueryClientWrapper,
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return data after successful fetch', async () => {
    getBanzuke.mockResolvedValue(mockBanzukeData)

    const { result } = renderHook(() => useBanzuke('202601', 'Makuuchi'), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockBanzukeData)
    })
  })

  it('should return error on fetch failure', async () => {
    const error = new Error('Network error')
    getBanzuke.mockRejectedValue(error)

    const { result } = renderHook(() => useBanzuke('202601', 'Makuuchi'), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  it('should respect enabled option', () => {
    getBanzuke.mockResolvedValue(mockBanzukeData)

    renderHook(() => useBanzuke('202601', 'Makuuchi', { enabled: false }), {
      wrapper: QueryClientWrapper,
    })

    expect(getBanzuke).not.toHaveBeenCalled()
  })

  it('should fetch when enabled option changes to true', async () => {
    getBanzuke.mockResolvedValue(mockBanzukeData)

    const { rerender } = renderHook(
      ({ enabled }) => useBanzuke('202601', 'Makuuchi', { enabled }),
      {
        wrapper: QueryClientWrapper,
        initialProps: { enabled: false },
      }
    )

    expect(getBanzuke).not.toHaveBeenCalled()

    rerender({ enabled: true })

    await waitFor(() => {
      expect(getBanzuke).toHaveBeenCalled()
    })
  })
})
