import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import WrestlerSidebar from '../../../components/sidebar/WrestlerSidebar'
import { renderWithQueryClient, mockBanzukeData, mockBashoResults } from '../../testUtils'

// ── Store + hook mocks ────────────────────────────────────────────────────────

vi.mock('../../../store/divisionStore', () => ({ default: vi.fn() }))
vi.mock('../../../hooks/useBanzuke', () => ({ default: vi.fn() }))
vi.mock('../../../hooks/useBashoResults', () => ({ default: vi.fn() }))
vi.mock('../../../hooks/useTorikumi', () => ({
  default: vi.fn(() => ({ data: null, isLoading: false, isFetching: false, error: null, refetch: vi.fn() })),
}))
vi.mock('../../../hooks/useRikishi', () => ({
  useRikishiList: vi.fn(() => ({ rikishiMap: new Map(), rankHistoryMap: new Map(), isLoading: false })),
}))

// ── Child component mocks ─────────────────────────────────────────────────────

vi.mock('../../../components/sidebar/BanzukeTab', () => ({
  default: ({ isLoading, error, data }) => (
    <div data-testid="banzuke-tab">
      {isLoading && <div data-testid="loading">Loading rikishi...</div>}
      {error   && <div data-testid="error-message">{error.message}</div>}
      {data && !isLoading && !error && <div>BanzukeTabContent</div>}
    </div>
  ),
}))

vi.mock('../../../components/sidebar/TorikumiTab', () => ({
  default: () => <div data-testid="torikumi-tab">TorikumiTabContent</div>,
}))

vi.mock('../../../components/sidebar/BashoSelector', () => ({
  default: ({ selectedBashoId, onBashoChange }) => (
    <select
      data-testid="basho-selector"
      value={selectedBashoId}
      onChange={(e) => onBashoChange(e.target.value)}
    >
      <option value="202601">Jan 2026</option>
      <option value="202511">Nov 2025</option>
    </select>
  ),
}))

vi.mock('../../../components/modal/MatchHistoryModal', () => ({
  default: () => <div data-testid="match-history-modal">MatchHistoryModal</div>,
}))

// ── Imports used across tests ─────────────────────────────────────────────────

import useDivisionStore from '../../../store/divisionStore'
import useBanzuke from '../../../hooks/useBanzuke'
import useBashoResults from '../../../hooks/useBashoResults'

// ─────────────────────────────────────────────────────────────────────────────

describe('WrestlerSidebar', () => {
  const mockCloseSidebar         = vi.fn()
  const mockOpenModal            = vi.fn()
  const mockSetRankLookup        = vi.fn()
  const mockSetAllWrestlers      = vi.fn()
  const mockSetAdjacentWrestlers = vi.fn()
  const mockRefetch              = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Closed sidebar ────────────────────────────────────────────────────────

  describe('when sidebar is closed', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isSidebarOpen: false, isDivisionView: false, selectedRank: null,
        selectedDivision: null, selectedApiDivision: null, selectedColor: null,
        closeSidebar: mockCloseSidebar, openModal: mockOpenModal,
        setRankLookup: mockSetRankLookup, setAllWrestlers: mockSetAllWrestlers,
        setAdjacentWrestlers: mockSetAdjacentWrestlers,
      })
      useBanzuke.mockReturnValue({ data: null, isLoading: false, error: null, refetch: mockRefetch })
      useBashoResults.mockReturnValue({ data: null })
    })

    it('returns null', () => {
      const { container } = renderWithQueryClient(<WrestlerSidebar />)
      expect(container.firstChild).toBeNull()
    })
  })

  // ── Open sidebar — single rank view ───────────────────────────────────────

  describe('when sidebar is open (single rank / Yokozuna)', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isSidebarOpen: true, isDivisionView: false, selectedRank: 'Yokozuna',
        selectedDivision: 'Makuuchi', selectedApiDivision: 'Makuuchi', selectedColor: 'yokozuna',
        closeSidebar: mockCloseSidebar, openModal: mockOpenModal,
        setRankLookup: mockSetRankLookup, setAllWrestlers: mockSetAllWrestlers,
        setAdjacentWrestlers: mockSetAdjacentWrestlers,
      })
      useBanzuke.mockReturnValue({ data: mockBanzukeData, isLoading: false, error: null, refetch: mockRefetch })
      useBashoResults.mockReturnValue({ data: mockBashoResults })
    })

    it('renders the division selector showing the matched view', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByLabelText('Select division or rank')).toHaveValue('yokozuna')
    })

    it('renders the close button', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument()
    })

    it('renders BashoSelector', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('basho-selector')).toBeInTheDocument()
    })

    it('renders MatchHistoryModal', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('match-history-modal')).toBeInTheDocument()
    })

    it('renders the Banzuke tab by default', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('banzuke-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('torikumi-tab')).not.toBeInTheDocument()
    })

    it('calls closeSidebar when close button is clicked', async () => {
      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByLabelText('Close sidebar'))
      await waitFor(() => expect(mockCloseSidebar).toHaveBeenCalled(), { timeout: 500 })
    })

    it('calls closeSidebar when overlay is clicked', async () => {
      const { container } = renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(container.querySelector('div'))
      await waitFor(() => expect(mockCloseSidebar).toHaveBeenCalled(), { timeout: 500 })
    })

    it('renders both tab buttons', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByRole('button', { name: 'Banzuke' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Torikumi' })).toBeInTheDocument()
    })

    it('switches to Torikumi tab when that button is clicked', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByRole('button', { name: 'Torikumi' }))
      expect(screen.getByTestId('torikumi-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('banzuke-tab')).not.toBeInTheDocument()
    })

    it('switches back to Banzuke tab from Torikumi', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByRole('button', { name: 'Torikumi' }))
      fireEvent.click(screen.getByRole('button', { name: 'Banzuke' }))
      expect(screen.getByTestId('banzuke-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('torikumi-tab')).not.toBeInTheDocument()
    })

    it('passes loading state to BanzukeTab', () => {
      useBanzuke.mockReturnValue({ data: null, isLoading: true, error: null, refetch: mockRefetch })
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('passes error state to BanzukeTab', () => {
      useBanzuke.mockReturnValue({ data: null, isLoading: false, error: { message: 'Failed to fetch' }, refetch: mockRefetch })
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    it('calls setAdjacentWrestlers when adjacent banzuke data loads', async () => {
      renderWithQueryClient(<WrestlerSidebar />)
      await waitFor(() => expect(mockSetAdjacentWrestlers).toHaveBeenCalled())
    })
  })

  // ── Open sidebar — Makuuchi division view ─────────────────────────────────

  describe('when sidebar is open in Makuuchi division view', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isSidebarOpen: true, isDivisionView: true, selectedRank: null,
        selectedDivision: 'Makuuchi', selectedApiDivision: 'Makuuchi', selectedColor: 'makuuchi',
        closeSidebar: mockCloseSidebar, openModal: mockOpenModal,
        setRankLookup: mockSetRankLookup, setAllWrestlers: mockSetAllWrestlers,
        setAdjacentWrestlers: mockSetAdjacentWrestlers,
      })
      useBanzuke.mockReturnValue({ data: mockBanzukeData, isLoading: false, error: null, refetch: mockRefetch })
      useBashoResults.mockReturnValue({ data: mockBashoResults })
    })

    it('selects the Makuuchi division view in the selector', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByLabelText('Select division or rank')).toHaveValue('makuuchi')
    })

    it('renders the Makuuchi kanji as an option', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByRole('option', { name: /幕内/ })).toBeInTheDocument()
    })

    it('has no h2 heading — header uses a select dropdown', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
      expect(screen.getByLabelText('Select division or rank')).toHaveValue('makuuchi')
    })

    it('renders BanzukeTab', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('banzuke-tab')).toBeInTheDocument()
    })
  })
})
