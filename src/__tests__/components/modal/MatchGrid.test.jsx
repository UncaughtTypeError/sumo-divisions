import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MatchGrid from '../../../components/modal/MatchGrid'

describe('MatchGrid', () => {
  const mockMatches = [
    { result: 'win', opponentShikonaEn: 'Takakeisho', kimarite: 'yorikiri' },
    { result: 'loss', opponentShikonaEn: 'Kotozakura', kimarite: 'oshidashi' },
    { result: 'fusen loss', opponentShikonaEn: 'Hoshoryu', kimarite: null },
  ]

  it('should render empty state when no matches', () => {
    render(<MatchGrid matches={[]} />)
    expect(screen.getByText('No match records available')).toBeInTheDocument()
  })

  it('should render empty state when matches is null', () => {
    render(<MatchGrid matches={null} />)
    expect(screen.getByText('No match records available')).toBeInTheDocument()
  })

  it('should render column headers', () => {
    render(<MatchGrid matches={mockMatches} />)
    expect(screen.getByText('Result')).toBeInTheDocument()
    expect(screen.getByText('Opponent')).toBeInTheDocument()
    expect(screen.getByText('Kimarite')).toBeInTheDocument()
  })

  it('should render match results in uppercase', () => {
    render(<MatchGrid matches={mockMatches} />)
    expect(screen.getByText('WIN')).toBeInTheDocument()
    expect(screen.getByText('LOSS')).toBeInTheDocument()
    expect(screen.getByText('FUSEN LOSS')).toBeInTheDocument()
  })

  it('should render opponent names', () => {
    render(<MatchGrid matches={mockMatches} />)
    expect(screen.getByText('Takakeisho')).toBeInTheDocument()
    expect(screen.getByText('Kotozakura')).toBeInTheDocument()
    expect(screen.getByText('Hoshoryu')).toBeInTheDocument()
  })

  it('should render kimarite', () => {
    render(<MatchGrid matches={mockMatches} />)
    expect(screen.getByText('yorikiri')).toBeInTheDocument()
    expect(screen.getByText('oshidashi')).toBeInTheDocument()
  })

  it('should render dash for missing kimarite', () => {
    render(<MatchGrid matches={mockMatches} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('should handle missing opponent name', () => {
    const matchWithMissingOpponent = [
      { result: 'win', opponentShikonaEn: null, kimarite: 'yorikiri' },
    ]
    render(<MatchGrid matches={matchWithMissingOpponent} />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('should render all matches', () => {
    render(<MatchGrid matches={mockMatches} />)
    // 3 matches + 1 header row
    const rows = screen.getAllByText(/yorikiri|oshidashi|—/)
    expect(rows).toHaveLength(3)
  })

  it('should handle empty result', () => {
    const matchWithEmptyResult = [
      { result: '', opponentShikonaEn: 'Test', kimarite: 'test' },
    ]
    render(<MatchGrid matches={matchWithEmptyResult} />)
    // Empty result shows "Result pending" as fallback
    expect(screen.getByText(/Result pending/i)).toBeInTheDocument()
  })
})
