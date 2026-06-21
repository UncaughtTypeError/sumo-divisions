import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RikishiRankHistory from '../../../components/modal/RikishiRankHistory'

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
  it('renders empty message when rankHistory is empty', () => {
    render(<RikishiRankHistory rikishiDetails={{ rankHistory: [] }} />)
    expect(screen.getByText(/No rank history available/)).toBeInTheDocument()
  })

  it('renders empty message when rankHistory is undefined', () => {
    render(<RikishiRankHistory rikishiDetails={{}} />)
    expect(screen.getByText(/No rank history available/)).toBeInTheDocument()
  })

  it('renders Tournament, Rank, and Change column headers', () => {
    render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
    expect(screen.getByText('Tournament')).toBeInTheDocument()
    expect(screen.getByText('Rank')).toBeInTheDocument()
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

  it('formats bashoId as month + year', () => {
    render(<RikishiRankHistory rikishiDetails={rikishiWithHistory} />)
    expect(screen.getByText('May 2026')).toBeInTheDocument()
    expect(screen.getByText('March 2026')).toBeInTheDocument()
    expect(screen.getByText('November 2020')).toBeInTheDocument()
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
})
