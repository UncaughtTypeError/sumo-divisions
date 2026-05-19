import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useLocalStorage from '../../hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns the default value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'rankings'))

    expect(result.current[0]).toBe('rankings')
  })

  it('returns the stored value when the key already exists', () => {
    localStorage.setItem('test-key', JSON.stringify('heya'))

    const { result } = renderHook(() => useLocalStorage('test-key', 'rankings'))

    expect(result.current[0]).toBe('heya')
  })

  it('updates state and persists to localStorage when setter is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'rankings'))

    act(() => {
      result.current[1]('heya')
    })

    expect(result.current[0]).toBe('heya')
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe('heya')
  })

  it('supports updater function (functional update)', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'card'))

    act(() => {
      result.current[1]((prev) => (prev === 'card' ? 'grid' : 'card'))
    })

    expect(result.current[0]).toBe('grid')
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe('grid')
  })

  it('works with non-string values (objects)', () => {
    const defaultValue = { count: 0 }
    const { result } = renderHook(() => useLocalStorage('test-key', defaultValue))

    act(() => {
      result.current[1]({ count: 5 })
    })

    expect(result.current[0]).toEqual({ count: 5 })
    expect(JSON.parse(localStorage.getItem('test-key'))).toEqual({ count: 5 })
  })

  it('falls back to default when stored value is invalid JSON', () => {
    localStorage.setItem('test-key', 'not-valid-json{{{')

    const { result } = renderHook(() => useLocalStorage('test-key', 'rankings'))

    expect(result.current[0]).toBe('rankings')
  })

  it('falls back to default when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'rankings'))

    expect(result.current[0]).toBe('rankings')
  })

  it('still updates state when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage full')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'rankings'))

    act(() => {
      result.current[1]('heya')
    })

    expect(result.current[0]).toBe('heya')
  })

  it('different keys are independent', () => {
    const { result: viewResult } = renderHook(() =>
      useLocalStorage('sumo-active-view', 'rankings')
    )
    const { result: layoutResult } = renderHook(() =>
      useLocalStorage('sumo-heya-layout', 'card')
    )

    act(() => {
      viewResult.current[1]('heya')
    })

    expect(viewResult.current[0]).toBe('heya')
    expect(layoutResult.current[0]).toBe('card')
  })
})
