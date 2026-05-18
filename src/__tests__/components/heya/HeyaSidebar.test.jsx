import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import HeyaSidebar from '../../../components/heya/HeyaSidebar'
import { renderWithQueryClient } from '../../testUtils'

vi.mock('../../../store/divisionStore', () => ({
  default: vi.fn(),
}))

vi.mock('../../../hooks/useAllDivisionsBanzuke', () => ({
  useAllDivisionsBanzuke: vi.fn(),
}))

vi.mock('../../../hooks/useRikishi', () => ({
  useAllRikishi: vi.fn(),
}))

vi.mock('../../../hooks/useBashoResults', () => ({
  default: vi.fn(),
}))

vi.mock('../../../components/sidebar/WrestlerGrid', () => ({
  default: ({ wrestlers, side }) => (
    <div data-testid={`wrestler-grid-${side.toLowerCase()}`}>
      {wrestlers.map((w) => (
        <div key={w.rikishiID}>{w.shikonaEn}</div>
      ))}
    </div>
  ),
}))

vi.mock('../../../components/sidebar/BashoSelector', () => ({
  default: ({ selectedBashoId, onBashoChange }) => (
    <select
      data-testid="basho-selector"
      value={selectedBashoId}
      onChange={(e) => onBashoChange(e.target.value)}
    >
      <option value="202605">May 2026</option>
      <option value="202603">Mar 2026</option>
    </select>
  ),
}))

vi.mock('../../../components/modal/MatchHistoryModal', () => ({
  default: () => <div data-testid="match-history-modal" />,
}))

vi.mock('../../../components/common/Loading', () => ({
  default: ({ message }) => <div data-testid="loading">{message}</div>,
}))

vi.mock('../../../components/common/ErrorMessage', () => ({
  default: ({ error }) => <div data-testid="error-message">{error?.message}</div>,
}))

import useDivisionStore from '../../../store/divisionStore'
import { useAllDivisionsBanzuke } from '../../../hooks/useAllDivisionsBanzuke'
import { useAllRikishi } from '../../../hooks/useRikishi'
import useBashoResults from '../../../hooks/useBashoResults'

const mockCloseHeyaSidebar = vi.fn()
const mockOpenModal = vi.fn()
const mockSetRankLookup = vi.fn()
const mockSetAllWrestlers = vi.fn()

const makuuchiWrestler = {
  rikishiID: 1,
  shikonaEn: 'Terunofuji',
  rank: 'Yokozuna 1 East',
  rankValue: 1,
  wins: 12,
  losses: 3,
  absences: 0,
  record: [],
  awards: [],
}

const juryoWrestler = {
  rikishiID: 2,
  shikonaEn: 'Mitoryu',
  rank: 'Juryo 1 East',
  rankValue: 100,
  wins: 8,
  losses: 7,
  absences: 0,
  record: [],
  awards: [],
}

const rikishiMap = new Map([
  [1, { id: 1, heya: 'Isegahama', shikonaEn: 'Terunofuji' }],
  [2, { id: 2, heya: 'Tatsunami', shikonaEn: 'Mitoryu' }],
])

function setupStore(overrides = {}) {
  useDivisionStore.mockReturnValue({
    selectedHeya: 'Isegahama',
    isHeyaSidebarOpen: true,
    closeHeyaSidebar: mockCloseHeyaSidebar,
    openModal: mockOpenModal,
    setRankLookup: mockSetRankLookup,
    setAllWrestlers: mockSetAllWrestlers,
    rankLookup: new Map(),
    ...overrides,
  })
}

describe('HeyaSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useBashoResults.mockReturnValue({ data: null })
    useAllRikishi.mockReturnValue({ rikishiMap: new Map(), isLoading: false })
    useAllDivisionsBanzuke.mockReturnValue({
      allWrestlers: [],
      isLoading: false,
      isError: false,
    })
  })

  describe('when closed', () => {
    it('returns null when isHeyaSidebarOpen is false', () => {
      setupStore({ isHeyaSidebarOpen: false })
      const { container } = renderWithQueryClient(<HeyaSidebar />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when open', () => {
    beforeEach(() => {
      setupStore()
    })

    it('renders heya name in header', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Isegahama')
    })

    it('renders close button', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByLabelText('Close heya sidebar')).toBeInTheDocument()
    })

    it('renders BashoSelector', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByTestId('basho-selector')).toBeInTheDocument()
    })

    it('renders MatchHistoryModal', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByTestId('match-history-modal')).toBeInTheDocument()
    })

    it('renders loading state', () => {
      useAllDivisionsBanzuke.mockReturnValue({
        allWrestlers: [],
        isLoading: true,
        isError: false,
      })
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.getByText('Loading heya rikishi...')).toBeInTheDocument()
    })

    it('renders error state', () => {
      useAllDivisionsBanzuke.mockReturnValue({
        allWrestlers: [],
        isLoading: false,
        isError: true,
      })
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    it('calls closeHeyaSidebar after close button click', async () => {
      renderWithQueryClient(<HeyaSidebar />)
      fireEvent.click(screen.getByLabelText('Close heya sidebar'))
      await waitFor(() => {
        expect(mockCloseHeyaSidebar).toHaveBeenCalled()
      }, { timeout: 500 })
    })

    it('calls closeHeyaSidebar when overlay is clicked', async () => {
      const { container } = renderWithQueryClient(<HeyaSidebar />)
      const overlay = container.querySelector('div')
      fireEvent.click(overlay)
      await waitFor(() => {
        expect(mockCloseHeyaSidebar).toHaveBeenCalled()
      }, { timeout: 500 })
    })
  })

  describe('with heya wrestlers', () => {
    beforeEach(() => {
      setupStore()
      useAllDivisionsBanzuke.mockReturnValue({
        allWrestlers: [makuuchiWrestler, juryoWrestler],
        isLoading: false,
        isError: false,
      })
      useAllRikishi.mockReturnValue({
        rikishiMap,
        isLoading: false,
      })
    })

    it('shows only wrestlers from the selected heya', () => {
      renderWithQueryClient(<HeyaSidebar />)
      // Terunofuji belongs to Isegahama → should appear
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      // Mitoryu belongs to Tatsunami → should not appear
      expect(screen.queryByText('Mitoryu')).not.toBeInTheDocument()
    })

    it('renders rank section heading', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByRole('heading', { level: 3, name: 'Yokozuna' })).toBeInTheDocument()
    })

    it('renders search input', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByPlaceholderText('Search rikishi...')).toBeInTheDocument()
    })

    it('renders sort dropdown', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByLabelText('Sort order')).toBeInTheDocument()
    })

    it('renders no-data message when heya has no wrestlers in this basho', () => {
      // Override so all wrestlers belong to a different heya
      useAllRikishi.mockReturnValue({
        rikishiMap: new Map([[1, { id: 1, heya: 'OtherHeya' }]]),
        isLoading: false,
      })
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByText(/No rikishi found in Isegahama/)).toBeInTheDocument()
    })
  })
})
