import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HeyaCard from '../../../components/heya/HeyaCard'

vi.mock('../../../store/divisionStore', () => ({
  default: vi.fn(),
}))

import useDivisionStore from '../../../store/divisionStore'

const mockHeya = {
  name: 'Isegahama',
  total: 15,
  byRank: {
    Yokozuna: [{ id: 1 }],
    Ozeki: [{ id: 2 }, { id: 3 }],
    Maegashira: [{ id: 4 }],
    Juryo: [{ id: 5 }],
    Makushita: [{ id: 6 }, { id: 7 }, { id: 8 }],
  },
  rikishi: [{ id: 10 }, { id: 11 }, { id: 12 }],
}

describe('HeyaCard', () => {
  const mockSelectHeya = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useDivisionStore.mockReturnValue({ selectHeya: mockSelectHeya })
  })

  it('renders heya name', () => {
    render(<HeyaCard heya={mockHeya} />)
    expect(screen.getByText('Isegahama')).toBeInTheDocument()
  })

  it('renders total rikishi count', () => {
    render(<HeyaCard heya={mockHeya} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('renders sekitori rank badges', () => {
    render(<HeyaCard heya={mockHeya} />)
    // Abbreviations for sekitori ranks
    expect(screen.getByText('Y')).toBeInTheDocument()
    expect(screen.getByText('O')).toBeInTheDocument()
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders apprentice rank badges', () => {
    render(<HeyaCard heya={mockHeya} />)
    expect(screen.getByText('Ms')).toBeInTheDocument()
  })

  it('calls selectHeya with heya name on click', () => {
    render(<HeyaCard heya={mockHeya} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockSelectHeya).toHaveBeenCalledWith('Isegahama', [10, 11, 12])
  })

  it('calls selectHeya on Enter key press', () => {
    render(<HeyaCard heya={mockHeya} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(mockSelectHeya).toHaveBeenCalledWith('Isegahama', [10, 11, 12])
  })

  it('passes the heya rikishi IDs to selectHeya (regression: empty IDs would show no wrestlers in sidebar)', () => {
    render(<HeyaCard heya={mockHeya} />)
    fireEvent.click(screen.getByRole('button'))
    const [, ids] = mockSelectHeya.mock.calls[0]
    expect(ids).toEqual([10, 11, 12])
  })

  it('does not call selectHeya on non-Enter key press', () => {
    render(<HeyaCard heya={mockHeya} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Space' })
    expect(mockSelectHeya).not.toHaveBeenCalled()
  })

  it('renders badge count for ranks present', () => {
    render(<HeyaCard heya={mockHeya} />)
    // Yokozuna count: 1 — badge shows abbr "Y" and count "1"
    const yokozunaBadges = screen.getAllByText('1')
    expect(yokozunaBadges.length).toBeGreaterThan(0)
    // Ozeki count: 2
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders zero badges for ranks not present', () => {
    render(<HeyaCard heya={mockHeya} />)
    // All 10 rank badges are rendered; those with count 0 still appear
    const zeroBadges = screen.getAllByText('0')
    expect(zeroBadges.length).toBeGreaterThan(0)
  })
})
