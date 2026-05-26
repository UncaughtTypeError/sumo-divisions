import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HeyaGrid from '../../../components/heya/HeyaGrid'

vi.mock('../../../store/divisionStore', () => ({
  default: vi.fn(),
}))

import useDivisionStore from '../../../store/divisionStore'

const mockHeyaList = [
  {
    name: 'Isegahama',
    total: 10,
    byRank: { Yokozuna: [{ id: 1 }], Maegashira: [{ id: 2 }, { id: 3 }] },
    rikishi: [{ id: 10 }, { id: 11 }],
  },
  {
    name: 'Tatsunami',
    total: 5,
    byRank: { Ozeki: [{ id: 4 }] },
    rikishi: [{ id: 20 }],
  },
]

describe('HeyaGrid', () => {
  const mockSelectHeya = vi.fn()
  const mockOnSort = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useDivisionStore.mockReturnValue({ selectHeya: mockSelectHeya })
  })

  it('renders a row for each heya', () => {
    render(
      <HeyaGrid
        heyaList={mockHeyaList}
        sortKey="name"
        sortDir="asc"
        onSort={mockOnSort}
      />
    )
    expect(screen.getAllByText('Isegahama').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Tatsunami')).toBeInTheDocument()
  })

  it('renders a sortable column header for each rank and total', () => {
    const { container } = render(
      <HeyaGrid
        heyaList={mockHeyaList}
        sortKey="name"
        sortDir="asc"
        onSort={mockOnSort}
      />
    )
    // Header abbreviations live inside <th> elements
    const headers = container.querySelectorAll('thead th')
    const headerText = Array.from(headers).map((th) => th.textContent)
    expect(headerText.some((t) => t.includes('Y'))).toBe(true)
    expect(headerText.some((t) => t.includes('O'))).toBe(true)
    expect(headerText.some((t) => t.includes('Total'))).toBe(true)
  })

  it('calls onSort when column header is clicked', () => {
    render(
      <HeyaGrid
        heyaList={mockHeyaList}
        sortKey="name"
        sortDir="asc"
        onSort={mockOnSort}
      />
    )
    fireEvent.click(screen.getByText('Total'))
    expect(mockOnSort).toHaveBeenCalledWith('total')
  })

  it('shows up arrow on active sort column when asc', () => {
    render(
      <HeyaGrid
        heyaList={mockHeyaList}
        sortKey="name"
        sortDir="asc"
        onSort={mockOnSort}
      />
    )
    expect(screen.getByText(/Heya ↑/)).toBeInTheDocument()
  })

  it('shows down arrow on active sort column when desc', () => {
    render(
      <HeyaGrid
        heyaList={mockHeyaList}
        sortKey="name"
        sortDir="desc"
        onSort={mockOnSort}
      />
    )
    expect(screen.getByText(/Heya ↓/)).toBeInTheDocument()
  })

  it('calls selectHeya when a row is clicked', () => {
    render(
      <HeyaGrid
        heyaList={mockHeyaList}
        sortKey="name"
        sortDir="asc"
        onSort={mockOnSort}
      />
    )
    fireEvent.click(screen.getByRole('row', { name: /Isegahama/ }))
    expect(mockSelectHeya).toHaveBeenCalledWith('Isegahama', [10, 11])
  })

  it('calls selectHeya on Enter key press on a row', () => {
    render(
      <HeyaGrid
        heyaList={mockHeyaList}
        sortKey="name"
        sortDir="asc"
        onSort={mockOnSort}
      />
    )
    const row = screen.getByRole('row', { name: /Isegahama/ })
    fireEvent.keyDown(row, { key: 'Enter' })
    expect(mockSelectHeya).toHaveBeenCalledWith('Isegahama', [10, 11])
  })

  it('passes the heya rikishi IDs to selectHeya (regression: grid row must match card behaviour)', () => {
    render(
      <HeyaGrid
        heyaList={mockHeyaList}
        sortKey="name"
        sortDir="asc"
        onSort={mockOnSort}
      />
    )
    fireEvent.click(screen.getByRole('row', { name: /Isegahama/ }))
    // Clicking a grid row must pass IDs just like HeyaCard — empty IDs would
    // leave selectedHeyaRikishiIds as [] and show no wrestlers in the sidebar.
    const [, ids] = mockSelectHeya.mock.calls[0]
    expect(ids).toEqual([10, 11])
  })

  it('renders dash for zero rank counts', () => {
    render(
      <HeyaGrid
        heyaList={mockHeyaList}
        sortKey="name"
        sortDir="asc"
        onSort={mockOnSort}
      />
    )
    // Tatsunami has no Yokozuna
    const dashes = screen.getAllByText('–')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('renders empty message when list is empty', () => {
    render(
      <HeyaGrid heyaList={[]} sortKey="name" sortDir="asc" onSort={mockOnSort} />
    )
    expect(screen.getByText(/No heya match your search/)).toBeInTheDocument()
  })
})
