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
