import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RankBadge from '../../../components/common/RankBadge'

describe('RankBadge', () => {
  it('renders rank abbreviation and count', () => {
    render(<RankBadge rank="Yokozuna" count={2} />)
    expect(screen.getByText('Y')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders with count of zero', () => {
    render(<RankBadge rank="Ozeki" count={0} />)
    expect(screen.getByText('O')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('hides when hideIfZero is true and count is 0', () => {
    const { container } = render(
      <RankBadge rank="Yokozuna" count={0} hideIfZero />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows when hideIfZero is true but count > 0', () => {
    render(<RankBadge rank="Yokozuna" count={1} hideIfZero />)
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
      const { unmount } = render(<RankBadge rank={rank} count={1} />)
      expect(screen.getByText(abbr)).toBeInTheDocument()
      unmount()
    })
  })

  it('renders the full rank name as tooltip content', () => {
    const { container } = render(<RankBadge rank="Maegashira" count={5} />)
    fireEvent.mouseEnter(container.firstChild)
    expect(screen.getByText('Maegashira')).toBeInTheDocument()
  })

  // ─── side / label (banzuke grid usage) ───────────────────────────────────

  it('renders an East/West side indicator instead of a count when side is given', () => {
    render(<RankBadge rank="Maegashira" side="East" />)
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('renders "W" for the West side', () => {
    render(<RankBadge rank="Maegashira" side="West" />)
    expect(screen.getByText('W')).toBeInTheDocument()
  })

  it('uses a custom label instead of the tier abbreviation when provided', () => {
    render(<RankBadge rank="Maegashira" side="East" label="M3" />)
    expect(screen.getByText('M3')).toBeInTheDocument()
    expect(screen.queryByText('M')).not.toBeInTheDocument()
  })

  it('is coloured (active) when side is given, even without a count', () => {
    const { container } = render(<RankBadge rank="Maegashira" side="East" />)
    const badge = container.querySelector('[class*="badge"]')
    expect(badge.style.backgroundColor).toBe('var(--color-makuuchi)')
  })

  it('includes the side in the tooltip content', () => {
    const { container } = render(<RankBadge rank="Maegashira" side="East" />)
    fireEvent.mouseEnter(container.firstChild)
    expect(screen.getByText('East')).toBeInTheDocument()
  })

  it('applies the compact size variant class when compact is set', () => {
    const { container } = render(<RankBadge rank="Maegashira" side="East" compact />)
    const badge = container.querySelector('[class*="badge"]')
    expect(badge.className).toMatch(/compact/)
  })
})
