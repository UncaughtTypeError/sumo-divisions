import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBashoResults } from '../../hooks/useBashoResults'
import { QueryClientWrapper, mockBashoResults } from '../testUtils'

// Mock the basho results service
vi.mock('../../services/api/bashoResultsService', () => ({
  getBashoResults: vi.fn(),
}))

import { getBashoResults } from '../../services/api/bashoResultsService'

describe('useBashoResults', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not fetch when bashoId is missing', () => {
    renderHook(() => useBashoResults(null), {
      wrapper: QueryClientWrapper,
    })

    expect(getBashoResults).not.toHaveBeenCalled()
  })

  it('should not fetch when bashoId is empty string', () => {
    renderHook(() => useBashoResults(''), {
      wrapper: QueryClientWrapper,
    })

    expect(getBashoResults).not.toHaveBeenCalled()
  })

  it('should fetch when bashoId is provided', async () => {
    getBashoResults.mockResolvedValue(mockBashoResults)

    renderHook(() => useBashoResults('202601'), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(getBashoResults).toHaveBeenCalledWith('202601')
    })
  })

  it('should return loading state initially', () => {
    getBashoResults.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBashoResults), 100))
    )

    const { result } = renderHook(() => useBashoResults('202601'), {
      wrapper: QueryClientWrapper,
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return data after successful fetch', async () => {
    getBashoResults.mockResolvedValue(mockBashoResults)

    const { result } = renderHook(() => useBashoResults('202601'), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockBashoResults)
    })
  })

  it('should return error on fetch failure', async () => {
    const error = new Error('Network error')
    getBashoResults.mockRejectedValue(error)

    const { result } = renderHook(() => useBashoResults('202601'), {
      wrapper: QueryClientWrapper,
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  it('should respect enabled option', () => {
    getBashoResults.mockResolvedValue(mockBashoResults)

    renderHook(() => useBashoResults('202601', { enabled: false }), {
      wrapper: QueryClientWrapper,
    })

    expect(getBashoResults).not.toHaveBeenCalled()
  })

  it('should refetch when bashoId changes', async () => {
    getBashoResults.mockResolvedValue(mockBashoResults)

    const { rerender } = renderHook(({ bashoId }) => useBashoResults(bashoId), {
      wrapper: QueryClientWrapper,
      initialProps: { bashoId: '202601' },
    })

    await waitFor(() => {
      expect(getBashoResults).toHaveBeenCalledWith('202601')
    })

    rerender({ bashoId: '202511' })

    await waitFor(() => {
      expect(getBashoResults).toHaveBeenCalledWith('202511')
    })
  })

  it('should use custom staleTime when provided', async () => {
    getBashoResults.mockResolvedValue(mockBashoResults)

    const { result } = renderHook(
      () => useBashoResults('202601', { staleTime: 1000 }),
      {
        wrapper: QueryClientWrapper,
      }
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
