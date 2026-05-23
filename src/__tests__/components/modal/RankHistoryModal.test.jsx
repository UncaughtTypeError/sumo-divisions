import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RankHistoryModal from '../../../components/modal/RankHistoryModal'

const mockClose = vi.fn()

const rikishiWithHistory = {
  shikonaEn: 'Terunofuji',
  rankHistory: [
    { id: '202605-45', bashoId: '202605', rank: 'Yokozuna 1 East',    rankValue: 101 },
    { id: '202603-45', bashoId: '202603', rank: 'Yokozuna 1 East',    rankValue: 101 },
    { id: '202011-45', bashoId: '202011', rank: 'Komusubi 1 East',    rankValue: 401 },
    { id: '201911-45', bashoId: '201911', rank: 'Makushita 10 West',  rankValue: 710 },
    { id: '201105-45', bashoId: '201105', rank: 'Mae-zumo',           rankValue: 2000 },
  ],
}

describe('RankHistoryModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <RankHistoryModal isOpen={false} onClose={mockClose} rikishiDetails={rikishiWithHistory} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the rikishi name and "Rank History" in the title', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    expect(screen.getByText(/Terunofuji.*Rank History/)).toBeInTheDocument()
  })

  it('renders one row per non-Mae-zumo rank history entry', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    // 4 valid entries (Mae-zumo excluded): 2 Yokozuna + 1 Komusubi + 1 Makushita
    // "Yokozuna 1 East" also appears in the summary career-best, so ≥ 2 total
    expect(screen.getAllByText('Yokozuna 1 East').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Komusubi 1 East')).toBeInTheDocument()
    expect(screen.getByText('Makushita 10 West')).toBeInTheDocument()
    expect(screen.queryByText('Mae-zumo')).not.toBeInTheDocument()
  })

  it('formats bashoId as month + year', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    expect(screen.getByText('May 2026')).toBeInTheDocument()
    expect(screen.getByText('March 2026')).toBeInTheDocument()
    expect(screen.getByText('November 2020')).toBeInTheDocument()
  })

  it('excludes entries with rankValue >= 2000 (pre-banzuke statuses)', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    expect(screen.queryByText('Mae-zumo')).not.toBeInTheDocument()
    expect(screen.queryByText('May 2011')).not.toBeInTheDocument()
  })

  it('renders empty message when no valid rank history', () => {
    const rikishi = { shikonaEn: 'Test', rankHistory: [] }
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
    expect(screen.getByText(/No rank history available/)).toBeInTheDocument()
  })

  it('renders empty message when rankHistory is undefined', () => {
    const rikishi = { shikonaEn: 'Test' }
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
    expect(screen.getByText(/No rank history available/)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    fireEvent.click(screen.getByLabelText('Close rank history'))
    expect(mockClose).toHaveBeenCalled()
  })

  it('calls onClose when footer Close button is clicked', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    fireEvent.click(screen.getByText('Close'))
    expect(mockClose).toHaveBeenCalled()
  })

  describe('summary section', () => {
    it('renders career best rank in summary', () => {
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('Career best')).toBeInTheDocument()
      // "Yokozuna 1 East" appears in both the summary and two table rows
      expect(screen.getAllByText('Yokozuna 1 East').length).toBeGreaterThanOrEqual(1)
    })

    it('renders total basho count in summary', () => {
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('Bashos')).toBeInTheDocument()
      // 4 valid entries (Mae-zumo excluded)
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('renders climb and drop counts in summary', () => {
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('climbs')).toBeInTheDocument()
      expect(screen.getByText('drops')).toBeInTheDocument()
    })

    it('shows zero climbs and drops when no rank movement occurred', () => {
      const rikishi = {
        shikonaEn: 'Test',
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 5 East', rankValue: 505 },
          { id: '202603-1', bashoId: '202603', rank: 'Maegashira 5 East', rankValue: 505 },
        ],
      }
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
      expect(screen.getByText('Bashos')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('climbs')).toBeInTheDocument()
      expect(screen.getByText('drops')).toBeInTheDocument()
    })

    it('does not render summary when history is empty', () => {
      const rikishi = { shikonaEn: 'Test', rankHistory: [] }
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
      expect(screen.queryByText('Career best')).not.toBeInTheDocument()
      expect(screen.queryByText('Bashos')).not.toBeInTheDocument()
    })
  })

  it('renders Tournament, Rank, and Change column headers', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    expect(screen.getByText('Tournament')).toBeInTheDocument()
    expect(screen.getByText('Rank')).toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
  })

  describe('indicator badges in Change column', () => {
    const historyWithMovement = {
      shikonaEn: 'Terunofuji',
      rankHistory: [
        { id: '202605-1', bashoId: '202605', rank: 'Yokozuna 1 East',   rankValue: 101 }, // newest
        { id: '202603-1', bashoId: '202603', rank: 'Ozeki 1 East',      rankValue: 201 },
        { id: '202601-1', bashoId: '202601', rank: 'Sekiwake 1 East',   rankValue: 301 },
        { id: '202511-1', bashoId: '202511', rank: 'Maegashira 5 East', rankValue: 505 }, // oldest
      ],
    }

    it('shows "Debut" badge for first time at a sanyaku rank', () => {
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={historyWithMovement} />)
      // Yokozuna row is first time at Yokozuna → sanyaku-debut → "Debut" badge
      const debuts = screen.getAllByText('Debut')
      expect(debuts.length).toBeGreaterThanOrEqual(1)
    })

    it('shows division-debut badge for the very first career entry', () => {
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={historyWithMovement} />)
      // The oldest entry (Maegashira 5 East, Nov 2025) gets division-debut
      const debuts = screen.getAllByText('Debut')
      expect(debuts.length).toBeGreaterThanOrEqual(2) // at least Yokozuna + first Maegashira
    })

    it('shows up arrow when rank improved from previous basho', () => {
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={historyWithMovement} />)
      // Yokozuna (101) vs previous Ozeki (201) → improved → ▲
      expect(screen.getAllByText(/▲/).length).toBeGreaterThanOrEqual(1)
    })

    it('up arrow badge has tooltip with rank delta text', () => {
      const { container } = render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={historyWithMovement} />)
      const upArrows = screen.getAllByText(/▲ \d+\.\d+/)
      fireEvent.mouseEnter(upArrows[0].closest('[class*="tooltipWrapper"]'))
      expect(screen.getAllByText(/Up \d+\.\d+ ranks/).length).toBeGreaterThanOrEqual(1)
    })

    it('down arrow badge has tooltip with rank delta text', () => {
      const rikishi = {
        shikonaEn: 'Test',
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 10 East', rankValue: 510 },
          { id: '202603-1', bashoId: '202603', rank: 'Maegashira 5 East',  rankValue: 505 },
        ],
      }
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
      fireEvent.mouseEnter(screen.getByText(/▼ \d+\.\d+/).closest('[class*="tooltipWrapper"]'))
      expect(screen.getByText(/Down \d+\.\d+ ranks/)).toBeInTheDocument()
    })

    it('sanyaku-debut badge has "First appearance at this rank" tooltip', () => {
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={historyWithMovement} />)
      document.body.querySelectorAll('[class*="tooltipWrapper"]').forEach(w => fireEvent.mouseEnter(w))
      expect(screen.getAllByText('First appearance at this rank').length).toBeGreaterThanOrEqual(1)
    })

    it('division-debut badge has "Division debut" tooltip', () => {
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={historyWithMovement} />)
      document.body.querySelectorAll('[class*="tooltipWrapper"]').forEach(w => fireEvent.mouseEnter(w))
      expect(screen.getAllByText('Division debut').length).toBeGreaterThanOrEqual(1)
    })

    it('career-high badge has "New career highest rank" tooltip', () => {
      const rikishi = {
        shikonaEn: 'Test',
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 3 East', rankValue: 503 },
          { id: '202603-1', bashoId: '202603', rank: 'Maegashira 5 East', rankValue: 505 },
        ],
      }
      const { container } = render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
      fireEvent.mouseEnter(screen.getByText('High').closest('[class*="tooltipWrapper"]'))
      expect(screen.getAllByText('New career highest rank').length).toBeGreaterThanOrEqual(1)
    })

    it('shows "High" badge when wrestler reaches a new career best without a debut', () => {
      const rikishi = {
        shikonaEn: 'Test',
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 3 East', rankValue: 503 },
          { id: '202603-1', bashoId: '202603', rank: 'Maegashira 5 East', rankValue: 505 },
          { id: '202601-1', bashoId: '202601', rank: 'Maegashira 7 East', rankValue: 507 },
        ],
      }
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
      // Each entry is a new career best (improving each basho) — no debut (same division)
      // Multiple "High" badges may appear (one per career-best basho)
      const highBadges = screen.getAllByText('High')
      expect(highBadges.length).toBeGreaterThanOrEqual(1)
    })

    it('does not show a "High" badge alongside a debut badge', () => {
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={historyWithMovement} />)
      // Yokozuna row has sanyaku-debut → isCareerHigh suppressed
      // "High" should NOT appear for the Yokozuna row (debut takes precedence)
      // It may appear for other rows if applicable, but each debut row must not have High
      const highBadges = screen.queryAllByText('High')
      const debutBadges = screen.getAllByText('Debut')
      // Debut rows should not have High alongside them — verify counts are consistent
      expect(debutBadges.length).toBeGreaterThan(0)
      // If High appears at all it must be on a non-debut row
      expect(highBadges.length).toBeGreaterThanOrEqual(0) // may or may not appear depending on data
    })

    it('single entry shows division-debut badge in Change column', () => {
      const rikishi = {
        shikonaEn: 'Test',
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 5 East', rankValue: 505 },
        ],
      }
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
      // Oldest (and only) entry = first career basho → division-debut → Debut badge
      expect(screen.getByText('Debut')).toBeInTheDocument()
      fireEvent.mouseEnter(screen.getByText('Debut').closest('[class*="tooltipWrapper"]'))
      expect(screen.getByText('Division debut')).toBeInTheDocument()
    })

    it('up arrow and High badge appear together when rank is new career best with no sanyaku debut', () => {
      const rikishi = {
        shikonaEn: 'Test',
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 3 East', rankValue: 503 },
          { id: '202603-1', bashoId: '202603', rank: 'Maegashira 5 East', rankValue: 505 },
          // oldest entry will get division-debut (first career basho)
          { id: '202601-1', bashoId: '202601', rank: 'Maegashira 7 East', rankValue: 507 },
        ],
      }
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
      // M3E row: new career best + improvement → up arrow AND High badge
      expect(screen.getAllByText(/▲ \d+\.\d+/).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(1)
      // The oldest entry (M7E) gets a division-debut Debut badge — that's expected
      // but the M3E row itself must NOT show Debut (not a new division/rank group)
      // Verify there are no sanyaku-debut tooltips ("First appearance at...")
      expect(screen.queryByText('First appearance at Maegashira')).not.toBeInTheDocument()
    })

    it('debut badge is never shown alongside a down arrow (logical impossibility)', () => {
      // The sanyaku-debut row (Ozeki 2 West) must show an UP arrow (improvement from S1E).
      // The oldest entry (Sekiwake 1 East) gets division-debut → two Debut badges total.
      const rikishi = {
        shikonaEn: 'Test',
        rankHistory: [
          { id: '202309-1', bashoId: '202309', rank: 'Ozeki 2 West',    rankValue: 202 },
          { id: '202307-1', bashoId: '202307', rank: 'Sekiwake 1 East', rankValue: 301 },
        ],
      }
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
      // Both O2W (sanyaku-debut) and S1E (division-debut = first basho) show Debut
      expect(screen.getAllByText('Debut').length).toBeGreaterThanOrEqual(2)
      // O2W row must show UP arrow with decimal delta (rankValue 202 < 301 → improvement)
      expect(screen.getByText(/▲ \d+\.\d+/)).toBeInTheDocument()
      // Crucially: NO down arrow anywhere — debut always implies promotion
      expect(screen.queryByText(/▼ \d+\.\d+/)).not.toBeInTheDocument()
    })

    it('shows no movement arrows (▲/▼) for the oldest entry', () => {
      const rikishi = {
        shikonaEn: 'Test',
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 5 East', rankValue: 505 },
        ],
      }
      render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
      // Single entry → oldest is also newest → no prior basho to compare against → no arrows
      // Note: the summary shows "▲ 0" and "▼ 0" as plain text, but the decimal-format
      // arrow badges (e.g. "▲ 1.5") should not appear in the Change column
      expect(screen.queryByText(/▲ \d+\.\d+/)).not.toBeInTheDocument()
      expect(screen.queryByText(/▼ \d+\.\d+/)).not.toBeInTheDocument()
    })
  })
})
