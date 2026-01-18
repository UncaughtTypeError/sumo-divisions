import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WrestlerRow from '../../../components/sidebar/WrestlerRow'
import { AWARD_TYPES } from '../../../utils/awards'

describe('WrestlerRow', () => {
  const mockWrestler = {
    rikishiID: 1,
    shikonaEn: 'Terunofuji',
    rank: 'Yokozuna 1 East',
    wins: 12,
    losses: 3,
    absences: 0,
    awards: [],
  }

  it('should render wrestler name', () => {
    render(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
  })

  it('should render wrestler rank', () => {
    render(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
    expect(screen.getByText('Yokozuna 1 East')).toBeInTheDocument()
  })

  it('should render wrestler record', () => {
    render(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
    expect(screen.getByText('12-3-0')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<WrestlerRow wrestler={mockWrestler} onClick={onClick} />)

    fireEvent.click(screen.getByText('Terunofuji'))
    expect(onClick).toHaveBeenCalledWith(mockWrestler)
  })

  it('should render yusho award with trophy emoji', () => {
    const wrestlerWithYusho = {
      ...mockWrestler,
      awards: [AWARD_TYPES.YUSHO],
    }
    render(<WrestlerRow wrestler={wrestlerWithYusho} onClick={() => {}} />)
    // The span contains both trophy emoji and abbreviation
    expect(screen.getByText(/🏆/)).toBeInTheDocument()
    // Verify "Yusho" appears in the tooltip
    expect(screen.getByText('Yusho')).toBeInTheDocument()
  })

  it('should render special prize awards', () => {
    const wrestlerWithPrizes = {
      ...mockWrestler,
      awards: [AWARD_TYPES.SHUKUN_SHO, AWARD_TYPES.KANTO_SHO],
    }
    render(<WrestlerRow wrestler={wrestlerWithPrizes} onClick={() => {}} />)
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('should not render awards section when no awards', () => {
    render(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
    expect(screen.queryByText('Y')).not.toBeInTheDocument()
    expect(screen.queryByText('S')).not.toBeInTheDocument()
  })

  it('should handle wrestler with default values', () => {
    const wrestlerWithDefaults = {
      rikishiID: 2,
      shikonaEn: 'Test',
      rank: 'Maegashira 1 East',
    }
    render(<WrestlerRow wrestler={wrestlerWithDefaults} onClick={() => {}} />)
    expect(screen.getByText('0-0-0')).toBeInTheDocument()
  })

  it('should render all award types with tooltips', () => {
    const wrestlerWithAllPrizes = {
      ...mockWrestler,
      awards: [
        AWARD_TYPES.YUSHO,
        AWARD_TYPES.SHUKUN_SHO,
        AWARD_TYPES.KANTO_SHO,
        AWARD_TYPES.GINO_SHO,
      ],
    }
    render(<WrestlerRow wrestler={wrestlerWithAllPrizes} onClick={() => {}} />)
    // Yusho has "🏆Y" combined in one element
    expect(screen.getByText(/🏆/)).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
    expect(screen.getByText('G')).toBeInTheDocument()
  })
})
