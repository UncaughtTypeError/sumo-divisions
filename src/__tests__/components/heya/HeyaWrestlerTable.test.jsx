import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HeyaWrestlerTable from '../../../components/heya/HeyaWrestlerTable'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeWrestler = (id, rank, rankValue, wins, losses, absences = 0, overrides = {}) => ({
  rikishiID: id,
  shikonaEn: `Wrestler${id}`,
  rank,
  rankValue,
  wins,
  losses,
  absences,
  record: [],
  awards: [],
  ...overrides,
})

const defaultProps = {
  wrestlers: [],
  sortOrder: 'rank-asc',
  onWrestlerClick: vi.fn(),
  rikishiMap: new Map(),
}

describe('HeyaWrestlerTable', () => {
  describe('empty state', () => {
    it('renders a message when there are no wrestlers', () => {
      render(<HeyaWrestlerTable {...defaultProps} />)
      expect(screen.getByText('No rikishi found')).toBeInTheDocument()
    })
  })

  describe('rows', () => {
    it('renders one row per wrestler (not paired by side)', () => {
      const wrestlers = [
        makeWrestler(1, 'Yokozuna 1 East', 1, 10, 5),
        makeWrestler(2, 'Maegashira 3 West', 50, 6, 9),
      ]
      const { container } = render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('Wrestler1')).toBeInTheDocument()
      expect(screen.getByText('Wrestler2')).toBeInTheDocument()
      expect(container.querySelectorAll('tbody tr[class*="row"]')).toHaveLength(2)
    })

    it('renders the table header for rank, wrestler, record, and status', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 10, 5)]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      const headers = screen.getAllByRole('columnheader').map((th) => th.textContent)
      expect(headers).toEqual(['Rank', 'Wrestler', 'Record', 'Status'])
    })

    it('shows an East/West designation on the rank badge', () => {
      const wrestlers = [
        makeWrestler(1, 'Maegashira 3 East', 50, 10, 5),
        makeWrestler(2, 'Maegashira 4 West', 52, 10, 5),
      ]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('E')).toBeInTheDocument()
      expect(screen.getByText('W')).toBeInTheDocument()
    })

    it('shows the win-loss-absence record', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 10, 5, 0)]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('10-5-0')).toBeInTheDocument()
    })

    it('shows the country flag and code from rikishiMap', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 10, 5)]
      const rikishiMap = new Map([[1, { heya: 'Isegahama', shusshin: 'Mongolia' }]])
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} rikishiMap={rikishiMap} />)
      expect(screen.getByText('MGL')).toBeInTheDocument()
    })
  })

  describe('record status (KK/MK)', () => {
    it('shows a KK badge for a kachi-koshi record', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 8, 4)] // Makuuchi: 8 wins clinches KK
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('KK')).toBeInTheDocument()
    })

    it('shows an MK badge for a make-koshi record', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 3, 8)]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('MK')).toBeInTheDocument()
    })

    it('resolves the kk/mk threshold per wrestler division (lower divisions: 4 of 7)', () => {
      const wrestlers = [makeWrestler(1, 'Makushita 5 East', 300, 4, 2)] // 4 wins clinches KK at Makushita
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('KK')).toBeInTheDocument()
    })

    it('shows no badge for an undecided record', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 5, 4)]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.queryByText('KK')).not.toBeInTheDocument()
      expect(screen.queryByText('MK')).not.toBeInTheDocument()
    })
  })

  describe('winning/losing divider', () => {
    it('places a divider between winning and losing groups, both present', () => {
      const wrestlers = [
        makeWrestler(1, 'Yokozuna 1 East', 1, 10, 5),
        makeWrestler(2, 'Ozeki 1 East', 10, 3, 12),
      ]
      const { container } = render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(container.querySelector('[class*="dividerRow"]')).toBeInTheDocument()
      expect(container.querySelector('[class*="dividerLabel"]').textContent).toContain('1 winning')
      expect(container.querySelector('[class*="dividerLabel"]').textContent).toContain('1 losing')
    })

    it('omits the divider when every wrestler has a winning record', () => {
      const wrestlers = [
        makeWrestler(1, 'Yokozuna 1 East', 1, 10, 5),
        makeWrestler(2, 'Ozeki 1 East', 10, 9, 4),
      ]
      const { container } = render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(container.querySelector('[class*="dividerRow"]')).not.toBeInTheDocument()
    })

    it('omits the divider when every wrestler has a losing record', () => {
      const wrestlers = [
        makeWrestler(1, 'Yokozuna 1 East', 1, 3, 12),
        makeWrestler(2, 'Ozeki 1 East', 10, 2, 13),
      ]
      const { container } = render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(container.querySelector('[class*="dividerRow"]')).not.toBeInTheDocument()
    })

    it('keeps the winning group above the divider and the losing group below, under rank-desc sort', () => {
      const wrestlers = [
        makeWrestler(1, 'Yokozuna 1 East', 1, 10, 5),   // winning, rank 1 (best)
        makeWrestler(2, 'Ozeki 1 East', 10, 3, 12),      // losing, rank 10
        makeWrestler(3, 'Sekiwake 1 East', 20, 12, 3),   // winning, rank 20
      ]
      const { container } = render(
        <HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} sortOrder="rank-desc" />
      )
      const rowTexts = [...container.querySelectorAll('tbody tr')].map((tr) => tr.textContent)
      // Winning group (rank-desc within group: Wrestler3 then Wrestler1), divider, then losing group (Wrestler2)
      const wrestler3Index = rowTexts.findIndex((t) => t.includes('Wrestler3'))
      const wrestler1Index = rowTexts.findIndex((t) => t.includes('Wrestler1'))
      const dividerIndex = rowTexts.findIndex((t) => t.includes('winning'))
      const wrestler2Index = rowTexts.findIndex((t) => t.includes('Wrestler2'))
      expect(wrestler3Index).toBeLessThan(wrestler1Index)
      expect(wrestler1Index).toBeLessThan(dividerIndex)
      expect(dividerIndex).toBeLessThan(wrestler2Index)
    })

    it('keeps the winning group above the divider and the losing group below, under wins-asc sort', () => {
      const wrestlers = [
        makeWrestler(1, 'Yokozuna 1 East', 1, 8, 7),    // winning (KK at 8)
        makeWrestler(2, 'Ozeki 1 East', 10, 2, 13),      // losing
        makeWrestler(3, 'Sekiwake 1 East', 20, 12, 3),   // winning
      ]
      const { container } = render(
        <HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} sortOrder="wins-asc" />
      )
      const rowTexts = [...container.querySelectorAll('tbody tr')].map((tr) => tr.textContent)
      const dividerIndex = rowTexts.findIndex((t) => t.includes('winning'))
      const wrestler2Index = rowTexts.findIndex((t) => t.includes('Wrestler2'))
      const wrestler1Index = rowTexts.findIndex((t) => t.includes('Wrestler1'))
      const wrestler3Index = rowTexts.findIndex((t) => t.includes('Wrestler3'))
      // Losing group (Wrestler2) must stay below the divider even though
      // wins-asc would otherwise put its low win count first overall.
      expect(wrestler1Index).toBeLessThan(dividerIndex)
      expect(wrestler3Index).toBeLessThan(dividerIndex)
      expect(dividerIndex).toBeLessThan(wrestler2Index)
    })
  })

  describe('badges', () => {
    it('shows a kyujo badge', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 5, 4, 0, { isKyujo: true })]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('Kyujo')).toBeInTheDocument()
    })

    it('shows a rank movement arrow with delta', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 5, 4, 0, { rankMovement: 'up', rankDelta: 2 })]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('▲ 2.0')).toBeInTheDocument()
    })

    it('shows a debut badge', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 5, 4, 0, { debutType: 'division-debut' })]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('Debut')).toBeInTheDocument()
    })

    it('shows a career-high badge', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 5, 4, 0, { isCareerHigh: true })]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('shows an award badge', () => {
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 5, 4, 0, { awards: ['yusho'] })]
      const { container } = render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} />)
      expect(container.querySelector('[class*="yusho"]')).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('calls onWrestlerClick with the wrestler when a name is clicked', async () => {
      const user = userEvent.setup()
      const onWrestlerClick = vi.fn()
      const wrestlers = [makeWrestler(1, 'Yokozuna 1 East', 1, 10, 5)]
      render(<HeyaWrestlerTable {...defaultProps} wrestlers={wrestlers} onWrestlerClick={onWrestlerClick} />)
      await user.click(screen.getByText('Wrestler1'))
      expect(onWrestlerClick).toHaveBeenCalledWith(
        expect.objectContaining({ rikishiID: 1, shikonaEn: 'Wrestler1' })
      )
    })
  })
})
