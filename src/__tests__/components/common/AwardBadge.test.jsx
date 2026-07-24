import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AwardBadge from '../../../components/common/AwardBadge'
import { AWARD_TYPES } from '../../../utils/awards'

describe('AwardBadge', () => {
  it('renders the yusho abbreviation with trophy icon', () => {
    render(<AwardBadge type={AWARD_TYPES.YUSHO} />)
    expect(screen.getByText('🏆Y')).toBeInTheDocument()
  })

  it('renders the shukunsho abbreviation with no icon', () => {
    render(<AwardBadge type={AWARD_TYPES.SHUKUN_SHO} />)
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('renders the kantosho abbreviation with no icon', () => {
    render(<AwardBadge type={AWARD_TYPES.KANTO_SHO} />)
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders the ginosho abbreviation with no icon', () => {
    render(<AwardBadge type={AWARD_TYPES.GINO_SHO} />)
    expect(screen.getByText('G')).toBeInTheDocument()
  })

  it('appends count when count prop is provided', () => {
    render(<AwardBadge type={AWARD_TYPES.YUSHO} count={8} />)
    expect(screen.getByText('🏆Y 8')).toBeInTheDocument()
  })

  it('appends count for sansho when count prop is provided', () => {
    render(<AwardBadge type={AWARD_TYPES.SHUKUN_SHO} count={3} />)
    expect(screen.getByText('S 3')).toBeInTheDocument()
  })

  it('renders nothing for an unknown award type', () => {
    const { container } = render(<AwardBadge type="unknown-type" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows yusho tooltip content on hover', () => {
    render(<AwardBadge type={AWARD_TYPES.YUSHO} />)
    fireEvent.mouseEnter(screen.getByText('🏆Y').closest('[class*="tooltipWrapper"]'))
    expect(screen.getByText('Yusho')).toBeInTheDocument()
    expect(screen.getByText('優勝')).toBeInTheDocument()
    expect(screen.getByText('Tournament Champion')).toBeInTheDocument()
  })

  it('shows shukunsho tooltip content on hover', () => {
    render(<AwardBadge type={AWARD_TYPES.SHUKUN_SHO} />)
    fireEvent.mouseEnter(screen.getByText('S').closest('[class*="tooltipWrapper"]'))
    expect(screen.getByText('Shukun-shō')).toBeInTheDocument()
    expect(screen.getByText('殊勲賞')).toBeInTheDocument()
    expect(screen.getByText('Outstanding Performance')).toBeInTheDocument()
  })
})
