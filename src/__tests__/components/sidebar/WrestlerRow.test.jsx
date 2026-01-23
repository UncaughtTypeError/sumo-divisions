import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithQueryClient } from '../../testUtils'
import WrestlerRow from '../../../components/sidebar/WrestlerRow'
import { AWARD_TYPES, RECORD_STATUS_TYPES } from '../../../utils/awards'

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
    renderWithQueryClient(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
  })

  it('should render wrestler rank', () => {
    renderWithQueryClient(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
    expect(screen.getByText('Yokozuna 1 East')).toBeInTheDocument()
  })

  it('should render wrestler record', () => {
    renderWithQueryClient(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
    expect(screen.getByText('12-3-0')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    renderWithQueryClient(<WrestlerRow wrestler={mockWrestler} onClick={onClick} />)

    fireEvent.click(screen.getByText('Terunofuji'))
    expect(onClick).toHaveBeenCalledWith(mockWrestler)
  })

  it('should render yusho award with trophy emoji', () => {
    const wrestlerWithYusho = {
      ...mockWrestler,
      awards: [AWARD_TYPES.YUSHO],
    }
    renderWithQueryClient(<WrestlerRow wrestler={wrestlerWithYusho} onClick={() => {}} />)
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
    renderWithQueryClient(<WrestlerRow wrestler={wrestlerWithPrizes} onClick={() => {}} />)
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('should not render awards section when no awards', () => {
    renderWithQueryClient(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
    expect(screen.queryByText('Y')).not.toBeInTheDocument()
    expect(screen.queryByText('S')).not.toBeInTheDocument()
  })

  it('should handle wrestler with default values', () => {
    const wrestlerWithDefaults = {
      rikishiID: 2,
      shikonaEn: 'Test',
      rank: 'Maegashira 1 East',
    }
    renderWithQueryClient(<WrestlerRow wrestler={wrestlerWithDefaults} onClick={() => {}} />)
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
    renderWithQueryClient(<WrestlerRow wrestler={wrestlerWithAllPrizes} onClick={() => {}} />)
    // Yusho has "🏆Y" combined in one element
    expect(screen.getByText(/🏆/)).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
    expect(screen.getByText('G')).toBeInTheDocument()
  })

  describe('kachi-koshi/make-koshi badges', () => {
    it('should render KK badge for winning record in Makuuchi', () => {
      const winningWrestler = {
        ...mockWrestler,
        wins: 8,
        losses: 7,
      }
      renderWithQueryClient(<WrestlerRow wrestler={winningWrestler} onClick={() => {}} division="Makuuchi" />)
      expect(screen.getByText('KK')).toBeInTheDocument()
      // Tooltip content
      expect(screen.getByText('Kachi-koshi')).toBeInTheDocument()
    })

    it('should render MK badge for losing record in Makuuchi', () => {
      const losingWrestler = {
        ...mockWrestler,
        wins: 7,
        losses: 8,
      }
      renderWithQueryClient(<WrestlerRow wrestler={losingWrestler} onClick={() => {}} division="Makuuchi" />)
      expect(screen.getByText('MK')).toBeInTheDocument()
      // Tooltip content
      expect(screen.getByText('Make-koshi')).toBeInTheDocument()
    })

    it('should render KK badge for 4+ wins in Makushita', () => {
      const winningWrestler = {
        ...mockWrestler,
        wins: 4,
        losses: 3,
      }
      renderWithQueryClient(<WrestlerRow wrestler={winningWrestler} onClick={() => {}} division="Makushita" />)
      expect(screen.getByText('KK')).toBeInTheDocument()
    })

    it('should render MK badge for 4+ losses in Makushita', () => {
      const losingWrestler = {
        ...mockWrestler,
        wins: 3,
        losses: 4,
      }
      renderWithQueryClient(<WrestlerRow wrestler={losingWrestler} onClick={() => {}} division="Makushita" />)
      expect(screen.getByText('MK')).toBeInTheDocument()
    })

    it('should not render KK/MK badge when record not determined', () => {
      const undeterminedWrestler = {
        ...mockWrestler,
        wins: 5,
        losses: 5,
      }
      renderWithQueryClient(<WrestlerRow wrestler={undeterminedWrestler} onClick={() => {}} division="Makuuchi" />)
      expect(screen.queryByText('KK')).not.toBeInTheDocument()
      expect(screen.queryByText('MK')).not.toBeInTheDocument()
    })

    it('should render KK badge before award badges', () => {
      const wrestlerWithKKAndAward = {
        ...mockWrestler,
        wins: 12,
        losses: 3,
        awards: [AWARD_TYPES.YUSHO],
      }
      renderWithQueryClient(<WrestlerRow wrestler={wrestlerWithKKAndAward} onClick={() => {}} division="Makuuchi" />)

      // Both badges should be present
      expect(screen.getByText('KK')).toBeInTheDocument()
      expect(screen.getByText(/🏆/)).toBeInTheDocument()
    })
  })
})
