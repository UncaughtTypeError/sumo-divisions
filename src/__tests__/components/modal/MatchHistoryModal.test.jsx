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

import useDivisionStore from '../../../store/divisionStore'

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

    it('should render special prize award', () => {
      render(<MatchHistoryModal />)
      expect(screen.getByText('Kantō-shō')).toBeInTheDocument()
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
})
