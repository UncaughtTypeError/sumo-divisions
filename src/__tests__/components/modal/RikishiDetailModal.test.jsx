import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RikishiDetailModal from '../../../components/modal/RikishiDetailModal'

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
  })
})
