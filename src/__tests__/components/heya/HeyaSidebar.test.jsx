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
  useRikishiList: vi.fn(() => ({ rikishiMap: new Map(), rankHistoryMap: new Map(), isLoading: false })),
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
import { useRikishiList } from '../../../hooks/useRikishi'
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

function setupStore(overrides = {}) {
  useDivisionStore.mockReturnValue({
    selectedHeya: 'Isegahama',
    // IDs of wrestlers in this heya — passed from HeyaCard on click
    selectedHeyaRikishiIds: [1], // Terunofuji belongs to Isegahama
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
      // Store has selectedHeyaRikishiIds: [1] → only Terunofuji passes the ID filter
      setupStore()
      useAllDivisionsBanzuke.mockReturnValue({
        allWrestlers: [makuuchiWrestler, juryoWrestler],
        isLoading: false,
        isError: false,
      })
    })

    it('shows only wrestlers whose ID is in selectedHeyaRikishiIds', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      // Mitoryu (ID 2) is not in selectedHeyaRikishiIds: [1] → filtered out
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

    it('renders no-data message when no banzuke wrestlers match the heya IDs', () => {
      // Store passes ID 99 which doesn't exist in the banzuke
      setupStore({ selectedHeyaRikishiIds: [99] })
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByText(/No rikishi found in Isegahama/)).toBeInTheDocument()
    })
  })

  describe('filter by day', () => {
    // Records are always 3 entries; Nishikigi has result:'absent' on day 2
    const wrestlerWithThreeBouts = {
      rikishiID: 1,
      shikonaEn: 'Terunofuji',
      rank: 'Yokozuna 1 East',
      rankValue: 1,
      wins: 2,
      losses: 1,
      absences: 0,
      record: [
        { result: 'win', opponentShikonaEn: 'Hoshoryu', opponentID: 3, kimarite: 'yorikiri' },
        { result: 'loss', opponentShikonaEn: 'Onosato', opponentID: 4, kimarite: 'oshidashi' },
        { result: 'win', opponentShikonaEn: 'Kotozakura', opponentID: 5, kimarite: 'uwatenage' },
      ],
      awards: [],
    }

    const wrestlerWithAbsence = {
      rikishiID: 2,
      shikonaEn: 'Nishikigi',
      rank: 'Maegashira 3 East',
      rankValue: 80,
      wins: 2,
      losses: 0,
      absences: 1,
      record: [
        { result: 'win', opponentShikonaEn: 'Abi', opponentID: 6, kimarite: 'oshidashi' },
        { result: 'absent', opponentShikonaEn: '', opponentID: null, kimarite: '' },
        { result: 'win', opponentShikonaEn: 'Tobizaru', opponentID: 7, kimarite: 'yorikiri' },
      ],
      awards: [],
    }

    beforeEach(() => {
      // Both wrestlers (IDs 1 and 2) are in the heya
      setupStore({ selectedHeyaRikishiIds: [1, 2] })
      useAllDivisionsBanzuke.mockReturnValue({
        allWrestlers: [wrestlerWithThreeBouts, wrestlerWithAbsence],
        isLoading: false,
        isError: false,
      })
    })

    it('renders the day filter dropdown when records exist', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByLabelText('Filter by day')).toBeInTheDocument()
    })

    it('defaults to "Any day"', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByLabelText('Filter by day')).toHaveValue('0')
    })

    it('dropdown has an option per recorded day plus the Any day option', () => {
      renderWithQueryClient(<HeyaSidebar />)
      // maxDay = 3 (Terunofuji has 3 records); options = Any day + Day 1 + Day 2 + Day 3
      const select = screen.getByLabelText('Filter by day')
      expect(select.options).toHaveLength(4)
      expect(select.options[0].text).toBe('Any day')
      expect(select.options[1].text).toBe('Day 1')
      expect(select.options[3].text).toBe('Day 3')
    })

    it('hides a wrestler with result:"absent" on the selected day', () => {
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      expect(screen.getByText('Nishikigi')).toBeInTheDocument()

      // Nishikigi has result:'absent' on day 2 → not competing → excluded
      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })

      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      expect(screen.queryByText('Nishikigi')).not.toBeInTheDocument()
    })

    it('hides a wrestler with result:"fusen loss" on the selected day', () => {
      useAllDivisionsBanzuke.mockReturnValue({
        allWrestlers: [
          wrestlerWithThreeBouts,
          {
            ...wrestlerWithAbsence,
            record: [
              { result: 'win', opponentShikonaEn: 'Abi', opponentID: 6, kimarite: 'oshidashi' },
              { result: 'fusen loss', opponentShikonaEn: 'Tobizaru', opponentID: 7, kimarite: 'fusen' },
              { result: 'win', opponentShikonaEn: 'Daieisho', opponentID: 8, kimarite: 'yorikiri' },
            ],
          },
        ],
        isLoading: false,
        isError: false,
      })
      renderWithQueryClient(<HeyaSidebar />)

      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })

      // fusen loss = wrestler forfeited (was absent) → excluded
      expect(screen.queryByText('Nishikigi')).not.toBeInTheDocument()
    })

    it('shows a wrestler with result:"fusen win" on the selected day', () => {
      useAllDivisionsBanzuke.mockReturnValue({
        allWrestlers: [
          wrestlerWithThreeBouts,
          {
            ...wrestlerWithAbsence,
            record: [
              { result: 'win', opponentShikonaEn: 'Abi', opponentID: 6, kimarite: 'oshidashi' },
              { result: 'fusen win', opponentShikonaEn: 'Tobizaru', opponentID: 7, kimarite: 'fusen' },
              { result: 'win', opponentShikonaEn: 'Daieisho', opponentID: 8, kimarite: 'yorikiri' },
            ],
          },
        ],
        isLoading: false,
        isError: false,
      })
      renderWithQueryClient(<HeyaSidebar />)

      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })

      // fusen win = opponent absent, wrestler was present → included
      expect(screen.getByText('Nishikigi')).toBeInTheDocument()
    })

    it('dropdown does not include future days (result:"")', () => {
      useAllDivisionsBanzuke.mockReturnValue({
        allWrestlers: [
          {
            ...wrestlerWithThreeBouts,
            record: [
              { result: 'win', opponentShikonaEn: 'Hoshoryu', opponentID: 3, kimarite: 'yorikiri' },
              { result: 'loss', opponentShikonaEn: 'Onosato', opponentID: 4, kimarite: 'oshidashi' },
              { result: '', opponentShikonaEn: '', opponentID: null, kimarite: '' }, // future
            ],
          },
          wrestlerWithAbsence,
        ],
        isLoading: false,
        isError: false,
      })
      renderWithQueryClient(<HeyaSidebar />)

      const select = screen.getByLabelText('Filter by day')
      // maxDay = 3 (Nishikigi's last non-empty is index 2); Day 3 from future record excluded
      // Terunofuji's last non-empty is index 1 (day 2), Nishikigi's is index 2 (day 3)
      expect(select.options).toHaveLength(4) // Any day + Day 1 + Day 2 + Day 3
      expect(Array.from(select.options).map(o => o.text)).not.toContain('Day 4')
    })

    it('shows wrestlers who competed on day 1', () => {
      renderWithQueryClient(<HeyaSidebar />)
      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '1' } })
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      expect(screen.getByText('Nishikigi')).toBeInTheDocument()
    })

    it('switching back to "Any day" restores all wrestlers', () => {
      renderWithQueryClient(<HeyaSidebar />)
      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })
      fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '0' } })
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      expect(screen.getByText('Nishikigi')).toBeInTheDocument()
    })

    it('does not render day dropdown when heya has no wrestlers with records', () => {
      useAllDivisionsBanzuke.mockReturnValue({
        allWrestlers: [{ ...wrestlerWithThreeBouts, record: [] }, { ...wrestlerWithAbsence, record: [] }],
        isLoading: false,
        isError: false,
      })
      renderWithQueryClient(<HeyaSidebar />)
      expect(screen.queryByLabelText('Filter by day')).not.toBeInTheDocument()
    })
  })
})
