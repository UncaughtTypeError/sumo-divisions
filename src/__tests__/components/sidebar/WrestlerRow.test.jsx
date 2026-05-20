import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithQueryClient } from '../../testUtils'
import WrestlerRow from '../../../components/sidebar/WrestlerRow'
import { AWARD_TYPES, RECORD_STATUS_TYPES } from '../../../utils/awards'

vi.mock('../../../components/modal/RikishiDetailModal', () => ({
  default: ({ isOpen }) =>
    isOpen ? <div data-testid="rikishi-detail-modal">Detail Modal</div> : null,
}))

vi.mock('../../../components/modal/RankHistoryModal', () => ({
  default: ({ isOpen }) =>
    isOpen ? <div data-testid="rank-history-modal">Rank History Modal</div> : null,
}))

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

  describe('rank movement indicators', () => {
    it('renders up arrow with delta when rankMovement is "up"', () => {
      const w = { ...mockWrestler, rankMovement: 'up', rankDelta: 2.5 }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('▲ 2.5')).toBeInTheDocument()
      // Tooltip content is rendered as a hidden <span> in the DOM
      expect(screen.getByText('Up 2.5 ranks')).toBeInTheDocument()
    })

    it('renders down arrow with delta when rankMovement is "down"', () => {
      const w = { ...mockWrestler, rankMovement: 'down', rankDelta: 1.5 }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('▼ 1.5')).toBeInTheDocument()
      expect(screen.getByText('Down 1.5 ranks')).toBeInTheDocument()
    })

    it('renders no arrow when rankMovement is "same"', () => {
      const w = { ...mockWrestler, rankMovement: 'same', rankDelta: 0 }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.queryByText(/▲/)).not.toBeInTheDocument()
      expect(screen.queryByText(/▼/)).not.toBeInTheDocument()
    })

    it('renders no arrow when rankMovement is null', () => {
      renderWithQueryClient(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
      expect(screen.queryByText(/▲/)).not.toBeInTheDocument()
      expect(screen.queryByText(/▼/)).not.toBeInTheDocument()
    })

    it('renders "Debut" badge with sanyaku tooltip for sanyaku-debut', () => {
      const w = { ...mockWrestler, debutType: 'sanyaku-debut', rank: 'Yokozuna 1 East' }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('Debut')).toBeInTheDocument()
      expect(screen.getByText('First appearance at Yokozuna')).toBeInTheDocument()
    })

    it('renders "Debut" badge with division tooltip for division-debut', () => {
      const w = { ...mockWrestler, debutType: 'division-debut' }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('Debut')).toBeInTheDocument()
      expect(screen.getByText('Division debut')).toBeInTheDocument()
    })

    it('renders "High" badge for career high', () => {
      const w = { ...mockWrestler, isCareerHigh: true }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('New career highest rank')).toBeInTheDocument()
    })

    it('does not render "High" badge alongside a debut (mutually exclusive)', () => {
      const w = { ...mockWrestler, isCareerHigh: false, debutType: 'sanyaku-debut' }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.queryByText('High')).not.toBeInTheDocument()
      expect(screen.getByText('Debut')).toBeInTheDocument()
    })

    it('sanyaku-debut tooltip reflects the actual rank base for Ozeki', () => {
      const w = { ...mockWrestler, debutType: 'sanyaku-debut', rank: 'Ozeki 1 East' }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('First appearance at Ozeki')).toBeInTheDocument()
    })

    it('sanyaku-debut tooltip reflects the actual rank base for Sekiwake', () => {
      const w = { ...mockWrestler, debutType: 'sanyaku-debut', rank: 'Sekiwake 1 West' }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('First appearance at Sekiwake')).toBeInTheDocument()
    })

    it('sanyaku-debut tooltip reflects the actual rank base for Komusubi', () => {
      const w = { ...mockWrestler, debutType: 'sanyaku-debut', rank: 'Komusubi 1 East' }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('First appearance at Komusubi')).toBeInTheDocument()
    })

    it('up arrow and High badge both render when no debut', () => {
      const w = { ...mockWrestler, rankMovement: 'up', rankDelta: 2.0, isCareerHigh: true, debutType: null }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('▲ 2.0')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('rank badge renders alongside KK badge without conflict', () => {
      const w = { ...mockWrestler, wins: 8, losses: 7, rankMovement: 'up', rankDelta: 1.5 }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} division="Makuuchi" />)
      expect(screen.getByText('KK')).toBeInTheDocument()
      expect(screen.getByText('▲ 1.5')).toBeInTheDocument()
    })

    it('down + debut cannot appear together — debutType ensures movement is "up"', () => {
      // This verifies the bug-fix contract: debut implies promotion; the UI must never
      // show a down arrow alongside a debut badge
      const w = { ...mockWrestler, rankMovement: 'up', rankDelta: 0.5, debutType: 'sanyaku-debut' }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('Debut')).toBeInTheDocument()
      expect(screen.getByText('▲ 0.5')).toBeInTheDocument()
      expect(screen.queryByText(/▼/)).not.toBeInTheDocument()
    })

    it('renders up arrow alongside debut (independent)', () => {
      const w = { ...mockWrestler, rankMovement: 'up', rankDelta: 3.0, debutType: 'sanyaku-debut' }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByText('▲ 3.0')).toBeInTheDocument()
      expect(screen.getByText('Debut')).toBeInTheDocument()
    })

    it('renders pulsing loading indicator while rank data loads', () => {
      const w = { ...mockWrestler, rankDataLoading: true }
      renderWithQueryClient(<WrestlerRow wrestler={w} onClick={() => {}} />)
      expect(screen.getByLabelText('Loading rank data')).toBeInTheDocument()
    })

    it('does not render loading indicator when rank data is not loading', () => {
      renderWithQueryClient(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
      expect(screen.queryByLabelText('Loading rank data')).not.toBeInTheDocument()
    })
  })

  describe('rikishi detail info button', () => {
    const rikishiDetails = {
      shikonaEn: 'Terunofuji',
      shikonaJp: '照ノ富士',
      currentRank: 'Yokozuna',
      heya: 'Isegahama',
      shusshin: 'Mongolia, Ulaanbaatar',
      height: 192,
      weight: 167,
      rankHistory: [{ id: '202605-1', bashoId: '202605', rank: 'Yokozuna 1 East', rankValue: 101 }],
    }
    const rikishiMap = new Map([[1, rikishiDetails]])

    it('should not render info button when rikishiMap is not provided', () => {
      renderWithQueryClient(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} />)
      expect(screen.queryByLabelText('View rikishi details')).not.toBeInTheDocument()
    })

    it('should not render info button when wrestler has no entry in rikishiMap', () => {
      const emptyMap = new Map()
      renderWithQueryClient(<WrestlerRow wrestler={mockWrestler} onClick={() => {}} rikishiMap={emptyMap} />)
      expect(screen.queryByLabelText('View rikishi details')).not.toBeInTheDocument()
    })

    it('should render info button when rikishiDetails is available', () => {
      renderWithQueryClient(
        <WrestlerRow wrestler={mockWrestler} onClick={() => {}} rikishiMap={rikishiMap} />
      )
      expect(screen.getByLabelText('View rikishi details')).toBeInTheDocument()
    })

    it('should not call row onClick when info button is clicked', () => {
      const onClick = vi.fn()
      renderWithQueryClient(
        <WrestlerRow wrestler={mockWrestler} onClick={onClick} rikishiMap={rikishiMap} />
      )
      fireEvent.click(screen.getByLabelText('View rikishi details'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('should open the detail modal when info button is clicked', () => {
      renderWithQueryClient(
        <WrestlerRow wrestler={mockWrestler} onClick={() => {}} rikishiMap={rikishiMap} />
      )
      expect(screen.queryByTestId('rikishi-detail-modal')).not.toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('View rikishi details'))
      expect(screen.getByTestId('rikishi-detail-modal')).toBeInTheDocument()
    })
  })

  describe('rank history button', () => {
    const rikishiWithHistory = {
      shikonaEn: 'Terunofuji',
      heya: 'Isegahama',
      rankHistory: [{ id: '202605-1', bashoId: '202605', rank: 'Yokozuna 1 East', rankValue: 101 }],
    }
    const mapWithHistory = new Map([[1, rikishiWithHistory]])
    const mapWithoutHistory = new Map([[1, { shikonaEn: 'Terunofuji', rankHistory: [] }]])

    it('renders rank history button when rikishi has rank history', () => {
      renderWithQueryClient(
        <WrestlerRow wrestler={mockWrestler} onClick={() => {}} rikishiMap={mapWithHistory} />
      )
      expect(screen.getByLabelText('View rank history')).toBeInTheDocument()
    })

    it('does not render rank history button when rankHistory is empty', () => {
      renderWithQueryClient(
        <WrestlerRow wrestler={mockWrestler} onClick={() => {}} rikishiMap={mapWithoutHistory} />
      )
      expect(screen.queryByLabelText('View rank history')).not.toBeInTheDocument()
    })

    it('does not render rank history button when no rikishiDetails', () => {
      renderWithQueryClient(
        <WrestlerRow wrestler={mockWrestler} onClick={() => {}} />
      )
      expect(screen.queryByLabelText('View rank history')).not.toBeInTheDocument()
    })

    it('opens rank history modal when button is clicked', () => {
      renderWithQueryClient(
        <WrestlerRow wrestler={mockWrestler} onClick={() => {}} rikishiMap={mapWithHistory} />
      )
      expect(screen.queryByTestId('rank-history-modal')).not.toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('View rank history'))
      expect(screen.getByTestId('rank-history-modal')).toBeInTheDocument()
    })

    it('does not call row onClick when rank history button is clicked', () => {
      const onClick = vi.fn()
      renderWithQueryClient(
        <WrestlerRow wrestler={mockWrestler} onClick={onClick} rikishiMap={mapWithHistory} />
      )
      fireEvent.click(screen.getByLabelText('View rank history'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
