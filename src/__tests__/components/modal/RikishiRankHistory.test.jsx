import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RikishiRankHistory from '../../../components/modal/RikishiRankHistory'
import { useRikishiAllMatches } from '../../../hooks/useRikishi'
import { useCareerStats } from '../../../hooks/useCareerStats'

vi.mock('../../../hooks/useRikishi', () => ({
  useRikishiAllMatches: vi.fn(() => ({ data: null, isLoading: false })),
}))

vi.mock('../../../hooks/useCareerStats', () => ({
  useCareerStats: vi.fn(() => null),
}))

vi.mock('../../../utils/bashoId', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, getCurrentBashoId: vi.fn().mockReturnValue('202607') }
})

const rikishiWithHistory = {
  rankHistory: [
    { id: '202605-45', bashoId: '202605', rank: 'Yokozuna 1 East',   rankValue: 101 },
    { id: '202603-45', bashoId: '202603', rank: 'Yokozuna 1 East',   rankValue: 101 },
    { id: '202011-45', bashoId: '202011', rank: 'Komusubi 1 East',   rankValue: 401 },
    { id: '201911-45', bashoId: '201911', rank: 'Makushita 10 West', rankValue: 710 },
    { id: '201105-45', bashoId: '201105', rank: 'Mae-zumo',          rankValue: 2000 },
  ],
}

const emptyCareerStats = {
  yusho: 0, yushoByDivision: {}, yushoBashos: [],
  shukunsho: 0, shukunshoBashos: [],
  kantosho: 0, kantoshoBashos: [],
  ginosho: 0, ginoshoBashos: [],
  kinboshiWon: 0, kinboshiGiven: 0,
  totalWins: 0, totalLosses: 0, totalAbsences: 0,
  bashosByDivision: {},
}

describe('RikishiRankHistory', () => {
  afterEach(() => {
    useRikishiAllMatches.mockReturnValue({ data: null, isLoading: false })
    useCareerStats.mockReturnValue(null)
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
    // "Yokozuna 1 East" appears in summary bar (career highest rank) + 2 table rows
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
    it('renders bashos count', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('Bashos')).toBeInTheDocument()
    })

    it('shows correct basho count excluding Mae-zumo', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      // 4 valid entries (Mae-zumo excluded)
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('does not render summary when history is empty', () => {
      render(<RikishiRankHistory rikishiDetails={{ rankHistory: [] }} />)
      expect(screen.queryByText('Bashos')).not.toBeInTheDocument()
    })
  })

  describe('stats row', () => {
    it('shows career highest rank in the summary bar', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('Career highest rank')).toBeInTheDocument()
      // "Yokozuna 1 East" appears in summary bar + 2 table rows
      expect(screen.getAllByText('Yokozuna 1 East').length).toBeGreaterThanOrEqual(2)
    })

    it('shows climbs and drops in the stats row', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('climbs')).toBeInTheDocument()
      expect(screen.getByText('drops')).toBeInTheDocument()
    })

    it('shows career best record loading state while matches are fetching', () => {
      useRikishiAllMatches.mockReturnValue({ data: null, isLoading: true })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('Career best record')).toBeInTheDocument()
      // loading spinner for best record (in addition to per-row spinners)
      expect(screen.getAllByLabelText('Loading record').length).toBeGreaterThanOrEqual(1)
    })

    it('shows career best record with division when match data is available', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(11).fill({ bashoId: '202603', winnerId: 45, division: 'Makuuchi' }),
            ...Array(4).fill({ bashoId: '202603', winnerId: 99, division: 'Makuuchi' }),
            ...Array(10).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(5).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      expect(screen.getByText('Career best record')).toBeInTheDocument()
      // 11-4 is the best record (202603) — appears in stats row + table row
      expect(screen.getAllByText('11-4').length).toBeGreaterThanOrEqual(2)
      // division label appears after the record in the stats row
      expect(screen.getByText('· Makuuchi')).toBeInTheDocument()
    })

    it('shows best record including absences', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(10).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(2).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      // 10-2-3 (3 absences from 15 expected - 10 - 2) — appears in stats row + table row
      expect(screen.getAllByText('10-2-3').length).toBeGreaterThanOrEqual(2)
    })

    it('does not render stats row or summary when history is empty', () => {
      render(<RikishiRankHistory rikishiDetails={{ rankHistory: [] }} />)
      expect(screen.queryByText('Career highest rank')).not.toBeInTheDocument()
      expect(screen.queryByText('Career best record')).not.toBeInTheDocument()
      expect(screen.queryByText('climbs')).not.toBeInTheDocument()
      expect(screen.queryByText('drops')).not.toBeInTheDocument()
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
      // 11-4 is the best record — appears in stats row + table row
      expect(screen.getAllByText('11-4').length).toBeGreaterThanOrEqual(2)
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
      // 0-2-13 appears in stats row (best record) + table row
      expect(screen.getAllByText('0-2-13').length).toBeGreaterThanOrEqual(2)
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
      // 8-7 appears in stats row (best record) + table row
      expect(screen.getAllByText('8-7').length).toBeGreaterThanOrEqual(2)
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
      // 7-7-1 appears in stats row (best record) + table row
      expect(screen.getAllByText('7-7-1').length).toBeGreaterThanOrEqual(2)
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
      // 5-2 (no absences): appears in stats row (best record) + table row
      expect(screen.getAllByText('5-2').length).toBeGreaterThanOrEqual(2)
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

    it('shows no badge when wins equal total losses exactly', () => {
      const rikishiWithId = { id: 45, ...rikishiWithHistory }
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            // 8 wins + 8 losses = 16 bouts in a 15-bout basho → absences = max(0, 15-16) = 0
            // totalLosses = losses(8) + absences(0) = 8 = wins(8) → no badge
            ...Array(8).fill({ bashoId: '202605', winnerId: 45, division: 'Makuuchi' }),
            ...Array(8).fill({ bashoId: '202605', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithId} />)
      // 8-8 appears in stats row (best record) + table row
      expect(screen.getAllByText('8-8').length).toBeGreaterThanOrEqual(2)
      expect(screen.queryByText('KK')).not.toBeInTheDocument()
      expect(screen.queryByText('MK')).not.toBeInTheDocument()
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
      // 1-0-14: appears in stats row (best record) + table row
      expect(screen.getAllByText('1-0-14').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('ongoing current basho', () => {
    const currentRikishi = {
      id: 45,
      rankHistory: [
        { id: '202607-45', bashoId: '202607', rank: 'Maegashira 1 East', rankValue: 501 },
      ],
    }

    it('does not count unplayed bouts as absences for the current basho', () => {
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(5).fill({ bashoId: '202607', winnerId: 45, division: 'Makuuchi' }),
            ...Array(3).fill({ bashoId: '202607', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={currentRikishi} />)
      // 5-3 appears in stats row (best record) + table row
      expect(screen.getAllByText('5-3').length).toBeGreaterThanOrEqual(2)
    })

    it('does not show MK badge when unplayed current-basho bouts would artificially push losses past wins', () => {
      // 3W–3L with 9 bouts remaining: without fix absences=9 → totalLosses=12 → MK; with fix absences=0 → tied → no badge
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(3).fill({ bashoId: '202607', winnerId: 45, division: 'Makuuchi' }),
            ...Array(3).fill({ bashoId: '202607', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={currentRikishi} />)
      // 3-3 appears in stats row (best record) + table row
      expect(screen.getAllByText('3-3').length).toBeGreaterThanOrEqual(2)
      expect(screen.queryByText('MK')).not.toBeInTheDocument()
    })

    it('does not show KK badge for a 6-1 record before the 8-win threshold is reached', () => {
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(6).fill({ bashoId: '202607', winnerId: 45, division: 'Makuuchi' }),
            ...Array(1).fill({ bashoId: '202607', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={currentRikishi} />)
      // 6-1 appears in stats row (best record) + table row
      expect(screen.getAllByText('6-1').length).toBeGreaterThanOrEqual(2)
      expect(screen.queryByText('KK')).not.toBeInTheDocument()
    })

    it('does not show MK badge for a 2-5 record before the 8-loss threshold is reached', () => {
      useRikishiAllMatches.mockReturnValue({
        data: {
          records: [
            ...Array(2).fill({ bashoId: '202607', winnerId: 45, division: 'Makuuchi' }),
            ...Array(5).fill({ bashoId: '202607', winnerId: 99, division: 'Makuuchi' }),
          ],
        },
        isLoading: false,
      })
      render(<RikishiRankHistory rikishiDetails={currentRikishi} />)
      // 2-5 appears in stats row (best record) + table row
      expect(screen.getAllByText('2-5').length).toBeGreaterThanOrEqual(2)
      expect(screen.queryByText('MK')).not.toBeInTheDocument()
    })
  })

  describe('award badges (yusho and sansho)', () => {
    it('shows no award badges when career stats are unavailable', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.queryByText('🏆Y')).not.toBeInTheDocument()
      expect(screen.queryByText('S')).not.toBeInTheDocument()
      expect(screen.queryByText('K')).not.toBeInTheDocument()
      expect(screen.queryByText('G')).not.toBeInTheDocument()
    })

    it('shows no award badges when career stats exist but no matching bashos', () => {
      useCareerStats.mockReturnValue(emptyCareerStats)
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.queryByText('🏆Y')).not.toBeInTheDocument()
    })

    it('shows Y badge on the row matching a yusho basho', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, yusho: 1, yushoBashos: ['202605'] })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('🏆Y')).toBeInTheDocument()
    })

    it('does not show Y badge on non-yusho rows', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, yusho: 1, yushoBashos: ['202605'] })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      // Only one row badge even though there are multiple rows
      expect(screen.getAllByText('🏆Y')).toHaveLength(1)
    })

    it('Y badge shows Yusho tooltip on hover', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, yusho: 1, yushoBashos: ['202605'] })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      fireEvent.mouseEnter(screen.getByText('🏆Y').closest('[class*="tooltipWrapper"]'))
      expect(screen.getByText('Yusho')).toBeInTheDocument()
      expect(screen.getByText('Tournament Champion')).toBeInTheDocument()
    })

    it('shows S badge for a shukunsho basho', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, shukunsho: 1, shukunshoBashos: ['202603'] })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('S')).toBeInTheDocument()
    })

    it('shows K badge for a kantosho basho', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, kantosho: 1, kantoshoBashos: ['202603'] })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('K')).toBeInTheDocument()
    })

    it('shows G badge for a ginosho basho', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, ginosho: 1, ginoshoBashos: ['202603'] })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('G')).toBeInTheDocument()
    })

    it('shows multiple award badges on the same row when wrestler won yusho and a sansho in the same basho', () => {
      useCareerStats.mockReturnValue({
        ...emptyCareerStats,
        yusho: 1, yushoBashos: ['202605'],
        shukunsho: 1, shukunshoBashos: ['202605'],
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('🏆Y')).toBeInTheDocument()
      expect(screen.getByText('S')).toBeInTheDocument()
    })

    it('shows Y count badge in summary bar when yusho total > 0', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, yusho: 4, yushoBashos: [] })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('🏆Y 4')).toBeInTheDocument()
    })

    it('shows sansho count badges in summary bar', () => {
      useCareerStats.mockReturnValue({
        ...emptyCareerStats,
        shukunsho: 3, shukunshoBashos: [],
        kantosho: 2, kantoshoBashos: [],
        ginosho: 1, ginoshoBashos: [],
      })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('S 3')).toBeInTheDocument()
      expect(screen.getByText('K 2')).toBeInTheDocument()
      expect(screen.getByText('G 1')).toBeInTheDocument()
    })

    it('omits summary count badges when counts are zero', () => {
      useCareerStats.mockReturnValue(emptyCareerStats)
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.queryByText(/🏆Y \d/)).not.toBeInTheDocument()
      expect(screen.queryByText(/^S \d/)).not.toBeInTheDocument()
      expect(screen.queryByText(/^K \d/)).not.toBeInTheDocument()
      expect(screen.queryByText(/^G \d/)).not.toBeInTheDocument()
    })

    it('omits all summary award badges when career stats are unavailable', () => {
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.queryByText(/🏆Y \d/)).not.toBeInTheDocument()
    })

    it('shows kinboshi won badge in summary bar when kinboshiWon > 0', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, kinboshiWon: 12 })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('★12')).toBeInTheDocument()
    })

    it('shows kinboshi given badge in summary bar when kinboshiGiven > 0', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, kinboshiGiven: 5 })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('★5')).toBeInTheDocument()
    })

    it('shows both kinboshi won and given badges when wrestler has both', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, kinboshiWon: 8, kinboshiGiven: 3 })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.getByText('★8')).toBeInTheDocument()
      expect(screen.getByText('★3')).toBeInTheDocument()
    })

    it('omits kinboshi badges when counts are zero', () => {
      useCareerStats.mockReturnValue(emptyCareerStats)
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      expect(screen.queryByText(/★\d/)).not.toBeInTheDocument()
    })

    it('kinboshi won badge shows correct tooltip on hover', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, kinboshiWon: 4 })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      fireEvent.mouseEnter(screen.getByText('★4').closest('[class*="tooltipWrapper"]'))
      expect(screen.getByText('Kinboshi')).toBeInTheDocument()
      expect(screen.getByText('Gold star for defeating a Yokozuna')).toBeInTheDocument()
    })

    it('kinboshi given badge shows correct tooltip on hover', () => {
      useCareerStats.mockReturnValue({ ...emptyCareerStats, kinboshiGiven: 6 })
      render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
      fireEvent.mouseEnter(screen.getByText('★6').closest('[class*="tooltipWrapper"]'))
      expect(screen.getByText('Kinboshi Given')).toBeInTheDocument()
      expect(screen.getByText('Gold star given to Maegashira opponent')).toBeInTheDocument()
    })
  })
})
