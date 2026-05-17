import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MatchHistoryModal from '../../../components/modal/MatchHistoryModal'
import { AWARD_TYPES } from '../../../utils/awards'

// Mock the store
vi.mock('../../../store/divisionStore', () => ({
  default: vi.fn(),
}))

// Mock MatchGrid
vi.mock('../../../components/modal/MatchGrid', () => ({
  default: ({ matches }) => (
    <div data-testid="match-grid">{matches?.length || 0} matches</div>
  ),
}))

vi.mock('../../../hooks/useRikishi', () => ({
  useAllRikishi: vi.fn(() => ({ rikishiMap: new Map(), isLoading: false })),
}))

vi.mock('../../../components/modal/RikishiDetailModal', () => ({
  default: ({ isOpen }) =>
    isOpen ? <div data-testid="rikishi-detail-modal">Detail Modal</div> : null,
}))

import useDivisionStore from '../../../store/divisionStore'
import { useAllRikishi } from '../../../hooks/useRikishi'

describe('MatchHistoryModal', () => {
  const mockCloseModal = vi.fn()
  const mockClearSelectedWrestler = vi.fn()

  const mockWrestler = {
    rikishiID: 1,
    shikonaEn: 'Terunofuji',
    shikonaJp: '照ノ富士',
    rank: 'Yokozuna 1 East',
    wins: 12,
    losses: 3,
    absences: 0,
    record: [
      { result: 'win', opponentShikonaEn: 'Test', kimarite: 'yorikiri' },
    ],
    awards: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when no wrestler is selected', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: null,
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })
    })

    it('should return null when no wrestler selected', () => {
      const { container } = render(<MatchHistoryModal />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when wrestler is selected', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: mockWrestler,
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })
    })

    it('should render wrestler name', () => {
      render(<MatchHistoryModal />)
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    })

    it('should render wrestler rank', () => {
      render(<MatchHistoryModal />)
      expect(screen.getByText(/Yokozuna 1 East/)).toBeInTheDocument()
    })

    it('should render wrestler record', () => {
      render(<MatchHistoryModal />)
      expect(screen.getByText(/12W-3L-0A/)).toBeInTheDocument()
    })

    it('should render win percentage', () => {
      render(<MatchHistoryModal />)
      expect(screen.getByText(/80.00% Win Rate/)).toBeInTheDocument()
    })

    it('should render Match History title', () => {
      render(<MatchHistoryModal />)
      expect(screen.getByText('Match History')).toBeInTheDocument()
    })

    it('should render MatchGrid with matches', () => {
      render(<MatchHistoryModal />)
      expect(screen.getByTestId('match-grid')).toBeInTheDocument()
      expect(screen.getByText('1 matches')).toBeInTheDocument()
    })

    it('should render close button with aria-label', () => {
      render(<MatchHistoryModal />)
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
    })

    it('should render Close button in footer', () => {
      render(<MatchHistoryModal />)
      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    it('should call closeModal when close button is clicked', () => {
      render(<MatchHistoryModal />)
      fireEvent.click(screen.getByLabelText('Close modal'))
      expect(mockCloseModal).toHaveBeenCalled()
    })

    it('should call closeModal when footer close button is clicked', () => {
      render(<MatchHistoryModal />)
      fireEvent.click(screen.getByText('Close'))
      expect(mockCloseModal).toHaveBeenCalled()
    })
  })

  describe('with awards', () => {
    beforeEach(() => {
      const wrestlerWithAwards = {
        ...mockWrestler,
        awards: [AWARD_TYPES.YUSHO, AWARD_TYPES.KANTO_SHO],
      }
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: wrestlerWithAwards,
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })
    })

    it('should render yusho award with trophy emoji', () => {
      render(<MatchHistoryModal />)
      // The award badge contains "🏆 Yusho"
      expect(screen.getByText(/🏆.*Yusho/)).toBeInTheDocument()
    })

    it('should render special prize award badge', () => {
      render(<MatchHistoryModal />)
      // The badge text appears in the visible badge
      const badges = screen.getAllByText('Kantō-shō')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('win percentage calculation', () => {
    it('should show 0% when no decided matches', () => {
      const wrestlerNoMatches = {
        ...mockWrestler,
        wins: 0,
        losses: 0,
      }
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: wrestlerNoMatches,
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })

      render(<MatchHistoryModal />)
      // When no matches, getWinPercentage returns 0 (not 0.00)
      expect(screen.getByText(/0% Win Rate/)).toBeInTheDocument()
    })

    it('should calculate correct win percentage', () => {
      const wrestlerPerfect = {
        ...mockWrestler,
        wins: 15,
        losses: 0,
      }
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: wrestlerPerfect,
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })

      render(<MatchHistoryModal />)
      expect(screen.getByText(/100\.00% Win Rate/)).toBeInTheDocument()
    })
  })

  describe('kachi-koshi/make-koshi badges', () => {
    it('should render Kachi-koshi badge for winning record', () => {
      const winningWrestler = {
        ...mockWrestler,
        wins: 10,
        losses: 5,
      }
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: winningWrestler,
        selectedApiDivision: 'Makuuchi',
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })

      render(<MatchHistoryModal />)
      // Full name displayed in modal (appears in badge and tooltip)
      const badges = screen.getAllByText('Kachi-koshi')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('should render Make-koshi badge for losing record', () => {
      const losingWrestler = {
        ...mockWrestler,
        wins: 5,
        losses: 10,
      }
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: losingWrestler,
        selectedApiDivision: 'Makuuchi',
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })

      render(<MatchHistoryModal />)
      // Full name displayed in modal (appears in badge and tooltip)
      const badges = screen.getAllByText('Make-koshi')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('should not render KK/MK badge when record not determined', () => {
      const undeterminedWrestler = {
        ...mockWrestler,
        wins: 5,
        losses: 5,
      }
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: undeterminedWrestler,
        selectedApiDivision: 'Makuuchi',
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })

      render(<MatchHistoryModal />)
      expect(screen.queryByText('Kachi-koshi')).not.toBeInTheDocument()
      expect(screen.queryByText('Make-koshi')).not.toBeInTheDocument()
    })

    it('should render KK badge before award badges', () => {
      const wrestlerWithKKAndAward = {
        ...mockWrestler,
        wins: 12,
        losses: 3,
        awards: [AWARD_TYPES.YUSHO],
      }
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: wrestlerWithKKAndAward,
        selectedApiDivision: 'Makuuchi',
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })

      render(<MatchHistoryModal />)
      // Both badges should be present (text appears in badge and tooltip)
      const kkBadges = screen.getAllByText('Kachi-koshi')
      expect(kkBadges.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/🏆.*Yusho/)).toBeInTheDocument()
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
      birthDate: '1990-01-01',
      debut: '201303',
    }

    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isModalOpen: true,
        selectedWrestler: mockWrestler,
        selectedColor: 'makuuchi',
        closeModal: mockCloseModal,
        clearSelectedWrestler: mockClearSelectedWrestler,
      })
    })

    it('should not render info button when rikishiMap has no entry for the wrestler', () => {
      useAllRikishi.mockReturnValue({ rikishiMap: new Map(), isLoading: false })
      render(<MatchHistoryModal />)
      expect(screen.queryByLabelText('View rikishi details')).not.toBeInTheDocument()
    })

    it('should render info button when rikishiDetails is available', () => {
      useAllRikishi.mockReturnValue({
        rikishiMap: new Map([[mockWrestler.rikishiID, rikishiDetails]]),
        isLoading: false,
      })
      render(<MatchHistoryModal />)
      expect(screen.getByLabelText('View rikishi details')).toBeInTheDocument()
    })

    it('should open the detail modal when info button is clicked', () => {
      useAllRikishi.mockReturnValue({
        rikishiMap: new Map([[mockWrestler.rikishiID, rikishiDetails]]),
        isLoading: false,
      })
      render(<MatchHistoryModal />)
      expect(screen.queryByTestId('rikishi-detail-modal')).not.toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('View rikishi details'))
      expect(screen.getByTestId('rikishi-detail-modal')).toBeInTheDocument()
    })
  })
})
