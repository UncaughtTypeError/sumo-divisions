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
  default: ({ day, torikumiMaxDay, onDayChange }) => (
    <div data-testid="torikumi-tab" data-day={String(day)} data-max-day={String(torikumiMaxDay)}>
      <button data-testid="manual-day-select" onClick={() => onDayChange && onDayChange(2)}>Day 2</button>
      TorikumiTabContent
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
import useTorikumi from '../../../hooks/useTorikumi'

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

  // ── Adjacent division bidirectional loading ───────────────────────────────

  describe('bidirectional adjacent division loading (Juryo)', () => {
    it('includes wrestlers from both adjacent divisions for a middle division', async () => {
      const upperWrestler = { rikishiID: 10, shikonaEn: 'UpperGuy', rank: 'Maegashira 1 East' }
      const lowerWrestler = { rikishiID: 20, shikonaEn: 'LowerGuy', rank: 'Makushita 1 East' }

      useDivisionStore.mockReturnValue({
        isSidebarOpen: true, isDivisionView: false, selectedRank: 'Juryo',
        selectedDivision: 'Juryo', selectedApiDivision: 'Juryo', selectedColor: 'juryo',
        closeSidebar: mockCloseSidebar, openModal: mockOpenModal,
        setRankLookup: mockSetRankLookup, setAllWrestlers: mockSetAllWrestlers,
        setAdjacentWrestlers: mockSetAdjacentWrestlers,
      })
      useBanzuke.mockImplementation((_bashoId, division) => {
        if (division === 'Makuuchi')  return { data: { east: [upperWrestler], west: [] }, isLoading: false, error: null, refetch: mockRefetch }
        if (division === 'Makushita') return { data: { east: [lowerWrestler], west: [] }, isLoading: false, error: null, refetch: mockRefetch }
        return { data: mockBanzukeData, isLoading: false, error: null, refetch: mockRefetch }
      })
      useBashoResults.mockReturnValue({ data: null })

      renderWithQueryClient(<WrestlerSidebar />)

      await waitFor(() => {
        const calls = mockSetAdjacentWrestlers.mock.calls
        const lastCall = calls[calls.length - 1][0]
        expect(lastCall.some((w) => w.rikishiID === 10)).toBe(true) // upper (Makuuchi)
        expect(lastCall.some((w) => w.rikishiID === 20)).toBe(true) // lower (Makushita)
      })
    })
  })

  // ── Torikumi default day selection ───────────────────────────────────────

  describe('Torikumi default day selection', () => {
    const makeRecord = (n) => Array.from({ length: n }, (_, i) => ({
      result: 'win', opponentShikonaEn: `Opp${i}`, kimarite: 'yorikiri',
    }))
    const fakeBouts = {
      bouts: [{ matchNo: 1, eastId: 1, westId: 2, eastShikona: 'A', westShikona: 'B',
                eastRank: 'Y1e', westRank: 'O1w', winnerId: null, kimarite: null }],
      isEmpty: false,
    }
    const emptyBouts = { data: null, isLoading: false, isFetching: false, error: null, refetch: vi.fn() }
    const boutResult = { data: fakeBouts, isLoading: false, isFetching: false, error: null, refetch: vi.fn() }

    const storeBase = {
      isSidebarOpen: true, isDivisionView: false, selectedRank: 'Yokozuna',
      selectedDivision: 'Makuuchi', selectedApiDivision: 'Makuuchi', selectedColor: 'yokozuna',
      closeSidebar: vi.fn(), openModal: vi.fn(),
      setRankLookup: vi.fn(), setAllWrestlers: vi.fn(), setAdjacentWrestlers: vi.fn(),
    }

    beforeEach(() => {
      useBashoResults.mockReturnValue({ data: null })
    })

    it('defaults to day 1 when no results exist yet (pre-tournament)', async () => {
      const preTournamentBanzuke = {
        ...mockBanzukeData,
        east: [{ rikishiID: 1, record: [], rank: 'Yokozuna 1 East', rankValue: 1, wins: 0, losses: 0, absences: 0, awards: [] }],
        west: [{ rikishiID: 2, record: [], rank: 'Ozeki 1 West',    rankValue: 2, wins: 0, losses: 0, absences: 0, awards: [] }],
      }
      useDivisionStore.mockReturnValue(storeBase)
      useBanzuke.mockReturnValue({ data: preTournamentBanzuke, isLoading: false, error: null, refetch: vi.fn() })
      useTorikumi.mockImplementation((_b, _d, day) => day === 1 ? boutResult : emptyBouts)

      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByRole('button', { name: 'Torikumi' }))
      await waitFor(() => expect(screen.getByTestId('torikumi-tab')).toHaveAttribute('data-day', '1'))
    })

    it('defaults to the in-progress day when results are partial', async () => {
      // mockBanzukeData: wrestler 1 has 3 results, others have empty records → maxDay=3, partial
      useDivisionStore.mockReturnValue(storeBase)
      useBanzuke.mockReturnValue({ data: mockBanzukeData, isLoading: false, error: null, refetch: vi.fn() })
      useTorikumi.mockImplementation((_b, _d, day) => day === 4 ? boutResult : emptyBouts)

      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByRole('button', { name: 'Torikumi' }))
      await waitFor(() => expect(screen.getByTestId('torikumi-tab')).toHaveAttribute('data-day', '3'))
    })

    it('advances to the next day when current day is fully complete', async () => {
      const allDay3Complete = {
        ...mockBanzukeData,
        east: [{ rikishiID: 1, record: makeRecord(3), rank: 'Yokozuna 1 East', rankValue: 1, wins: 3, losses: 0, absences: 0, awards: [] }],
        west: [{ rikishiID: 2, record: makeRecord(3), rank: 'Ozeki 1 West',    rankValue: 2, wins: 3, losses: 0, absences: 0, awards: [] }],
      }
      useDivisionStore.mockReturnValue(storeBase)
      useBanzuke.mockReturnValue({ data: allDay3Complete, isLoading: false, error: null, refetch: vi.fn() })
      useTorikumi.mockImplementation((_b, _d, day) => day === 4 ? boutResult : emptyBouts)

      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByRole('button', { name: 'Torikumi' }))
      await waitFor(() => expect(screen.getByTestId('torikumi-tab')).toHaveAttribute('data-day', '4'))
    })

    it('restores the previous day when switching back to a division', async () => {
      // Makuuchi (yokozuna view): partial day 3 → auto-selects day 3
      // Juryo: no results, no probe data → day 0
      // Switch back to yokozuna: saved day 3 is restored
      useDivisionStore.mockReturnValue(storeBase)
      useBanzuke.mockImplementation((_bashoId, division) => {
        if (division === 'Makuuchi') return { data: mockBanzukeData, isLoading: false, error: null, refetch: vi.fn() }
        return { data: { ...mockBanzukeData, division, east: [], west: [] }, isLoading: false, error: null, refetch: vi.fn() }
      })
      useTorikumi.mockImplementation((_b, division, day) =>
        division === 'Makuuchi' && day === 4 ? boutResult : emptyBouts,
      )

      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByRole('button', { name: 'Torikumi' }))
      await waitFor(() => expect(screen.getByTestId('torikumi-tab')).toHaveAttribute('data-day', '3'))

      // Switch to Juryo
      fireEvent.change(screen.getByLabelText('Select division or rank'), { target: { value: 'juryo' } })
      // Switch back to yokozuna (same apiDivision: Makuuchi)
      fireEvent.change(screen.getByLabelText('Select division or rank'), { target: { value: 'yokozuna' } })

      await waitFor(() => expect(screen.getByTestId('torikumi-tab')).toHaveAttribute('data-day', '3'))
    })

    it('stays on last completed day when no look-ahead bouts exist', async () => {
      const allDay3Complete = {
        ...mockBanzukeData,
        east: [{ rikishiID: 1, record: makeRecord(3), rank: 'Yokozuna 1 East', rankValue: 1, wins: 3, losses: 0, absences: 0, awards: [] }],
        west: [{ rikishiID: 2, record: makeRecord(3), rank: 'Ozeki 1 West',    rankValue: 2, wins: 3, losses: 0, absences: 0, awards: [] }],
      }
      useDivisionStore.mockReturnValue(storeBase)
      useBanzuke.mockReturnValue({ data: allDay3Complete, isLoading: false, error: null, refetch: vi.fn() })
      // Probe day 4 returns nothing — no look-ahead scheduled yet
      useTorikumi.mockReturnValue(emptyBouts)

      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByRole('button', { name: 'Torikumi' }))
      await waitFor(() => expect(screen.getByTestId('torikumi-tab')).toHaveAttribute('data-day', '3'))
    })

    it('does not auto-select when no bouts exist pre-tournament', async () => {
      const preTournamentBanzuke = {
        ...mockBanzukeData,
        east: [{ rikishiID: 1, record: [], rank: 'Yokozuna 1 East', rankValue: 1, wins: 0, losses: 0, absences: 0, awards: [] }],
        west: [{ rikishiID: 2, record: [], rank: 'Ozeki 1 West',    rankValue: 2, wins: 0, losses: 0, absences: 0, awards: [] }],
      }
      useDivisionStore.mockReturnValue(storeBase)
      useBanzuke.mockReturnValue({ data: preTournamentBanzuke, isLoading: false, error: null, refetch: vi.fn() })
      // Day 1 probe also returns nothing — torikumi not yet published
      useTorikumi.mockReturnValue(emptyBouts)

      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByRole('button', { name: 'Torikumi' }))
      // torikumiDefaultDay stays 0 → no auto-select fires → day remains 0
      await waitFor(() => expect(screen.getByTestId('torikumi-tab')).toBeInTheDocument())
      expect(screen.getByTestId('torikumi-tab')).toHaveAttribute('data-day', '0')
    })

    it('does not override manually selected day when auto-default would change it', async () => {
      const allDay3Complete = {
        ...mockBanzukeData,
        east: [{ rikishiID: 1, record: makeRecord(3), rank: 'Yokozuna 1 East', rankValue: 1, wins: 3, losses: 0, absences: 0, awards: [] }],
        west: [{ rikishiID: 2, record: makeRecord(3), rank: 'Ozeki 1 West',    rankValue: 2, wins: 3, losses: 0, absences: 0, awards: [] }],
      }
      useDivisionStore.mockReturnValue(storeBase)
      useBanzuke.mockReturnValue({ data: allDay3Complete, isLoading: false, error: null, refetch: vi.fn() })
      useTorikumi.mockImplementation((_b, _d, day) => day === 4 ? boutResult : emptyBouts)

      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.click(screen.getByRole('button', { name: 'Torikumi' }))
      await waitFor(() => expect(screen.getByTestId('torikumi-tab')).toHaveAttribute('data-day', '4'))

      // User manually picks day 2 via the day selector
      fireEvent.click(screen.getByTestId('manual-day-select'))

      // Auto-select effect is suppressed — day stays at user's manual choice
      await waitFor(() => expect(screen.getByTestId('torikumi-tab')).toHaveAttribute('data-day', '2'))
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
