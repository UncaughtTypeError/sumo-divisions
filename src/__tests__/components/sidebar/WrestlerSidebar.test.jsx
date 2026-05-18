import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import WrestlerSidebar from '../../../components/sidebar/WrestlerSidebar'
import { renderWithQueryClient, mockBanzukeData, mockBashoResults } from '../../testUtils'

// Mock the store
vi.mock('../../../store/divisionStore', () => ({
  default: vi.fn(),
}))

// Mock the hooks
vi.mock('../../../hooks/useBanzuke', () => ({
  default: vi.fn(),
}))

vi.mock('../../../hooks/useBashoResults', () => ({
  default: vi.fn(),
}))

vi.mock('../../../hooks/useRikishi', () => ({
  useAllRikishi: vi.fn(() => ({ rikishiMap: new Map(), isLoading: false })),
}))

// Mock child components
vi.mock('../../../components/sidebar/WrestlerGrid', () => ({
  default: ({ wrestlers, side, onWrestlerClick }) => (
    <div data-testid={`wrestler-grid-${side.toLowerCase()}`}>
      {wrestlers.map((w) => (
        <div key={w.rikishiID} onClick={() => onWrestlerClick(w)}>
          {w.shikonaEn}
        </div>
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
      <option value="202601">Jan 2026</option>
      <option value="202511">Nov 2025</option>
    </select>
  ),
}))

vi.mock('../../../components/sidebar/BashoWinners', () => ({
  default: () => <div data-testid="basho-winners">BashoWinners</div>,
}))

vi.mock('../../../components/modal/MatchHistoryModal', () => ({
  default: () => <div data-testid="match-history-modal">MatchHistoryModal</div>,
}))

vi.mock('../../../components/common/Loading', () => ({
  default: ({ message }) => <div data-testid="loading">{message}</div>,
}))

vi.mock('../../../components/common/ErrorMessage', () => ({
  default: ({ error, onRetry }) => (
    <div data-testid="error-message" onClick={onRetry}>
      {error?.message}
    </div>
  ),
}))

import useDivisionStore from '../../../store/divisionStore'
import useBanzuke from '../../../hooks/useBanzuke'
import useBashoResults from '../../../hooks/useBashoResults'

// Banzuke data covering all Makuuchi ranks for division view tests
const mockMakuuchiBanzukeData = {
  bashoId: '202601',
  division: 'Makuuchi',
  east: [
    { rikishiID: 1, shikonaEn: 'Terunofuji', rank: 'Yokozuna 1 East', rankValue: 1, wins: 12, losses: 3, absences: 0, record: [], awards: [] },
    { rikishiID: 2, shikonaEn: 'Kotozakura', rank: 'Ozeki 1 East', rankValue: 20, wins: 11, losses: 4, absences: 0, record: [], awards: [] },
    { rikishiID: 4, shikonaEn: 'Onosato', rank: 'Sekiwake 1 East', rankValue: 40, wins: 10, losses: 5, absences: 0, record: [], awards: [] },
    { rikishiID: 6, shikonaEn: 'Daieisho', rank: 'Komusubi 1 East', rankValue: 60, wins: 9, losses: 6, absences: 0, record: [], awards: [] },
    { rikishiID: 8, shikonaEn: 'Abi', rank: 'Maegashira 1 East', rankValue: 80, wins: 8, losses: 7, absences: 0, record: [], awards: [] },
  ],
  west: [
    { rikishiID: 3, shikonaEn: 'Hoshoryu', rank: 'Ozeki 1 West', rankValue: 20, wins: 10, losses: 5, absences: 0, record: [], awards: [] },
    { rikishiID: 5, shikonaEn: 'Wakamotoharu', rank: 'Sekiwake 1 West', rankValue: 40, wins: 9, losses: 6, absences: 0, record: [], awards: [] },
    { rikishiID: 7, shikonaEn: 'Tobizaru', rank: 'Komusubi 1 West', rankValue: 60, wins: 8, losses: 7, absences: 0, record: [], awards: [] },
    { rikishiID: 9, shikonaEn: 'Tamawashi', rank: 'Maegashira 1 West', rankValue: 80, wins: 7, losses: 8, absences: 0, record: [], awards: [] },
  ],
}

describe('WrestlerSidebar', () => {
  const mockCloseSidebar = vi.fn()
  const mockOpenModal = vi.fn()
  const mockSetRankLookup = vi.fn()
  const mockSetAllWrestlers = vi.fn()
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when sidebar is closed', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isSidebarOpen: false,
        isDivisionView: false,
        selectedRank: null,
        selectedDivision: null,
        selectedApiDivision: null,
        selectedColor: null,
        closeSidebar: mockCloseSidebar,
        openModal: mockOpenModal,
        setRankLookup: mockSetRankLookup,
        setAllWrestlers: mockSetAllWrestlers,
      })
      useBanzuke.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({
        data: null,
      })
    })

    it('should return null when sidebar is not open', () => {
      const { container } = renderWithQueryClient(<WrestlerSidebar />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when sidebar is open (single rank view)', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isSidebarOpen: true,
        isDivisionView: false,
        selectedRank: 'Yokozuna',
        selectedDivision: 'Makuuchi',
        selectedApiDivision: 'Makuuchi',
        selectedColor: 'yokozuna',
        closeSidebar: mockCloseSidebar,
        openModal: mockOpenModal,
        setRankLookup: mockSetRankLookup,
        setAllWrestlers: mockSetAllWrestlers,
      })
    })

    it('should render loading state', () => {
      useBanzuke.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: null })

      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.getByText('Loading rikishi...')).toBeInTheDocument()
    })

    it('should render error state', () => {
      const error = { message: 'Failed to fetch' }
      useBanzuke.mockReturnValue({
        data: null,
        isLoading: false,
        error,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: null })

      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    it('should render sidebar header with rank', () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByText('Yokozuna')).toBeInTheDocument()
    })

    it('should render close button', () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument()
    })

    it('should render BashoSelector', () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('basho-selector')).toBeInTheDocument()
    })

    it('should render MatchHistoryModal', () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('match-history-modal')).toBeInTheDocument()
    })

    it('should call closeSidebar when close button is clicked', async () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      renderWithQueryClient(<WrestlerSidebar />)

      fireEvent.click(screen.getByLabelText('Close sidebar'))

      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalled()
      }, { timeout: 500 })
    })

    it('should call closeSidebar when overlay is clicked', async () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      const { container } = renderWithQueryClient(<WrestlerSidebar />)
      const overlay = container.querySelector('div')

      fireEvent.click(overlay)

      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalled()
      }, { timeout: 500 })
    })
  })

  describe('when sidebar is open in Makuuchi division view', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isSidebarOpen: true,
        isDivisionView: true,
        selectedRank: null,
        selectedDivision: 'Makuuchi',
        selectedApiDivision: 'Makuuchi',
        selectedColor: 'makuuchi',
        closeSidebar: mockCloseSidebar,
        openModal: mockOpenModal,
        setRankLookup: mockSetRankLookup,
        setAllWrestlers: mockSetAllWrestlers,
      })
      useBanzuke.mockReturnValue({
        data: mockMakuuchiBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })
    })

    it('should render the division name in the header', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Makuuchi')
    })

    it('should render the Makuuchi kanji in the header', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByText('幕内')).toBeInTheDocument()
    })

    it('should render rank section titles for all five Makuuchi ranks', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByRole('heading', { level: 3, name: 'Yokozuna' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Ozeki' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Sekiwake' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Komusubi' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Maegashira' })).toBeInTheDocument()
    })

    it('should render wrestlers from each rank section', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      // Yokozuna
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      // Ozeki
      expect(screen.getByText('Kotozakura')).toBeInTheDocument()
      expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
      // Sekiwake
      expect(screen.getByText('Onosato')).toBeInTheDocument()
      // Maegashira
      expect(screen.getByText('Abi')).toBeInTheDocument()
    })

    it('should render multiple east/west grid pairs (one per rank)', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      const eastGrids = screen.getAllByTestId('wrestler-grid-east')
      const westGrids = screen.getAllByTestId('wrestler-grid-west')
      expect(eastGrids).toHaveLength(5)
      expect(westGrids).toHaveLength(5)
    })

    it('should render BashoWinners', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByTestId('basho-winners')).toBeInTheDocument()
    })

    it('should render search input', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByPlaceholderText('Search rikishi...')).toBeInTheDocument()
    })

    it('should render close button', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument()
    })

    it('should not render any single-rank heading in the header', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      // Header h2 should say Makuuchi, not any individual rank name at heading level
      const h2 = screen.getByRole('heading', { level: 2 })
      expect(h2).toHaveTextContent('Makuuchi')
    })
  })

  describe('filter by day', () => {
    // Records are always 3 entries (index = day - 1); Hoshoryu has result:'absent' on day 2
    const mockBanzukeWithRecords = {
      bashoId: '202601',
      division: 'Makuuchi',
      east: [
        {
          rikishiID: 1,
          shikonaEn: 'Terunofuji',
          rank: 'Yokozuna 1 East',
          rankValue: 1,
          wins: 2,
          losses: 1,
          absences: 0,
          record: [
            { result: 'win', opponentShikonaEn: 'Hoshoryu', opponentID: 2, kimarite: 'yorikiri' },
            { result: 'loss', opponentShikonaEn: 'Onosato', opponentID: 3, kimarite: 'oshidashi' },
            { result: 'win', opponentShikonaEn: 'Kotozakura', opponentID: 4, kimarite: 'uwatenage' },
          ],
          awards: [],
        },
      ],
      west: [
        {
          rikishiID: 2,
          shikonaEn: 'Hoshoryu',
          rank: 'Yokozuna 1 West',
          rankValue: 1,
          wins: 1,
          losses: 1,
          absences: 1,
          record: [
            { result: 'win', opponentShikonaEn: 'Kotozakura', opponentID: 4, kimarite: 'uwatenage' },
            { result: 'absent', opponentShikonaEn: '', opponentID: null, kimarite: '' },
            { result: 'loss', opponentShikonaEn: 'Onosato', opponentID: 3, kimarite: 'yorikiri' },
          ],
          awards: [],
        },
      ],
      isEmpty: false,
    }

    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isSidebarOpen: true,
        isDivisionView: false,
        selectedRank: 'Yokozuna',
        selectedDivision: 'Makuuchi',
        selectedApiDivision: 'Makuuchi',
        selectedColor: 'yokozuna',
        closeSidebar: mockCloseSidebar,
        openModal: mockOpenModal,
        setRankLookup: mockSetRankLookup,
        setAllWrestlers: mockSetAllWrestlers,
      })
      useBanzuke.mockReturnValue({
        data: mockBanzukeWithRecords,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: null })
    })

    it('renders the day filter dropdown when records exist', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByLabelText('Filter by day')).toBeInTheDocument()
    })

    it('defaults to "Any day"', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByLabelText('Filter by day')).toHaveValue('0')
    })

    it('dropdown has an option per recorded day plus the Any day option', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      // maxDay = 3 (Terunofuji has 3 records); options = Any day + Day 1 + Day 2 + Day 3
      const select = screen.getByLabelText('Filter by day')
      expect(select.options).toHaveLength(4)
      expect(select.options[0].text).toBe('Any day')
      expect(select.options[1].text).toBe('Day 1')
      expect(select.options[3].text).toBe('Day 3')
    })

    it('does not render day dropdown when all records are empty', () => {
      useBanzuke.mockReturnValue({
        data: mockMakuuchiBanzukeData, // all record: []
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.queryByLabelText('Filter by day')).not.toBeInTheDocument()
    })

    it('hides a wrestler with result:"absent" on the selected day', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      expect(screen.getByText('Hoshoryu')).toBeInTheDocument()

      // Hoshoryu has result:'absent' on day 2 → not competing → excluded
      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })

      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      expect(screen.queryByText('Hoshoryu')).not.toBeInTheDocument()
    })

    it('hides a wrestler with result:"fusen loss" on the selected day', () => {
      useBanzuke.mockReturnValue({
        data: {
          ...mockBanzukeWithRecords,
          west: [{
            ...mockBanzukeWithRecords.west[0],
            record: [
              { result: 'win', opponentShikonaEn: 'Onosato', opponentID: 3, kimarite: 'yorikiri' },
              { result: 'fusen loss', opponentShikonaEn: 'Kotozakura', opponentID: 4, kimarite: 'fusen' },
              { result: 'loss', opponentShikonaEn: 'Onosato', opponentID: 3, kimarite: 'oshidashi' },
            ],
          }],
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      renderWithQueryClient(<WrestlerSidebar />)

      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })

      // fusen loss = wrestler forfeited (was absent) → excluded
      expect(screen.queryByText('Hoshoryu')).not.toBeInTheDocument()
    })

    it('shows a wrestler with result:"fusen win" on the selected day', () => {
      useBanzuke.mockReturnValue({
        data: {
          ...mockBanzukeWithRecords,
          west: [{
            ...mockBanzukeWithRecords.west[0],
            record: [
              { result: 'win', opponentShikonaEn: 'Onosato', opponentID: 3, kimarite: 'yorikiri' },
              { result: 'fusen win', opponentShikonaEn: 'Kotozakura', opponentID: 4, kimarite: 'fusen' },
              { result: 'loss', opponentShikonaEn: 'Onosato', opponentID: 3, kimarite: 'oshidashi' },
            ],
          }],
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      renderWithQueryClient(<WrestlerSidebar />)

      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })

      // fusen win = opponent absent, wrestler was present → included
      expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
    })

    it('dropdown does not include future days (result:"")', () => {
      useBanzuke.mockReturnValue({
        data: {
          ...mockBanzukeWithRecords,
          east: [{
            ...mockBanzukeWithRecords.east[0],
            record: [
              { result: 'win', opponentShikonaEn: 'Hoshoryu', opponentID: 2, kimarite: 'yorikiri' },
              { result: 'loss', opponentShikonaEn: 'Onosato', opponentID: 3, kimarite: 'oshidashi' },
              { result: '', opponentShikonaEn: '', opponentID: null, kimarite: '' }, // future
            ],
          }],
          west: [{
            ...mockBanzukeWithRecords.west[0],
            record: [
              { result: 'win', opponentShikonaEn: 'Kotozakura', opponentID: 4, kimarite: 'uwatenage' },
              { result: '', opponentShikonaEn: '', opponentID: null, kimarite: '' }, // future
              { result: '', opponentShikonaEn: '', opponentID: null, kimarite: '' }, // future
            ],
          }],
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      renderWithQueryClient(<WrestlerSidebar />)

      const select = screen.getByLabelText('Filter by day')
      // maxDay = 2 (last non-empty result is index 1), so Day 3 should not appear
      expect(select.options).toHaveLength(3) // Any day + Day 1 + Day 2
      expect(Array.from(select.options).map(o => o.text)).not.toContain('Day 3')
    })

    it('shows wrestlers who competed on day 1', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '1' } })
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
    })

    it('switching back to "Any day" restores all wrestlers', () => {
      renderWithQueryClient(<WrestlerSidebar />)
      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })
      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '0' } })
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
    })
  })
})
