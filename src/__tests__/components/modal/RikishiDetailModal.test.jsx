import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RikishiDetailModal from '../../../components/modal/RikishiDetailModal'

// Isolate the component from React Query — career stats are tested separately
vi.mock('../../../hooks/useCareerStats', () => ({
  useCareerStats: vi.fn(() => null),
}))

import { useCareerStats } from '../../../hooks/useCareerStats'

describe('RikishiDetailModal', () => {
  const mockOnClose = vi.fn()

  const mockRikishiDetails = {
    shikonaEn: 'Terunofuji',
    shikonaJp: '照ノ富士',
    currentRank: 'Yokozuna',
    heya: 'Isegahama',
    shusshin: 'Mongolia, Ulaanbaatar',
    height: 192,
    weight: 167,
    birthDate: '1990-01-01',
    debut: '201303',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when no rikishiDetails provided', () => {
    const { container } = render(
      <RikishiDetailModal isOpen={true} onClose={mockOnClose} rikishiDetails={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  describe('when rikishiDetails is provided', () => {
    const renderModal = (overrides = {}, color) =>
      render(
        <RikishiDetailModal
          isOpen={true}
          onClose={mockOnClose}
          rikishiDetails={{ ...mockRikishiDetails, ...overrides }}
          color={color}
        />
      )

    it('should render the English shikona as the title', () => {
      renderModal()
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    })

    it('should render the Japanese shikona', () => {
      renderModal()
      expect(screen.getByText('照ノ富士')).toBeInTheDocument()
    })

    it('should render the current rank as a subtitle', () => {
      renderModal()
      expect(screen.getByText('Yokozuna')).toBeInTheDocument()
    })

    it('should render the Heya label and value', () => {
      renderModal()
      expect(screen.getByText('Heya')).toBeInTheDocument()
      expect(screen.getByText('Isegahama')).toBeInTheDocument()
    })

    it('should render height with cm unit', () => {
      renderModal()
      expect(screen.getByText('Height')).toBeInTheDocument()
      expect(screen.getByText('192 cm')).toBeInTheDocument()
    })

    it('should render weight with kg unit', () => {
      renderModal()
      expect(screen.getByText('Weight')).toBeInTheDocument()
      expect(screen.getByText('167 kg')).toBeInTheDocument()
    })

    it('should render the formatted debut date', () => {
      renderModal()
      expect(screen.getByText('Debut')).toBeInTheDocument()
      expect(screen.getByText('March 2013')).toBeInTheDocument()
    })

    it('should render the Age label when birthDate is available', () => {
      renderModal()
      expect(screen.getByText('Age')).toBeInTheDocument()
    })

    it('should render the Country label when shusshin is available', () => {
      renderModal()
      expect(screen.getByText('Country')).toBeInTheDocument()
    })

    it('should call onClose when the header close button is clicked', () => {
      renderModal()
      fireEvent.click(screen.getByLabelText('Close'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when the footer Close button is clicked', () => {
      renderModal()
      fireEvent.click(screen.getByText('Close'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not render Japanese shikona when not provided', () => {
      renderModal({ shikonaJp: undefined })
      expect(screen.queryByText('照ノ富士')).not.toBeInTheDocument()
    })

    it('should not render Heya row when heya is not provided', () => {
      renderModal({ heya: undefined })
      expect(screen.queryByText('Heya')).not.toBeInTheDocument()
    })

    it('should not render Height row when height is not provided', () => {
      renderModal({ height: undefined })
      expect(screen.queryByText('Height')).not.toBeInTheDocument()
    })

    it('should not render Weight row when weight is not provided', () => {
      renderModal({ weight: undefined })
      expect(screen.queryByText('Weight')).not.toBeInTheDocument()
    })

    it('should not render Debut row when debut is not provided', () => {
      renderModal({ debut: undefined })
      expect(screen.queryByText('Debut')).not.toBeInTheDocument()
    })

    it('should not render Age row when birthDate is not provided', () => {
      renderModal({ birthDate: undefined })
      expect(screen.queryByText('Age')).not.toBeInTheDocument()
    })

    it('should not render Country row when shusshin is not provided', () => {
      renderModal({ shusshin: undefined })
      expect(screen.queryByText('Country')).not.toBeInTheDocument()
    })

    it('should not render subtitle when currentRank is not provided', () => {
      renderModal({ currentRank: undefined })
      expect(screen.queryByText('Yokozuna')).not.toBeInTheDocument()
    })

    describe('tab navigation', () => {
      it('shows Details tab content by default', () => {
        renderModal()
        expect(screen.getByText('Heya')).toBeInTheDocument()
      })

      it('hides Details content when Career tab is clicked', () => {
        renderModal()
        fireEvent.click(screen.getByText('Career'))
        expect(screen.queryByText('Heya')).not.toBeInTheDocument()
        expect(screen.getByText('No career data available yet.')).toBeInTheDocument()
      })

      it('shows History tab on click', () => {
        renderModal({ debut: '200901' })
        fireEvent.click(screen.getByText('History'))
        expect(screen.queryByText('Heya')).not.toBeInTheDocument()
        expect(screen.getByText('Career Span')).toBeInTheDocument()
      })
    })

    describe('career high', () => {
      it('renders Career High row with the best-ranked entry', () => {
        renderModal({
          rankHistory: [
            { bashoId: '202605', rank: 'Yokozuna 1 East', rankValue: 101 },
            { bashoId: '202011', rank: 'Maegashira 1 East', rankValue: 501 },
          ],
        })
        expect(screen.getByText('Career High')).toBeInTheDocument()
        expect(screen.getByText('Yokozuna 1 East')).toBeInTheDocument()
      })

      it('shows the minimum rankValue entry as career high', () => {
        renderModal({
          rankHistory: [
            { bashoId: '202605', rank: 'Komusubi 1 East', rankValue: 401 },
            { bashoId: '202603', rank: 'Sekiwake 1 East', rankValue: 301 },
            { bashoId: '202601', rank: 'Maegashira 5 East', rankValue: 505 },
          ],
        })
        expect(screen.getByText('Sekiwake 1 East')).toBeInTheDocument()
      })

      it('excludes Mae-zumo entries (rankValue >= 2000) from career high', () => {
        renderModal({
          rankHistory: [
            { bashoId: '202605', rank: 'Jonokuchi 1 East', rankValue: 1001 },
            { bashoId: '202511', rank: 'Mae-zumo', rankValue: 2000 },
          ],
        })
        expect(screen.getByText('Career High')).toBeInTheDocument()
        expect(screen.getByText('Jonokuchi 1 East')).toBeInTheDocument()
        expect(screen.queryByText('Mae-zumo')).not.toBeInTheDocument()
      })

      it('does not render Career High row when rankHistory is empty', () => {
        renderModal({ rankHistory: [] })
        expect(screen.queryByText('Career High')).not.toBeInTheDocument()
      })

      it('does not render Career High row when rankHistory is absent', () => {
        renderModal({ rankHistory: undefined })
        expect(screen.queryByText('Career High')).not.toBeInTheDocument()
      })
    })

    describe('retirement (intai)', () => {
      it('renders Retired row with formatted date when intai is provided', () => {
        renderModal({ intai: '2025-01-17T00:00:00Z' })
        // "Retired" appears in both the header badge and the <dt> row label
        const retiredElements = screen.getAllByText('Retired')
        expect(retiredElements.length).toBeGreaterThanOrEqual(2)
        expect(screen.getByText('January 17, 2025')).toBeInTheDocument()
      })

      it('renders Retired badge next to current rank in header', () => {
        renderModal({ intai: '2025-01-17T00:00:00Z' })
        const retiredBadges = screen.getAllByText('Retired')
        expect(retiredBadges.length).toBeGreaterThanOrEqual(1)
      })

      it('does not render Retired content when intai is null', () => {
        renderModal({ intai: null })
        expect(screen.queryByText('Retired')).not.toBeInTheDocument()
        expect(screen.queryByText('January 17, 2025')).not.toBeInTheDocument()
      })

      it('does not render Retired content when intai is undefined', () => {
        renderModal({ intai: undefined })
        expect(screen.queryByText('Retired')).not.toBeInTheDocument()
      })

      it('renders Retired badge even when currentRank is absent (retired with no rank data)', () => {
        renderModal({ currentRank: undefined, intai: '2025-01-17T00:00:00Z' })
        const retiredElements = screen.getAllByText('Retired')
        expect(retiredElements.length).toBeGreaterThanOrEqual(1)
      })

      it('formats retirement date with correct month name', () => {
        renderModal({ intai: '2024-11-30T00:00:00Z' })
        expect(screen.getByText('November 30, 2024')).toBeInTheDocument()
      })
    })

    describe('debut date formatting', () => {
      it('should format January correctly', () => {
        renderModal({ debut: '202001' })
        expect(screen.getByText('January 2020')).toBeInTheDocument()
      })

      it('should format December correctly', () => {
        renderModal({ debut: '199912' })
        expect(screen.getByText('December 1999')).toBeInTheDocument()
      })
    })

    describe('career stats (from useCareerStats)', () => {
      const renderCareerTab = (overrides = {}) => {
        const result = renderModal(overrides)
        fireEvent.click(screen.getByText('Career'))
        return result
      }

      beforeEach(() => {
        useCareerStats.mockReturnValue(null)
      })

      it('shows no career data message when useCareerStats returns null', () => {
        renderCareerTab()
        expect(screen.getByText('No career data available yet.')).toBeInTheDocument()
      })

      it('does not show no-data message when stats are available', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 0, totalLosses: 0, totalAbsences: 0,
          bashosByDivision: {},
        })
        renderCareerTab()
        expect(screen.queryByText('No career data available yet.')).not.toBeInTheDocument()
      })

      it('shows win and loss counts with correct values', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 312, totalLosses: 189, totalAbsences: 14,
          bashosByDivision: {},
        })
        renderCareerTab()
        expect(screen.getByText('Wins')).toBeInTheDocument()
        expect(screen.getByText('Losses')).toBeInTheDocument()
        expect(screen.getByText('Absences')).toBeInTheDocument()
        expect(screen.getByText('312')).toBeInTheDocument()
        expect(screen.getByText('189')).toBeInTheDocument()
        expect(screen.getByText('14')).toBeInTheDocument()
      })

      it('omits absences stat when totalAbsences is 0', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 100, totalLosses: 50, totalAbsences: 0,
          bashosByDivision: {},
        })
        renderCareerTab()
        expect(screen.queryByText('Absences')).not.toBeInTheDocument()
      })

      it('shows win rate inline in the meta line', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 300, totalLosses: 100, totalAbsences: 0,
          bashosByDivision: {},
        })
        renderCareerTab()
        expect(screen.getByText('75.0% win rate')).toBeInTheDocument()
      })

      it('hides win rate when there are no bouts', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 0, totalLosses: 0, totalAbsences: 0,
          bashosByDivision: {},
        })
        renderCareerTab()
        expect(screen.queryByText(/win rate/)).not.toBeInTheDocument()
      })

      it('shows bouts and bashos count in the meta line', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 200, totalLosses: 100, totalAbsences: 10,
          bashosByDivision: { Makuuchi: 28, Juryo: 6 },
        })
        renderCareerTab()
        expect(screen.getByText(/300 bouts/)).toBeInTheDocument()
        expect(screen.getByText(/34 bashos/)).toBeInTheDocument()
      })

      it('shows yusho grid with all 6 divisions always', () => {
        useCareerStats.mockReturnValue({
          yusho: 2, yushoByDivision: { Makuuchi: 2 }, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 200, totalLosses: 100, totalAbsences: 0,
          bashosByDivision: { Makuuchi: 30 },
        })
        renderCareerTab()
        expect(screen.getByText('Yusho')).toBeInTheDocument()
        for (const d of ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi']) {
          expect(screen.getAllByText(d).length).toBeGreaterThanOrEqual(1)
        }
      })

      it('shows correct yusho count for competed divisions', () => {
        useCareerStats.mockReturnValue({
          yusho: 3, yushoByDivision: { Makuuchi: 2, Juryo: 1 }, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 300, totalLosses: 150, totalAbsences: 0,
          bashosByDivision: {},
        })
        renderCareerTab()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument()
      })

      it('always shows all three special prizes including zero counts', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 2, kantosho: 0, ginosho: 1,
          totalWins: 80, totalLosses: 70, totalAbsences: 0,
          bashosByDivision: {},
        })
        renderCareerTab()
        expect(screen.getByText('Shukun-shō')).toBeInTheDocument()
        expect(screen.getByText('Kantō-shō')).toBeInTheDocument()
        expect(screen.getByText('Ginō-shō')).toBeInTheDocument()
      })

      it('shows correct prize counts including 0', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 3, kantosho: 0, ginosho: 0,
          totalWins: 100, totalLosses: 80, totalAbsences: 0,
          bashosByDivision: {},
        })
        renderCareerTab()
        expect(screen.getByText('Special Prizes')).toBeInTheDocument()
      })

    })

    describe('history tab', () => {
      beforeEach(() => {
        useCareerStats.mockReturnValue(null)
      })

      const renderHistoryTab = (overrides = {}) => {
        const result = renderModal(overrides)
        fireEvent.click(screen.getByText('History'))
        return result
      }

      it('shows career span as a year range when debut is provided', () => {
        renderHistoryTab({ debut: '200901' })
        expect(screen.getByText('Career Span')).toBeInTheDocument()
        expect(screen.getByText(/2009.*present/)).toBeInTheDocument()
      })

      it('shows years count alongside the year range', () => {
        renderHistoryTab({ debut: '200901' })
        expect(screen.getByText(/\d+ years?/)).toBeInTheDocument()
      })

      it('shows retirement year instead of present for retired wrestlers', () => {
        renderHistoryTab({ debut: '200901', intai: '2025-01-17T00:00:00Z' })
        expect(screen.getByText(/2009.*2025/)).toBeInTheDocument()
        expect(screen.queryByText(/present/)).not.toBeInTheDocument()
      })

      it('hides career span section when debut is absent', () => {
        renderHistoryTab({ debut: undefined })
        expect(screen.queryByText('Career Span')).not.toBeInTheDocument()
      })

      it('shows division debuts derived from rankHistory', () => {
        renderHistoryTab({
          rankHistory: [
            { bashoId: '200903', rank: 'Jonokuchi 1 East', rankValue: 1001 },
            { bashoId: '200905', rank: 'Juryo 10 West',    rankValue: 610 },
            { bashoId: '201001', rank: 'Maegashira 15 East', rankValue: 515 },
          ],
        })
        expect(screen.getByText('Division Debuts')).toBeInTheDocument()
        expect(screen.getByText('March 2009')).toBeInTheDocument()
        expect(screen.getByText('May 2009')).toBeInTheDocument()
        expect(screen.getByText('January 2010')).toBeInTheDocument()
      })

      it('maps Makuuchi rank titles to Makuuchi division in debuts', () => {
        renderHistoryTab({
          rankHistory: [
            { bashoId: '201805', rank: 'Maegashira 15 East', rankValue: 515 },
            { bashoId: '202001', rank: 'Yokozuna 1 East',    rankValue: 101 },
          ],
        })
        // Only one Makuuchi debut shown (the earliest)
        expect(screen.getByText('May 2018')).toBeInTheDocument()
        expect(screen.queryByText('January 2020')).not.toBeInTheDocument()
      })

      it('excludes Mae-zumo entries from division debuts', () => {
        renderHistoryTab({
          rankHistory: [
            { bashoId: '200901', rank: 'Mae-zumo', rankValue: 2000 },
            { bashoId: '200903', rank: 'Jonokuchi 1 East', rankValue: 1001 },
          ],
        })
        expect(screen.queryByText('January 2009')).not.toBeInTheDocument()
        expect(screen.getByText('March 2009')).toBeInTheDocument()
      })

      it('hides Division Debuts section when rankHistory is absent', () => {
        renderHistoryTab({ rankHistory: undefined })
        expect(screen.queryByText('Division Debuts')).not.toBeInTheDocument()
      })

      it('shows division history with basho counts', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 200, totalLosses: 150, totalAbsences: 0,
          bashosByDivision: { Makuuchi: 28, Juryo: 6 },
        })
        renderHistoryTab()
        expect(screen.getByText('28 bashos')).toBeInTheDocument()
        expect(screen.getByText('6 bashos')).toBeInTheDocument()
      })

      it('uses singular "basho" for a count of 1', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 4, totalLosses: 3, totalAbsences: 0,
          bashosByDivision: { Jonokuchi: 1 },
        })
        renderHistoryTab()
        expect(screen.getByText('1 basho')).toBeInTheDocument()
      })

      it('shows all 6 divisions in history including uncompeted ones as 0 bashos', () => {
        useCareerStats.mockReturnValue({
          yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
          totalWins: 10, totalLosses: 5, totalAbsences: 0,
          bashosByDivision: { Makuuchi: 5 },
        })
        renderHistoryTab()
        expect(screen.getAllByText('5 bashos').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('0 bashos').length).toBe(5)
      })

      it('shows no-data message when debut, rankHistory, and careerStats are all absent', () => {
        renderHistoryTab({ debut: undefined, rankHistory: undefined })
        expect(screen.getByText('No history available yet.')).toBeInTheDocument()
      })
    })
  })
})
