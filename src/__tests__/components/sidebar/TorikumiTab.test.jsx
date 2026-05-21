import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import TorikumiTab from '../../../components/sidebar/TorikumiTab'

vi.mock('../../../components/sidebar/TorikumiList', () => ({
  default: ({ bouts }) => (
    <div data-testid="torikumi-list">
      {bouts.map((b, i) => (
        <div key={i} data-testid="bout-row">
          {b.eastShikona} vs {b.westShikona}
        </div>
      ))}
    </div>
  ),
}))

vi.mock('../../../components/common/Loading', () => ({
  default: ({ message }) => <div data-testid="loading">{message}</div>,
}))

vi.mock('../../../components/common/ErrorMessage', () => ({
  default: ({ error }) => <div data-testid="error-message">{error?.message}</div>,
}))

// ─────────────────────────────────────────────────────────────────────────────

const makeBout = (east, west, eastRank = 'Yokozuna 1 East', westRank = 'Ozeki 1 West') => ({
  matchNo: Math.random(),
  eastId: 1, westId: 2,
  eastShikona: east, westShikona: west,
  eastRank, westRank,
  winnerId: null, kimarite: null,
})

const defaultProps = {
  torikumiData: null,
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: vi.fn(),
  torikumiMaxDay: 5,
  maxDay: 4,
  day: 4,
  onDayChange: vi.fn(),
  currentApiDivision: 'Makuuchi',
  currentColor: 'makuuchi',
  currentIsDivisionView: true,
  currentRank: null,
  wrestlerById: () => null,
  openModal: vi.fn(),
}

// ─────────────────────────────────────────────────────────────────────────────

describe('TorikumiTab', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.useRealTimers())

  // ── Controls ──────────────────────────────────────────────────────────────

  it('renders the filter input', () => {
    render(<TorikumiTab {...defaultProps} />)
    expect(screen.getByPlaceholderText('Filter by rikishi...')).toBeInTheDocument()
  })

  it('renders the sort select', () => {
    render(<TorikumiTab {...defaultProps} />)
    expect(screen.getByLabelText('Sort torikumi')).toBeInTheDocument()
  })

  it('renders the day selector when torikumiMaxDay > 0', () => {
    render(<TorikumiTab {...defaultProps} />)
    const select = screen.getByLabelText('Select day')
    expect(select).toBeInTheDocument()
    expect(select.options).toHaveLength(5)
  })

  it('does not render day selector when torikumiMaxDay is 0', () => {
    render(<TorikumiTab {...defaultProps} torikumiMaxDay={0} />)
    expect(screen.queryByLabelText('Select day')).not.toBeInTheDocument()
  })

  it('calls onDayChange when day selector changes', () => {
    const onDayChange = vi.fn()
    render(<TorikumiTab {...defaultProps} onDayChange={onDayChange} />)
    fireEvent.change(screen.getByLabelText('Select day'), { target: { value: '3' } })
    expect(onDayChange).toHaveBeenCalledWith(3)
  })

  // ── Loading / error ───────────────────────────────────────────────────────

  it('shows loading indicator during initial load (isLoading)', () => {
    render(<TorikumiTab {...defaultProps} isLoading={true} isFetching={true} />)
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading torikumi...')
  })

  it('shows refresh loader when isFetching with existing data (refetch)', () => {
    vi.useFakeTimers()
    const bouts = [makeBout('Terunofuji', 'Hoshoryu')]
    render(<TorikumiTab {...defaultProps} torikumiData={{ bouts }} isFetching={true} />)
    expect(screen.getByTestId('loading')).toHaveTextContent('Refreshing results...')
  })

  it('keeps refresh loader visible for at least 1.5 s after refetch completes', () => {
    vi.useFakeTimers()
    const bouts = [makeBout('Terunofuji', 'Hoshoryu')]
    const { rerender } = render(
      <TorikumiTab {...defaultProps} torikumiData={{ bouts }} isFetching={true} />,
    )
    // Refetch completes
    act(() => { rerender(<TorikumiTab {...defaultProps} torikumiData={{ bouts }} isFetching={false} />) })
    // Before 1.5 s the loader is still shown
    act(() => { vi.advanceTimersByTime(1000) })
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    // After 1.5 s it disappears
    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
  })

  it('shows error message when not loading', () => {
    render(<TorikumiTab {...defaultProps} error={{ message: 'Fetch failed' }} />)
    expect(screen.getByTestId('error-message')).toBeInTheDocument()
  })

  // ── Empty state ───────────────────────────────────────────────────────────

  it('shows empty state message when no bouts match', () => {
    render(<TorikumiTab {...defaultProps} torikumiData={{ bouts: [] }} day={4} />)
    expect(screen.getByText('No bouts found for Day 4.')).toBeInTheDocument()
  })

  // ── Bouts rendering ───────────────────────────────────────────────────────

  it('renders TorikumiList when bouts are available', () => {
    const bouts = [makeBout('Terunofuji', 'Hoshoryu')]
    render(<TorikumiTab {...defaultProps} torikumiData={{ bouts }} />)
    expect(screen.getByTestId('torikumi-list')).toBeInTheDocument()
    expect(screen.getByText('Terunofuji vs Hoshoryu')).toBeInTheDocument()
  })

  // ── Filter ────────────────────────────────────────────────────────────────

  it('filters bouts by wrestler name', () => {
    const bouts = [
      makeBout('Terunofuji', 'Hoshoryu'),
      makeBout('Onosato', 'Kirishima'),
    ]
    render(<TorikumiTab {...defaultProps} torikumiData={{ bouts }} />)
    fireEvent.change(screen.getByPlaceholderText('Filter by rikishi...'), { target: { value: 'teru' } })
    const rows = screen.getAllByTestId('bout-row')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toHaveTextContent('Terunofuji')
  })

  it('shows clear filter button when filter has text', () => {
    render(<TorikumiTab {...defaultProps} />)
    expect(screen.queryByLabelText('Clear filter')).not.toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Filter by rikishi...'), { target: { value: 'x' } })
    expect(screen.getByLabelText('Clear filter')).toBeInTheDocument()
  })

  it('clears filter when clear button clicked', () => {
    render(<TorikumiTab {...defaultProps} />)
    const input = screen.getByPlaceholderText('Filter by rikishi...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByLabelText('Clear filter'))
    expect(input.value).toBe('')
  })

  // ── Sort ──────────────────────────────────────────────────────────────────

  it('reverses bout order when sort is desc', () => {
    const bouts = [
      makeBout('Alpha', 'Beta'),
      makeBout('Gamma', 'Delta'),
    ]
    render(<TorikumiTab {...defaultProps} torikumiData={{ bouts }} />)
    fireEvent.change(screen.getByLabelText('Sort torikumi'), { target: { value: 'desc' } })
    const rows = screen.getAllByTestId('bout-row')
    expect(rows[0]).toHaveTextContent('Gamma')
    expect(rows[1]).toHaveTextContent('Alpha')
  })

  // ── Rank filter ───────────────────────────────────────────────────────────

  it('filters bouts by rank when not in division view', () => {
    const bouts = [
      makeBout('Terunofuji', 'Hoshoryu', 'Yokozuna 1 East', 'Ozeki 1 West'),
      makeBout('Onosato', 'Kirishima', 'Sekiwake 1 East', 'Sekiwake 1 West'),
    ]
    render(
      <TorikumiTab
        {...defaultProps}
        torikumiData={{ bouts }}
        currentIsDivisionView={false}
        currentRank="Yokozuna"
      />,
    )
    const rows = screen.getAllByTestId('bout-row')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toHaveTextContent('Terunofuji')
  })

  it('shows all bouts when in division view (no rank filter)', () => {
    const bouts = [
      makeBout('Terunofuji', 'Hoshoryu', 'Yokozuna 1 East', 'Ozeki 1 West'),
      makeBout('Onosato', 'Kirishima', 'Sekiwake 1 East', 'Sekiwake 1 West'),
    ]
    render(
      <TorikumiTab
        {...defaultProps}
        torikumiData={{ bouts }}
        currentIsDivisionView={true}
        currentRank={null}
      />,
    )
    expect(screen.getAllByTestId('bout-row')).toHaveLength(2)
  })
})
