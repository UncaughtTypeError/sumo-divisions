import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeyaRankBadge from '../../../components/heya/HeyaRankBadge'

describe('HeyaRankBadge', () => {
  it('renders rank abbreviation and count', () => {
    render(<HeyaRankBadge rank="Yokozuna" count={2} />)
    expect(screen.getByText('Y')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders with count of zero', () => {
    render(<HeyaRankBadge rank="Ozeki" count={0} />)
    expect(screen.getByText('O')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('hides when hideIfZero is true and count is 0', () => {
    const { container } = render(
      <HeyaRankBadge rank="Yokozuna" count={0} hideIfZero />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows when hideIfZero is true but count > 0', () => {
    render(<HeyaRankBadge rank="Yokozuna" count={1} hideIfZero />)
    expect(screen.getByText('Y')).toBeInTheDocument()
  })

  it('uses correct abbreviation for each rank', () => {
    const cases = [
      ['Yokozuna', 'Y'],
      ['Ozeki', 'O'],
      ['Sekiwake', 'S'],
      ['Komusubi', 'K'],
      ['Maegashira', 'M'],
      ['Juryo', 'J'],
      ['Makushita', 'Ms'],
      ['Sandanme', 'Sd'],
      ['Jonidan', 'Jd'],
      ['Jonokuchi', 'Jk'],
    ]

    cases.forEach(([rank, abbr]) => {
      const { unmount } = render(<HeyaRankBadge rank={rank} count={1} />)
      expect(screen.getByText(abbr)).toBeInTheDocument()
      unmount()
    })
  })

  it('renders the full rank name as tooltip content', () => {
    render(<HeyaRankBadge rank="Maegashira" count={5} />)
    // Tooltip renders the nameEn from RANK_INFO
    expect(screen.getByText('Maegashira')).toBeInTheDocument()
  })
})
