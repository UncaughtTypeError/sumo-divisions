import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RikishiRankHistory from '../../../components/modal/RikishiRankHistory'
import { useRikishiAllMatches } from '../../../hooks/useRikishi'

vi.mock('../../../hooks/useRikishi', () => ({
  useRikishiAllMatches: vi.fn(() => ({ data: null, isLoading: false })),
}))

const rikishiWithHistory = {
  rankHistory: [
    { id: '202605-45', bashoId: '202605', rank: 'Yokozuna 1 East',   rankValue: 101 },
    { id: '202603-45', bashoId: '202603', rank: 'Yokozuna 1 East',   rankValue: 101 },
    { id: '202011-45', bashoId: '202011', rank: 'Komusubi 1 East',   rankValue: 401 },
    { id: '201911-45', bashoId: '201911', rank: 'Makushita 10 West', rankValue: 710 },
    { id: '201105-45', bashoId: '201105', rank: 'Mae-zumo',          rankValue: 2000 },
  ],
}

describe('RikishiRankHistory', () => {
  afterEach(() => {
    useRikishiAllMatches.mockReturnValue({ data: null, isLoading: false })
  })
  it('renders empty message when rankHistory is empty', () => {
    render(<RikishiRankHistory rikishiDetails={{ rankHistory: [] }} />)
    expect(screen.getByText(/No rank history available/)).toBeInTheDocument()
  })

  it('renders empty message when rankHistory is undefined', () => {
    render(<RikishiRankHistory rikishiDetails={{}} />)
    expect(screen.getByText(/No rank history available/)).toBeInTheDocument()
  })

  it('renders Tournament, Rank, Record, and Change column headers', () => {
    render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
    expect(screen.getByText('Tournament')).toBeInTheDocument()
    expect(screen.getByText('Rank')).toBeInTheDocument()
    expect(screen.getByText('Record')).toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
  })

  it('renders one row per non-Mae-zumo entry', () => {
    render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
    // "Yokozuna 1 East" appears in summary (career best) + 2 table rows
    expect(screen.getAllByText('Yokozuna 1 East').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Komusubi 1 East')).toBeInTheDocument()
    expect(screen.getByText('Makushita 10 West')).toBeInTheDocument()
    expect(screen.queryByText('Mae-zumo')).not.toBeInTheDocument()
  })

  it('excludes entries with rankValue >= 2000', () => {
    render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
    expect(screen.queryByText('Mae-zumo')).not.toBeInTheDocument()
    expect(screen.queryByText('May 2011')).not.toBeInTheDocument()
  })

  it('formats bashoId as month + year + nickname', () => {
    render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
    expect(screen.getByText('May 2026 · Natsu')).toBeInTheDocument()
    expect(screen.getByText('March 2026 · Haru')).toBeInTheDocument()
    expect(screen.getByText('November 2020 · Kyushu')).toBeInTheDocument()
  })

  describe('summary bar', () => {
    it('renders career best, bashos, climbs and drops', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('Career best')).toBeInTheDocument()
      expect(screen.getByText('Bashos')).toBeInTheDocument()
      expect(screen.getByText('climbs')).toBeInTheDocument()
      expect(screen.getByText('drops')).toBeInTheDocument()
    })

    it('shows correct basho count excluding Mae-zumo', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      // 4 valid entries (Mae-zumo excluded)
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('does not render summary when history is empty', () => {
      render(<RikishiRankHistory rikishiDetails={{ rankHistory: [] }} />)
      expect(screen.queryByText('Career best')).not.toBeInTheDocument()
      expect(screen.queryByText('Bashos')).not.toBeInTheDocument()
    })
  })

  describe('change column indicators', () => {
    const historyWithMovement = {
      rankHistory: [
        { id: '202605-1', bashoId: '202605', rank: 'Yokozuna 1 East',   rankValue: 101 },
        { id: '202603-1', bashoId: '202603', rank: 'Ozeki 1 East',      rankValue: 201 },
        { id: '202601-1', bashoId: '202601', rank: 'Sekiwake 1 East',   rankValue: 301 },
        { id: '202511-1', bashoId: '202511', rank: 'Maegashira 5 East', rankValue: 505 },
      ],
    }

    it('shows up arrow when rank improved from previous basho', () => {
      render(<RikishiRankHistory rikishiDetails={historyWithMovement} />)
      expect(screen.getAllByText(/▲/).length).toBeGreaterThanOrEqual(1)
    })

    it('shows down arrow when rank dropped from previous basho', () => {
      const rikishi = {
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 10 East', rankValue: 510 },
          { id: '202603-1', bashoId: '202603', rank: 'Maegashira 5 East',  rankValue: 505 },
        ],
      }
      render(<RikishiRankHistory rikishiDetails={rikishi} />)
      expect(screen.getByText(/▼ \d+\.\d+/)).toBeInTheDocument()
    })

    it('shows Debut badge for sanyaku debut', () => {
      render(<RikishiRankHistory rikishiDetails={historyWithMovement} />)
      expect(screen.getAllByText('Debut').length).toBeGreaterThanOrEqual(1)
    })

    it('shows Debut badge for first career entry (division debut)', () => {
      render(<RikishiRankHistory rikishiDetails={historyWithMovement} />)
      // oldest entry (Maegashira 5 East) + Yokozuna (sanyaku debut) → at least 2 Debut badges
      expect(screen.getAllByText('Debut').length).toBeGreaterThanOrEqual(2)
    })

    it('shows High badge when wrestler reaches new career best', () => {
      const rikishi = {
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 3 East', rankValue: 503 },
          { id: '202603-1', bashoId: '202603', rank: 'Maegashira 5 East', rankValue: 505 },
          { id: '202601-1', bashoId: '202601', rank: 'Maegashira 7 East', rankValue: 507 },
        ],
      }
      render(<RikishiRankHistory rikishiDetails={rikishi} />)
      expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(1)
    })

    it('shows no movement arrows for the oldest (first career) entry', () => {
      const rikishi = {
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 5 East', rankValue: 505 },
        ],
      }
      render(<RikishiRankHistory rikishiDetails={rikishi} />)
      expect(screen.queryByText(/▲ \d+\.\d+/)).not.toBeInTheDocument()
      expect(screen.queryByText(/▼ \d+\.\d+/)).not.toBeInTheDocument()
    })

    it('up arrow badge shows correct delta tooltip on hover', () => {
      render(<RikishiRankHistory rikishiDetails={historyWithMovement} />)
      const upArrows = screen.getAllByText(/▲ \d+\.\d+/)
      fireEvent.mouseEnter(upArrows[0].closest('[class*="tooltipWrapper"]'))
      expect(screen.getAllByText(/Up \d+\.\d+ ranks/).length).toBeGreaterThanOrEqual(1)
    })

    it('down arrow badge shows correct delta tooltip on hover', () => {
      const rikishi = {
        rankHistory: [
          { id: '202605-1', bashoId: '202605', rank: 'Maegashira 10 East', rankValue: 510 },
          { id: '202603-1', bashoId: '202603', rank: 'Maegashira 5 East',  rankValue: 505 },
        ],
      }
      render(<RikishiRankHistory rikishiDetails={rikishi} />)
      fireEvent.mouseEnter(screen.getByText(/▼ \d+\.\d+/).closest('[class*="tooltipWrapper"]'))
      expect(screen.getByText(/Down \d+\.\d+ ranks/)).toBeInTheDocument()
    })

    it('debut badge is never shown alongside a down arrow', () => {
      const rikishi = {
        rankHistory: [
          { id: '202309-1', bashoId: '202309', rank: 'Ozeki 2 West',    rankValue: 202 },
          { id: '202307-1', bashoId: '202307', rank: 'Sekiwake 1 East', rankValue: 301 },
        ],
      }
      render(<RikishiRankHistory rikishiDetails={rikishi} />)
      expect(screen.getAllByText('Debut').length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText(/▲ \d+\.\d+/)).toBeInTheDocument()
      expect(screen.queryByText(/▼ \d+\.\d+/)).not.toBeInTheDocument()
    })
  })

  describe('Record column', () => {
    it('shows loading placeholder for all rows while matches are fetching', () => {
      useRikishiAllMatches.mockReturnValue({ data: null, isLoading: true })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      const placeholders = screen.getAllByLabelText('Loading record')
      expect(placeholders.length).toBeGreaterThanOrEqual(4)
    })

    it('shows "—" for all rows when fetch completes with no data', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThanOrEqual(4)
    })

    it('shows win-loss record when match data is available', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(10).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(5).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
            ...Array(11).fill({ bashoId: '202603', winnerId: 45, division: 'Makuuchi' }),
            ...Array(4).fill({ bashoId: '202603', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      expect(screen.getByText('10-5')).toBeInTheDocument()
      expect(screen.getByText('11-4')).toBeInTheDocument()
    })

    it('includes absences in record when wrestler had kyujo days', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            // Only 2 bouts fought out of 15 → 13 absences
            { bashoId: '202605', winnerId: 99, division: 'Makuuchi' },
            { bashoId: '202605', winnerId: 99, division: 'Makuuchi' },
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      expect(screen.getByText('0-2-13')).toBeInTheDocument()
    })

    it('omits absence suffix when no absences', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(8).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(7).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      expect(screen.getByText('8-7')).toBeInTheDocument()
    })

    it('shows KK badge when wins exceed losses', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(10).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(5).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      expect(screen.getByText('KK')).toBeInTheDocument()
    })

    it('shows MK badge when losses exceed wins', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(5).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(10).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      expect(screen.getByText('MK')).toBeInTheDocument()
    })

    it('shows no badge when no match data', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.queryByText('KK')).not.toBeInTheDocument()
      expect(screen.queryByText('MK')).not.toBeInTheDocument()
    })

    it('shows MK badge for 7-7-1 in Makuuchi because absences count toward make-koshi', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(7).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(7).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      expect(screen.getByText('7-7-1')).toBeInTheDocument()
      expect(screen.getByText('MK')).toBeInTheDocument()
      expect(screen.queryByText('KK')).not.toBeInTheDocument()
    })

    it('uses 7 expected bouts for lower divisions', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(5).fill({ bashoId: '201911', winnerId: 45, division: 'Makushita' }),
            ...Array(2).fill({ bashoId: '201911', winnerId: 99, division: 'Makushita' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      // 5 + 2 = 7 bouts, 7 expected → 0 absences
      expect(screen.getByText('5-2')).toBeInTheDocument()
    })

    it('KK badge shows Kachi-koshi tooltip on hover', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(10).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(5).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      fireEvent.mouseEnter(screen.getByText('KK').closest('[class*="tooltipWrapper"]'))
      expect(screen.getByText('Kachi-koshi')).toBeInTheDocument()
      expect(screen.getByText('Winning Record')).toBeInTheDocument()
    })

    it('MK badge shows Make-koshi tooltip on hover', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(5).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(10).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      fireEvent.mouseEnter(screen.getByText('MK').closest('[class*="tooltipWrapper"]'))
      expect(screen.getByText('Make-koshi')).toBeInTheDocument()
      expect(screen.getByText('Losing Record')).toBeInTheDocument()
    })

    it('still shows "—" for bashos with no match data', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [{ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      // 1 win in a 15-bout basho → 14 absences
      expect(screen.getByText('1-0-14')).toBeInTheDocument()
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
    })
  })
})
