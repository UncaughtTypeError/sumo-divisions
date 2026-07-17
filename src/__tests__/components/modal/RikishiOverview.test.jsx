import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import RikishiOverview from '../../../components/modal/RikishiOverview'

vi.mock('../../../hooks/useCareerStats', () => ({
  useCareerStats: vi.fn(() => null),
}))

import { useCareerStats } from '../../../hooks/useCareerStats'

describe('RikishiOverview', () => {
  const mockDetails = {
    id: 45,
    heya: 'Isegahama',
    shusshin: 'Mongolia, Ulaanbaatar',
    height: 192,
    weight: 167,
    birthDate: '1991-11-29',
    debut: '201303',
    rankHistory: [
      { bashoId: '202605', rank: 'Yokozuna 1 East', rankValue: 101 },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useCareerStats.mockReturnValue(null)
  })

  it('returns null when rikishiDetails is not provided', () => {
    const { container } = render(<RikishiOverview rikishiDetails={null} />)
    expect(container.firstChild).toBeNull()
  })

  describe('Details section', () => {
    it('renders the Details section header', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('renders heya label and value', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Heya')).toBeInTheDocument()
      expect(screen.getByText('Isegahama')).toBeInTheDocument()
    })

    it('renders height with cm unit', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Height')).toBeInTheDocument()
      expect(screen.getByText('192 cm')).toBeInTheDocument()
    })

    it('renders weight with kg unit', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Weight')).toBeInTheDocument()
      expect(screen.getByText('167 kg')).toBeInTheDocument()
    })

    it('renders formatted debut date', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Debut')).toBeInTheDocument()
      expect(screen.getByText('March 2013')).toBeInTheDocument()
    })

    it('renders career high derived from rankHistory', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Career High')).toBeInTheDocument()
      expect(screen.getByText('Yokozuna 1 East')).toBeInTheDocument()
    })

    it('does not render Career High when rankHistory is empty', () => {
      render(<RikishiOverview rikishiDetails={{ ...mockDetails, rankHistory: [] }} />)
      expect(screen.queryByText('Career High')).not.toBeInTheDocument()
    })

    it('excludes Mae-zumo entries (rankValue >= 2000) from career high calculation', () => {
      const details = {
        ...mockDetails,
        rankHistory: [
          { bashoId: '202605', rank: 'Maegashira 5 East', rankValue: 505 },
          { bashoId: '201105', rank: 'Mae-zumo', rankValue: 2000 },
        ],
      }
      render(<RikishiOverview rikishiDetails={details} />)
      expect(screen.getByText('Maegashira 5 East')).toBeInTheDocument()
      expect(screen.queryByText('Mae-zumo')).not.toBeInTheDocument()
    })

    it('does not render Retired row when intai is not set', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.queryByText('Retired')).not.toBeInTheDocument()
    })

    it('renders formatted retirement date when intai is set', () => {
      render(<RikishiOverview rikishiDetails={{ ...mockDetails, intai: '2025-01-15' }} />)
      expect(screen.getByText('Retired')).toBeInTheDocument()
      expect(screen.getByText('January 15, 2025')).toBeInTheDocument()
    })
  })

  describe('value colour classes', () => {
    const statsBase = {
      totalWins: 50,
      totalLosses: 30,
      totalAbsences: 0,
      yushoByDivision: {},
      bashosByDivision: {},
      shukunsho: 0,
      kantosho: 0,
      ginosho: 0,
    }

    it('applies statAbsences class to the absences value', () => {
      useCareerStats.mockReturnValue({ ...statsBase, totalAbsences: 10 })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('10').className).toMatch(/statAbsences/)
    })

    it('applies yushoWon class when a division has yusho wins', () => {
      useCareerStats.mockReturnValue({ ...statsBase, yushoByDivision: { Makuuchi: 3 } })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('3').className).toMatch(/yushoWon/)
    })

    it('applies yushoZero class when a division has no yusho wins', () => {
      useCareerStats.mockReturnValue({ ...statsBase })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(document.querySelector('[class*="yushoZero"]')).toBeInTheDocument()
    })

    it('applies prizeWon class to a special prize value greater than zero', () => {
      useCareerStats.mockReturnValue({ ...statsBase, shukunsho: 2 })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('2').className).toMatch(/prizeWon/)
    })

    it('applies prizeZero class to a special prize value of zero', () => {
      useCareerStats.mockReturnValue({ ...statsBase })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(document.querySelector('[class*="prizeZero"]')).toBeInTheDocument()
    })
  })

  describe('Career section', () => {
    it('does not render Career section when careerStats is null', () => {
      useCareerStats.mockReturnValue(null)
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.queryByText('Career')).not.toBeInTheDocument()
    })

    it('renders Career section header when careerStats are available', () => {
      useCareerStats.mockReturnValue({
        totalWins: 100,
        totalLosses: 50,
        totalAbsences: 0,
        yushoByDivision: {},
        bashosByDivision: {},
        shukunsho: 0,
        kantosho: 0,
        ginosho: 0,
      })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Career')).toBeInTheDocument()
    })

    it('renders win and loss totals', () => {
      useCareerStats.mockReturnValue({
        totalWins: 100,
        totalLosses: 50,
        totalAbsences: 0,
        yushoByDivision: {},
        bashosByDivision: {},
        shukunsho: 0,
        kantosho: 0,
        ginosho: 0,
      })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('Wins')).toBeInTheDocument()
      expect(screen.getByText('Losses')).toBeInTheDocument()
    })

    it('renders absences when totalAbsences > 0', () => {
      useCareerStats.mockReturnValue({
        totalWins: 50,
        totalLosses: 30,
        totalAbsences: 10,
        yushoByDivision: {},
        bashosByDivision: {},
        shukunsho: 0,
        kantosho: 0,
        ginosho: 0,
      })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Absences')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('does not render Absences when totalAbsences is 0', () => {
      useCareerStats.mockReturnValue({
        totalWins: 50,
        totalLosses: 30,
        totalAbsences: 0,
        yushoByDivision: {},
        bashosByDivision: {},
        shukunsho: 0,
        kantosho: 0,
        ginosho: 0,
      })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.queryByText('Absences')).not.toBeInTheDocument()
    })

    it('renders Yusho and Special Prizes sub-headers', () => {
      useCareerStats.mockReturnValue({
        totalWins: 50,
        totalLosses: 30,
        totalAbsences: 0,
        yushoByDivision: {},
        bashosByDivision: {},
        shukunsho: 0,
        kantosho: 0,
        ginosho: 0,
      })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Yusho')).toBeInTheDocument()
      expect(screen.getByText('Special Prizes')).toBeInTheDocument()
    })
  })

  describe('History section', () => {
    it('renders History section header when debut is set', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('History')).toBeInTheDocument()
    })

    it('renders career span with debut year and present when not retired', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Career Span')).toBeInTheDocument()
      expect(screen.getByText(/2013.*present/)).toBeInTheDocument()
    })

    it('renders career span with end year when intai is set', () => {
      render(<RikishiOverview rikishiDetails={{ ...mockDetails, intai: '2025-01-15' }} />)
      expect(screen.getByText(/2013.*2025/)).toBeInTheDocument()
    })

    it('renders Division Debuts sub-header when rankHistory contains valid entries', () => {
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Division Debuts')).toBeInTheDocument()
    })

    it('renders Division History sub-header when careerStats are available', () => {
      useCareerStats.mockReturnValue({
        totalWins: 50,
        totalLosses: 30,
        totalAbsences: 0,
        yushoByDivision: {},
        bashosByDivision: { Makuuchi: 5 },
        shukunsho: 0,
        kantosho: 0,
        ginosho: 0,
      })
      render(<RikishiOverview rikishiDetails={mockDetails} />)
      expect(screen.getByText('Division History')).toBeInTheDocument()
    })

    it('does not render History section when no debut, rankHistory, or careerStats', () => {
      render(<RikishiOverview rikishiDetails={{ heya: 'Isegahama' }} />)
      expect(screen.queryByText('History')).not.toBeInTheDocument()
    })
  })
})
