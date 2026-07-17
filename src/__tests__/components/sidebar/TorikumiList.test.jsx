import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TorikumiList from '../../../components/sidebar/TorikumiList'

// KimariteModal uses Headless UI — mock it for simplicity
vi.mock('../../../components/modal/KimariteModal', () => ({
  default: ({ isOpen, onClose, kimarite }) =>
    isOpen ? (
      <div data-testid="kimarite-modal">
        <span>{kimarite}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

// HeadToHeadModal uses Headless UI — mock it for simplicity
vi.mock('../../../components/modal/HeadToHeadModal', () => ({
  default: ({ isOpen, onClose, wrestlerPerspective }) =>
    isOpen ? (
      <div data-testid="h2h-modal" data-wrestler-perspective={String(wrestlerPerspective)}>
        <button onClick={onClose}>Close H2H</button>
      </div>
    ) : null,
}))

vi.mock('../../../hooks/useRikishi', () => ({
  useRikishiMatches: vi.fn(),
}))

import { useRikishiMatches } from '../../../hooks/useRikishi'

// ─────────────────────────────────────────────────────────────────────────────

const makeBout = (overrides = {}) => ({
  matchNo: 1,
  eastId: 10,
  westId: 20,
  eastShikona: 'Terunofuji',
  westShikona: 'Hoshoryu',
  eastRank: 'Yokozuna 1 East',
  westRank: 'Ozeki 1 West',
  winnerId: null,
  kimarite: null,
  ...overrides,
})

const wrestlerRecord = [
  { result: 'win',  opponentID: 20, kimarite: 'yorikiri' },
  { result: 'loss', opponentID: 30, kimarite: 'oshidashi' },
  { result: 'win',  opponentID: 40, kimarite: 'hatakikomi' },
  { result: 'win',  opponentID: 50, kimarite: 'yorikiri' },
  { result: 'win',  opponentID: 60, kimarite: 'yorikiri' },
  { result: 'win',  opponentID: 70, kimarite: 'yorikiri' },
  { result: 'win',  opponentID: 80, kimarite: 'yorikiri' },
  { result: 'win',  opponentID: 90, kimarite: 'yorikiri' },
  { result: 'win',  opponentID: 100, kimarite: 'yorikiri' }, // 8 wins = KK
]

const makeWrestler = (id, rank = 'Yokozuna 1 East', record = []) => ({
  rikishiID: id, shikonaEn: id === 10 ? 'Terunofuji' : 'Hoshoryu',
  rank, rankValue: 1, wins: 0, losses: 0, absences: 0, record,
})

const noopWrestlerById = () => null
const makeWrestlerById = (map) => (id) => map[id] ?? null

// ─────────────────────────────────────────────────────────────────────────────

describe('TorikumiList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRikishiMatches.mockReturnValue({ data: null, isLoading: false })
  })

  // ── Header ────────────────────────────────────────────────────────────────

  it('renders the East / Kimarite / West header row', () => {
    render(
      <TorikumiList bouts={[makeBout()]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.getByText('East')).toBeInTheDocument()
    expect(screen.getByText('Kimarite')).toBeInTheDocument()
    expect(screen.getByText('West')).toBeInTheDocument()
  })

  // ── Wrestler names ────────────────────────────────────────────────────────

  it('renders east and west shikona', () => {
    render(
      <TorikumiList bouts={[makeBout()]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
  })

  it('renders rank text for each wrestler', () => {
    render(
      <TorikumiList bouts={[makeBout()]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.getByText('Yokozuna 1 East')).toBeInTheDocument()
    expect(screen.getByText('Ozeki 1 West')).toBeInTheDocument()
  })

  it('shows "vs" when no result is available', () => {
    render(
      <TorikumiList bouts={[makeBout({ winnerId: null })]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.getByText('vs')).toBeInTheDocument()
  })

  // ── Result icons ──────────────────────────────────────────────────────────

  it('renders win icon (shiroboshi) for the winning wrestler', () => {
    const bout = makeBout({ winnerId: 10, kimarite: 'yorikiri' })
    const { container } = render(
      <TorikumiList bouts={[bout]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    // There should be exactly one shiroboshi (win) and one kuroboshi (loss)
    const shiroboshi = container.querySelectorAll('[class*="shiroboshi"]')
    const kuroboshi  = container.querySelectorAll('[class*="kuroboshi"]')
    expect(shiroboshi).toHaveLength(1)
    expect(kuroboshi).toHaveLength(1)
  })

  it('renders fusen squares for forfeit results', () => {
    const bout = makeBout({ winnerId: 10, kimarite: 'fusen' })
    const { container } = render(
      <TorikumiList bouts={[bout]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(container.querySelectorAll('[class*="fusenshoSquare"]')).toHaveLength(1)
    expect(container.querySelectorAll('[class*="fusenpaiSquare"]')).toHaveLength(1)
  })

  // ── Kimarite ──────────────────────────────────────────────────────────────

  it('shows kimarite as a clickable button for known techniques', () => {
    const bout = makeBout({ winnerId: 10, kimarite: 'yorikiri' })
    render(
      <TorikumiList bouts={[bout]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.getByRole('button', { name: /view details for yorikiri/i })).toBeInTheDocument()
  })

  it('opens KimariteModal when kimarite button is clicked', () => {
    const bout = makeBout({ winnerId: 10, kimarite: 'yorikiri' })
    render(
      <TorikumiList bouts={[bout]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    fireEvent.click(screen.getByRole('button', { name: /view details for yorikiri/i }))
    const modal = screen.getByTestId('kimarite-modal')
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveTextContent('yorikiri')
  })

  it('closes KimariteModal when Close is clicked', () => {
    const bout = makeBout({ winnerId: 10, kimarite: 'yorikiri' })
    render(
      <TorikumiList bouts={[bout]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    fireEvent.click(screen.getByRole('button', { name: /view details for yorikiri/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('kimarite-modal')).not.toBeInTheDocument()
  })

  it('renders unknown kimarite as plain text (no button)', () => {
    const bout = makeBout({ winnerId: 10, kimarite: 'unknowntechnique' })
    render(
      <TorikumiList bouts={[bout]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.queryByRole('button', { name: /view details/i })).not.toBeInTheDocument()
    expect(screen.getByText('unknowntechnique')).toBeInTheDocument()
  })

  // ── Wrestler click ────────────────────────────────────────────────────────

  it('renders wrestler name as a button when found in banzuke', () => {
    const onWrestlerClick = vi.fn()
    const wrestler = makeWrestler(10)
    const wrestlerById = makeWrestlerById({ 10: wrestler })
    render(
      <TorikumiList
        bouts={[makeBout()]}
        wrestlerById={wrestlerById}
        day={1}
        division="Makuuchi"
        onWrestlerClick={onWrestlerClick}
      />,
    )
    const btn = screen.getByRole('button', { name: /view terunofuji/i })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onWrestlerClick).toHaveBeenCalledWith(wrestler)
  })

  it('renders wrestler name as plain text when not found in banzuke', () => {
    render(
      <TorikumiList
        bouts={[makeBout()]}
        wrestlerById={noopWrestlerById}
        day={1}
        division="Makuuchi"
        onWrestlerClick={vi.fn()}
      />,
    )
    // Should not be a button
    expect(screen.queryByRole('button', { name: /view terunofuji/i })).not.toBeInTheDocument()
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
  })

  // ── KK / MK badges ───────────────────────────────────────────────────────

  it('shows KK badge (with tooltip) when wrestler has 8+ wins through the given day', () => {
    const wrestler = makeWrestler(10, 'Maegashira 1 East', wrestlerRecord) // 8 wins
    const wrestlerById = makeWrestlerById({ 10: wrestler })
    render(
      <TorikumiList
        bouts={[makeBout()]}
        wrestlerById={wrestlerById}
        day={9}
        division="Makuuchi"
      />,
    )
    expect(screen.getByText('KK')).toBeInTheDocument()
  })

  it('shows MK badge when wrestler has 8+ losses', () => {
    const mkRecord = Array(8).fill(null).map(() => ({
      result: 'loss', opponentID: 99, kimarite: 'oshidashi',
    }))
    const wrestler = makeWrestler(10, 'Maegashira 1 East', mkRecord)
    const wrestlerById = makeWrestlerById({ 10: wrestler })
    render(
      <TorikumiList
        bouts={[makeBout()]}
        wrestlerById={wrestlerById}
        day={8}
        division="Makuuchi"
      />,
    )
    expect(screen.getByText('MK')).toBeInTheDocument()
  })

  // ── Record text ───────────────────────────────────────────────────────────

  it('shows W-L record text when wrestler record is available', () => {
    const record = [
      { result: 'win',  opponentID: 20, kimarite: 'yorikiri' },
      { result: 'loss', opponentID: 30, kimarite: 'oshidashi' },
      { result: 'win',  opponentID: 40, kimarite: 'hatakikomi' },
    ]
    const wrestler = makeWrestler(10, 'Yokozuna 1 East', record)
    const wrestlerById = makeWrestlerById({ 10: wrestler })
    render(
      <TorikumiList
        bouts={[makeBout()]}
        wrestlerById={wrestlerById}
        day={3}
        division="Makuuchi"
      />,
    )
    expect(screen.getByText('2-1')).toBeInTheDocument()
  })

  // ── Multiple bouts ────────────────────────────────────────────────────────

  it('renders multiple bout rows', () => {
    const bouts = [
      makeBout({ matchNo: 1, eastShikona: 'Alpha', westShikona: 'Beta' }),
      makeBout({ matchNo: 2, eastShikona: 'Gamma', westShikona: 'Delta' }),
    ]
    render(
      <TorikumiList bouts={bouts} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  // ── H2H record link ───────────────────────────────────────────────────────

  it('shows 0–0 when wrestlers have no prior meetings', () => {
    useRikishiMatches.mockReturnValue({
      data: { rikishiWins: 0, opponentWins: 0, total: 0, matches: [] },
      isLoading: false,
    })
    render(
      <TorikumiList bouts={[makeBout()]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.getByText('0–0')).toBeInTheDocument()
  })

  it('shows the h2h record when wrestlers have prior meetings', () => {
    useRikishiMatches.mockReturnValue({
      data: { rikishiWins: 3, opponentWins: 2, total: 5, matches: [] },
      isLoading: false,
    })
    render(
      <TorikumiList bouts={[makeBout()]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.getByText('3–2')).toBeInTheDocument()
  })

  it('shows loading dots while h2h data is fetching', () => {
    useRikishiMatches.mockReturnValue({ data: null, isLoading: true })
    render(
      <TorikumiList bouts={[makeBout()]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.getByLabelText('Loading record')).toBeInTheDocument()
  })

  it('shows nothing for h2h when both wrestler IDs are absent', () => {
    useRikishiMatches.mockReturnValue({
      data: { rikishiWins: 5, opponentWins: 1, total: 6, matches: [] },
      isLoading: false,
    })
    const bout = makeBout({ eastId: null, westId: null })
    render(
      <TorikumiList bouts={[bout]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    expect(screen.queryByText('5–1')).not.toBeInTheDocument()
  })

  it('opens the h2h modal when the record link is clicked', () => {
    useRikishiMatches.mockReturnValue({
      data: { rikishiWins: 2, opponentWins: 1, total: 3, matches: [] },
      isLoading: false,
    })
    render(
      <TorikumiList bouts={[makeBout()]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    fireEvent.click(screen.getByText('2–1'))
    expect(screen.getByTestId('h2h-modal')).toBeInTheDocument()
  })

  it('opens h2h modal with wrestlerPerspective={false}', () => {
    useRikishiMatches.mockReturnValue({
      data: { rikishiWins: 2, opponentWins: 1, total: 3, matches: [] },
      isLoading: false,
    })
    render(
      <TorikumiList bouts={[makeBout()]} wrestlerById={noopWrestlerById} day={1} division="Makuuchi" />,
    )
    fireEvent.click(screen.getByText('2–1'))
    expect(screen.getByTestId('h2h-modal').dataset.wrestlerPerspective).toBe('false')
  })

  // ── divisionFor Juryo branch ─────────────────────────────────────────────────

  it('uses Juryo KK threshold (8) for Juryo-ranked wrestlers even when tab division is lower', () => {
    const juryoRecord = Array(4).fill({ result: 'win', opponentID: 99, kimarite: 'yorikiri' })
    const wrestler = makeWrestler(10, 'Juryo 1 East', juryoRecord)
    const wrestlerById = makeWrestlerById({ 10: wrestler })
    render(
      <TorikumiList
        bouts={[makeBout()]}
        wrestlerById={wrestlerById}
        day={4}
        division="Makushita"
      />,
    )
    expect(screen.queryByText('KK')).not.toBeInTheDocument()
  })

  // ── MK from absences ─────────────────────────────────────────────────────────

  it('shows MK badge when 7 losses plus 1 absence reaches the 8-loss threshold', () => {
    const mkAbsenceRecord = [
      ...Array(7).fill({ result: 'loss', opponentID: 99, kimarite: 'oshidashi' }),
      { result: 'absent', opponentID: null, kimarite: '' },
    ]
    const wrestler = makeWrestler(10, 'Maegashira 1 East', mkAbsenceRecord)
    const wrestlerById = makeWrestlerById({ 10: wrestler })
    render(
      <TorikumiList
        bouts={[makeBout()]}
        wrestlerById={wrestlerById}
        day={8}
        division="Makuuchi"
      />,
    )
    expect(screen.getByText('MK')).toBeInTheDocument()
  })
})
