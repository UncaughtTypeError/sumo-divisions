import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BanzukeTab from '../../../components/sidebar/BanzukeTab'

// ── Child mocks ───────────────────────────────────────────────────────────────

vi.mock('../../../components/sidebar/WrestlerGrid', () => ({
  default: ({ wrestlers, side, onWrestlerClick }) => (
    <div data-testid={`wrestler-grid-${side.toLowerCase()}`}>
      {wrestlers.map((w) => (
        <div key={w.rikishiID} onClick={() => onWrestlerClick(w)}>
          {w.shikonaEn}
          {w.isKyujo && <span>Kyujo</span>}
        </div>
      ))}
    </div>
  ),
}))

vi.mock('../../../components/sidebar/BashoWinners', () => ({
  default: () => <div data-testid="basho-winners">BashoWinners</div>,
}))

vi.mock('../../../components/common/Loading', () => ({
  default: ({ message }) => <div data-testid="loading">{message}</div>,
}))

vi.mock('../../../components/common/ErrorMessage', () => ({
  default: ({ error, onRetry }) => (
    <div data-testid="error-message" onClick={onRetry}>{error?.message}</div>
  ),
}))

vi.mock('../../../components/common/NoDataMessage', () => ({
  default: () => <div data-testid="no-data">No data</div>,
}))

// ─────────────────────────────────────────────────────────────────────────────

const baseWrestler = (overrides = {}) => ({
  rikishiID: 1, shikonaEn: 'Terunofuji', rank: 'Yokozuna 1 East',
  rankValue: 1, wins: 10, losses: 5, absences: 0,
  record: [], awards: [],
  ...overrides,
})

const baseGroup = (rank = 'Yokozuna', east = [], west = []) => ({
  rank,
  rankInfo: { nameEn: rank, nameJp: '横綱' },
  east,
  west,
})

const defaultProps = {
  data: { bashoId: '202601', division: 'Makuuchi', east: [], west: [], isEmpty: false },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
  bashoResults: null,
  allWrestlers: [],
  rankGroups: [],
  maxDay: 0,
  currentRank: 'Yokozuna',
  currentColor: 'yokozuna',
  currentApiDivision: 'Makuuchi',
  currentIsDivisionView: false,
  currentBashoId: '202601',
  rikishiMap: new Map(),
  openModal: vi.fn(),
}

// ─────────────────────────────────────────────────────────────────────────────

describe('BanzukeTab', () => {
  beforeEach(() => vi.clearAllMocks())

  // ── State guards ──────────────────────────────────────────────────────────

  it('shows loading indicator', () => {
    render(<BanzukeTab {...defaultProps} isLoading={true} data={null} />)
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByText('Loading rikishi...')).toBeInTheDocument()
  })

  it('shows error message with retry', () => {
    const refetch = vi.fn()
    render(<BanzukeTab {...defaultProps} error={{ message: 'Network error' }} data={null} refetch={refetch} />)
    expect(screen.getByTestId('error-message')).toHaveTextContent('Network error')
    fireEvent.click(screen.getByTestId('error-message'))
    expect(refetch).toHaveBeenCalled()
  })

  it('shows no-data when data.isEmpty is true', () => {
    render(<BanzukeTab {...defaultProps} data={{ ...defaultProps.data, isEmpty: true }} />)
    expect(screen.getByTestId('no-data')).toBeInTheDocument()
  })

  it('renders nothing when data is null and not loading', () => {
    const { container } = render(<BanzukeTab {...defaultProps} data={null} />)
    expect(container.firstChild).toBeNull()
  })

  // ── Content ───────────────────────────────────────────────────────────────

  it('renders BashoWinners when data is present', () => {
    render(<BanzukeTab {...defaultProps} />)
    expect(screen.getByTestId('basho-winners')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<BanzukeTab {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search rikishi...')).toBeInTheDocument()
  })

  it('renders sort order select', () => {
    render(<BanzukeTab {...defaultProps} />)
    expect(screen.getByLabelText('Sort order')).toBeInTheDocument()
  })

  it('does not render day filter when maxDay is 0', () => {
    render(<BanzukeTab {...defaultProps} maxDay={0} />)
    expect(screen.queryByLabelText('Filter by day')).not.toBeInTheDocument()
  })

  it('renders day filter when maxDay > 0', () => {
    render(<BanzukeTab {...defaultProps} maxDay={5} />)
    const select = screen.getByLabelText('Filter by day')
    expect(select).toBeInTheDocument()
    expect(select.options).toHaveLength(6) // Any day + Day 1–5
  })

  it('renders wrestler grids', () => {
    const group = baseGroup('Yokozuna',
      [baseWrestler({ rikishiID: 1, shikonaEn: 'Terunofuji' })],
      [baseWrestler({ rikishiID: 2, shikonaEn: 'Hoshoryu', rank: 'Yokozuna 1 West', rankValue: 1 })],
    )
    render(<BanzukeTab {...defaultProps} rankGroups={[group]} />)
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
  })

  it('renders rank section headers in division view', () => {
    const groups = [
      baseGroup('Yokozuna', [baseWrestler()], []),
      baseGroup('Ozeki', [baseWrestler({ rikishiID: 2, shikonaEn: 'Kotozakura', rank: 'Ozeki 1 East', rankValue: 20 })], []),
    ]
    render(<BanzukeTab {...defaultProps} currentIsDivisionView={true} currentRank={null} rankGroups={groups} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Yokozuna' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Ozeki' })).toBeInTheDocument()
  })

  it('calls openModal when wrestler is clicked', () => {
    const openModal = vi.fn()
    const group = baseGroup('Yokozuna', [baseWrestler()], [])
    render(<BanzukeTab {...defaultProps} rankGroups={[group]} openModal={openModal} />)
    fireEvent.click(screen.getByText('Terunofuji'))
    // filterAndSort enriches the wrestler (adds isKyujo), so use objectContaining
    expect(openModal).toHaveBeenCalledWith(
      expect.objectContaining({ rikishiID: 1, shikonaEn: 'Terunofuji' }),
    )
  })

  // ── Search filter ─────────────────────────────────────────────────────────

  it('filters wrestlers by search query', () => {
    const group = baseGroup('Yokozuna',
      [baseWrestler({ rikishiID: 1, shikonaEn: 'Terunofuji' })],
      [baseWrestler({ rikishiID: 2, shikonaEn: 'Hoshoryu', rank: 'Yokozuna 1 West', rankValue: 1 })],
    )
    render(<BanzukeTab {...defaultProps} rankGroups={[group]} />)

    fireEvent.change(screen.getByPlaceholderText('Search rikishi...'), { target: { value: 'teru' } })

    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.queryByText('Hoshoryu')).not.toBeInTheDocument()
  })

  it('shows clear button when search has text', () => {
    render(<BanzukeTab {...defaultProps} />)
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Search rikishi...'), { target: { value: 'x' } })
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', () => {
    render(<BanzukeTab {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search rikishi...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByLabelText('Clear search'))
    expect(input.value).toBe('')
  })

  // ── Day filter ────────────────────────────────────────────────────────────

  const wrestlerWithRecord = (id, name, record) => ({
    rikishiID: id, shikonaEn: name, rank: 'Yokozuna 1 East', rankValue: 1,
    wins: 2, losses: 1, absences: 0, awards: [], record,
  })

  const makeRecord = (...results) =>
    results.map((result) => ({ result, opponentShikonaEn: '', opponentID: null, kimarite: '' }))

  it('defaults to Any day (shows all wrestlers)', () => {
    const group = baseGroup('Yokozuna',
      [wrestlerWithRecord(1, 'Terunofuji', makeRecord('win', 'loss', 'win'))],
      [wrestlerWithRecord(2, 'Hoshoryu', makeRecord('win', 'absent', 'loss'))],
    )
    render(<BanzukeTab {...defaultProps} maxDay={3} rankGroups={[group]} />)
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
  })

  it('shows Kyujo badge for absent wrestlers on selected day', () => {
    const group = baseGroup('Yokozuna',
      [wrestlerWithRecord(1, 'Terunofuji', makeRecord('win', 'loss', 'win'))],
      [wrestlerWithRecord(2, 'Hoshoryu', makeRecord('win', 'absent', 'loss'))],
    )
    render(<BanzukeTab {...defaultProps} maxDay={3} rankGroups={[group]} />)
    fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
    expect(screen.getByText('Kyujo')).toBeInTheDocument()
  })

  it('hides wrestlers with future (empty-string) result on selected day', () => {
    const group = baseGroup('Yokozuna',
      [wrestlerWithRecord(1, 'Terunofuji', makeRecord('win', 'loss', ''))],
      [],
    )
    // maxDay=3 so Day 3 is a selectable option; record[2] is '' → future day
    render(<BanzukeTab {...defaultProps} maxDay={3} rankGroups={[group]} />)
    fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '3' } })
    expect(screen.queryByText('Terunofuji')).not.toBeInTheDocument()
  })

  it('shows fusen-win wrestler on selected day', () => {
    const group = baseGroup('Yokozuna',
      [],
      [wrestlerWithRecord(1, 'Hoshoryu', makeRecord('win', 'fusen win', 'loss'))],
    )
    render(<BanzukeTab {...defaultProps} maxDay={3} rankGroups={[group]} />)
    fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })
    expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
  })

  it('switches back to Any day and restores all wrestlers', () => {
    const group = baseGroup('Yokozuna',
      [wrestlerWithRecord(1, 'Terunofuji', makeRecord('win', 'loss', 'win'))],
      [wrestlerWithRecord(2, 'Hoshoryu', makeRecord('win', 'absent', 'loss'))],
    )
    render(<BanzukeTab {...defaultProps} maxDay={3} rankGroups={[group]} />)
    fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '0' } })
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
  })

  it('does NOT show Kyujo badge for a scheduled non-fight day in a lower division', () => {
    // Day 2 absent but day 3 has a subsequent loss → scheduled non-fight day, not kyujo
    const group = baseGroup('Makushita',
      [wrestlerWithRecord(1, 'Terunofuji', makeRecord('win', 'absent', 'loss'))],
      [],
    )
    render(
      <BanzukeTab {...defaultProps} currentApiDivision="Makushita" maxDay={3} rankGroups={[group]} />,
    )
    fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.queryByText('Kyujo')).not.toBeInTheDocument()
  })

  it('shows Kyujo badge for genuine kyujo in a lower division (no subsequent bouts)', () => {
    // Day 2 absent, days 3-4 also absent → wrestler withdrew, no subsequent fights
    const group = baseGroup('Makushita',
      [wrestlerWithRecord(1, 'Terunofuji', makeRecord('win', 'absent', 'absent', 'absent'))],
      [],
    )
    render(
      <BanzukeTab {...defaultProps} currentApiDivision="Makushita" maxDay={4} rankGroups={[group]} />,
    )
    fireEvent.change(screen.getByLabelText('Filter by day'), { target: { value: '2' } })
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.getByText('Kyujo')).toBeInTheDocument()
  })

  it('day dropdown excludes future days (result is empty string)', () => {
    // Only 2 played days; 3rd has empty result
    const group = baseGroup('Yokozuna',
      [wrestlerWithRecord(1, 'Terunofuji', makeRecord('win', 'loss', ''))],
      [],
    )
    render(<BanzukeTab {...defaultProps} maxDay={2} rankGroups={[group]} />)
    const select = screen.getByLabelText('Filter by day')
    expect(select.options).toHaveLength(3) // Any day + Day 1 + Day 2
    expect(Array.from(select.options).map((o) => o.text)).not.toContain('Day 3')
  })

  // ── Sort by wins ──────────────────────────────────────────────────────────────

  describe('sort by wins', () => {
    const highWins = baseWrestler({ rikishiID: 1, shikonaEn: 'Terunofuji', wins: 12, losses: 3, rankValue: 1 })
    const lowWins  = baseWrestler({ rikishiID: 2, shikonaEn: 'Hoshoryu',   wins: 3,  losses: 9, rankValue: 2 })

    it('sorts wrestlers ascending by wins', () => {
      const group = baseGroup('Yokozuna', [highWins, lowWins], [])
      render(<BanzukeTab {...defaultProps} rankGroups={[group]} />)
      fireEvent.change(screen.getByLabelText('Sort order'), { target: { value: 'wins-asc' } })
      const eastGrid = screen.getByTestId('wrestler-grid-east')
      // Hoshoryu (3 wins) should appear before Terunofuji (12 wins)
      expect(eastGrid.children[0].textContent).toContain('Hoshoryu')
      expect(eastGrid.children[1].textContent).toContain('Terunofuji')
    })

    it('sorts wrestlers descending by wins', () => {
      const group = baseGroup('Yokozuna', [lowWins, highWins], [])
      render(<BanzukeTab {...defaultProps} rankGroups={[group]} />)
      fireEvent.change(screen.getByLabelText('Sort order'), { target: { value: 'wins-desc' } })
      const eastGrid = screen.getByTestId('wrestler-grid-east')
      // Terunofuji (12 wins) should appear before Hoshoryu (3 wins)
      expect(eastGrid.children[0].textContent).toContain('Terunofuji')
      expect(eastGrid.children[1].textContent).toContain('Hoshoryu')
    })
  })

  // ── "No rikishi found" empty state ────────────────────────────────────────────

  it('shows "No rikishi found for {rank}" when rank group east and west are both empty', () => {
    const emptyGroup = baseGroup('Yokozuna', [], [])
    render(<BanzukeTab {...defaultProps} rankGroups={[emptyGroup]} />)
    expect(screen.getByText(/No rikishi found for Yokozuna/)).toBeInTheDocument()
  })
})
