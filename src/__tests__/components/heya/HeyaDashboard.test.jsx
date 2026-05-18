import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import HeyaDashboard from '../../../components/heya/HeyaDashboard'
import { renderWithQueryClient } from '../../testUtils'

vi.mock('../../../hooks/useHeyaData', () => ({
  useHeyaData: vi.fn(),
}))

vi.mock('../../../components/heya/HeyaCardGrid', () => ({
  default: ({ heyaList }) => (
    <div data-testid="heya-card-grid">
      {heyaList.map((h) => (
        <div key={h.name} data-testid={`card-${h.name}`}>{h.name}</div>
      ))}
    </div>
  ),
}))

vi.mock('../../../components/heya/HeyaGrid', () => ({
  default: ({ heyaList, onSort, sortKey, sortDir }) => (
    <div data-testid="heya-grid">
      {heyaList.map((h) => (
        <div key={h.name} data-testid={`row-${h.name}`}>{h.name}</div>
      ))}
    </div>
  ),
}))

vi.mock('../../../components/heya/HeyaSidebar', () => ({
  default: () => <div data-testid="heya-sidebar" />,
}))

vi.mock('../../../components/common/Loading', () => ({
  default: ({ message }) => <div data-testid="loading">{message}</div>,
}))

vi.mock('../../../components/common/ErrorMessage', () => ({
  default: ({ error }) => <div data-testid="error-message">{error?.message}</div>,
}))

import { useHeyaData } from '../../../hooks/useHeyaData'

const mockHeyaList = [
  {
    name: 'Isegahama',
    total: 12,
    byRank: { Yokozuna: [{ id: 1, shikonaEn: 'Terunofuji' }] },
    rikishi: [{ id: 1, shikonaEn: 'Terunofuji' }],
  },
  {
    name: 'Tatsunami',
    total: 5,
    byRank: { Ozeki: [{ id: 2, shikonaEn: 'Hoshoryu' }] },
    rikishi: [{ id: 2, shikonaEn: 'Hoshoryu' }],
  },
  {
    name: 'Miyagino',
    total: 8,
    byRank: { Maegashira: [{ id: 3, shikonaEn: 'Hakuho' }] },
    rikishi: [{ id: 3, shikonaEn: 'Hakuho' }],
  },
]

describe('HeyaDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state', () => {
    useHeyaData.mockReturnValue({ heyaList: [], isLoading: true, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByText('Loading heya...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    useHeyaData.mockReturnValue({
      heyaList: [],
      isLoading: false,
      error: new Error('Fetch failed'),
    })
    renderWithQueryClient(<HeyaDashboard />)
    expect(screen.getByTestId('error-message')).toBeInTheDocument()
  })

  it('renders card layout by default', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    expect(screen.getByTestId('heya-card-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('heya-grid')).not.toBeInTheDocument()
  })

  it('switches to grid layout on button click', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    fireEvent.click(screen.getByLabelText('Grid layout'))
    expect(screen.getByTestId('heya-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('heya-card-grid')).not.toBeInTheDocument()
  })

  it('switches back to card layout', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    fireEvent.click(screen.getByLabelText('Grid layout'))
    fireEvent.click(screen.getByLabelText('Card layout'))
    expect(screen.getByTestId('heya-card-grid')).toBeInTheDocument()
  })

  it('filters by heya name search', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    fireEvent.change(screen.getByLabelText('Search by heya name'), {
      target: { value: 'Ise' },
    })
    expect(screen.getByTestId('card-Isegahama')).toBeInTheDocument()
    expect(screen.queryByTestId('card-Tatsunami')).not.toBeInTheDocument()
  })

  it('filters by rikishi name search', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    fireEvent.change(screen.getByLabelText('Search by rikishi name'), {
      target: { value: 'Hoshoryu' },
    })
    expect(screen.getByTestId('card-Tatsunami')).toBeInTheDocument()
    expect(screen.queryByTestId('card-Isegahama')).not.toBeInTheDocument()
  })

  it('shows clear button for heya search when text entered', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    fireEvent.change(screen.getByLabelText('Search by heya name'), {
      target: { value: 'Ise' },
    })
    expect(screen.getByLabelText('Clear heya search')).toBeInTheDocument()
  })

  it('clears heya search on clear button click', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    const input = screen.getByLabelText('Search by heya name')
    fireEvent.change(input, { target: { value: 'Ise' } })
    fireEvent.click(screen.getByLabelText('Clear heya search'))
    expect(input.value).toBe('')
  })

  it('renders HeyaSidebar', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    expect(screen.getByTestId('heya-sidebar')).toBeInTheDocument()
  })

  it('renders sort dropdown in card layout', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    expect(screen.getByLabelText('Sort order')).toBeInTheDocument()
  })

  it('does not render sort dropdown in grid layout', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    fireEvent.click(screen.getByLabelText('Grid layout'))
    expect(screen.queryByLabelText('Sort order')).not.toBeInTheDocument()
  })

  it('shows all heya when search is empty', () => {
    useHeyaData.mockReturnValue({ heyaList: mockHeyaList, isLoading: false, error: null })
    renderWithQueryClient(<HeyaDashboard />)
    expect(screen.getByTestId('card-Isegahama')).toBeInTheDocument()
    expect(screen.getByTestId('card-Tatsunami')).toBeInTheDocument()
    expect(screen.getByTestId('card-Miyagino')).toBeInTheDocument()
  })
})
