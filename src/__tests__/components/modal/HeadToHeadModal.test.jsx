import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HeadToHeadModal from '../../../components/modal/HeadToHeadModal'

vi.mock('../../../hooks/useRikishi', () => ({
  useRikishiMatches: vi.fn(),
}))

vi.mock('../../../components/modal/KimariteModal', () => ({
  default: ({ isOpen }) =>
    isOpen ? <div data-testid="kimarite-modal">Kimarite Modal</div> : null,
}))

import { useRikishiMatches } from '../../../hooks/useRikishi'

describe('HeadToHeadModal', () => {
  const mockOnClose = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    rikishiId: 1,
    opponentId: 2,
    rikishiName: 'Kirishima',
    opponentName: 'Ichiyamamoto',
  }

  const mockData = {
    matches: [
      { bashoId: '202605', division: 'Makuuchi', day: 4, winnerId: 1, kimarite: 'yorikiri' },
      { bashoId: '202601', division: 'Makuuchi', day: 6, winnerId: 2, kimarite: 'oshidashi' },
      { bashoId: '202503', division: 'Juryo', day: 10, winnerId: 1, kimarite: 'hatakikomi' },
    ],
    rikishiWins: 2,
    opponentWins: 1,
    total: 3,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useRikishiMatches.mockReturnValue({ data: null, isLoading: false, isError: false })
  })

  describe('header', () => {
    it('should render rikishi and opponent names in the title', () => {
      useRikishiMatches.mockReturnValue({ data: mockData, isLoading: false, isError: false })
      render(<HeadToHeadModal {...defaultProps} />)
      const heading = screen.getByRole('heading')
      expect(heading).toHaveTextContent('Kirishima')
      expect(heading).toHaveTextContent('Ichiyamamoto')
    })

    it('should call onClose when close button is clicked', () => {
      useRikishiMatches.mockReturnValue({ data: mockData, isLoading: false, isError: false })
      render(<HeadToHeadModal {...defaultProps} />)
      fireEvent.click(screen.getByLabelText('Close'))
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('loading, error and empty states', () => {
    it('should show loading message while fetching', () => {
      useRikishiMatches.mockReturnValue({ data: null, isLoading: true, isError: false })
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('Loading match history…')).toBeInTheDocument()
    })

    it('should show error message on fetch failure', () => {
      useRikishiMatches.mockReturnValue({ data: null, isLoading: false, isError: true })
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('Failed to load match history.')).toBeInTheDocument()
    })

    it('should show empty state when total is zero', () => {
      useRikishiMatches.mockReturnValue({
        data: { matches: [], total: 0, rikishiWins: 0, opponentWins: 0 },
        isLoading: false,
        isError: false,
      })
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('No head-to-head records found.')).toBeInTheDocument()
    })
  })

  describe('match summary subtitle', () => {
    it('should render win and loss counts', () => {
      useRikishiMatches.mockReturnValue({ data: mockData, isLoading: false, isError: false })
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('2W')).toBeInTheDocument()
      expect(screen.getByText('1L')).toBeInTheDocument()
    })

    it('should show positive percentage when wins exceed losses', () => {
      // (2-1)/3*100 = 33.3%
      useRikishiMatches.mockReturnValue({ data: mockData, isLoading: false, isError: false })
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('33.3%')).toBeInTheDocument()
    })

    it('should show negative percentage when losses exceed wins', () => {
      // (1-2)/3*100 = -33.3%
      useRikishiMatches.mockReturnValue({
        data: { ...mockData, rikishiWins: 1, opponentWins: 2 },
        isLoading: false,
        isError: false,
      })
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('-33.3%')).toBeInTheDocument()
    })

    it('should show -100% when rikishi has no wins', () => {
      useRikishiMatches.mockReturnValue({
        data: {
          matches: [
            { bashoId: '202605', division: 'Makuuchi', day: 1, winnerId: 2, kimarite: 'oshidashi' },
            { bashoId: '202601', division: 'Makuuchi', day: 1, winnerId: 2, kimarite: 'yorikiri' },
          ],
          rikishiWins: 0,
          opponentWins: 2,
          total: 2,
        },
        isLoading: false,
        isError: false,
      })
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('-100.0%')).toBeInTheDocument()
    })

    it('should show 100% when rikishi wins all matches', () => {
      useRikishiMatches.mockReturnValue({
        data: {
          matches: [
            { bashoId: '202605', division: 'Makuuchi', day: 1, winnerId: 1, kimarite: 'yorikiri' },
            { bashoId: '202601', division: 'Makuuchi', day: 1, winnerId: 1, kimarite: 'hatakikomi' },
          ],
          rikishiWins: 2,
          opponentWins: 0,
          total: 2,
        },
        isLoading: false,
        isError: false,
      })
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('100.0%')).toBeInTheDocument()
    })

    it('should show 0.0% for an even record', () => {
      useRikishiMatches.mockReturnValue({
        data: { ...mockData, rikishiWins: 3, opponentWins: 3, total: 6 },
        isLoading: false,
        isError: false,
      })
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })
  })

  describe('match list', () => {
    beforeEach(() => {
      useRikishiMatches.mockReturnValue({ data: mockData, isLoading: false, isError: false })
    })

    it('should render Win and Loss results', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getAllByText('Win').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Loss').length).toBeGreaterThanOrEqual(1)
    })

    it('should render formatted basho dates', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      // basho span contains date + division so use getAllByText with regex
      expect(screen.getAllByText(/May 2026/).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Jan 2026/).length).toBeGreaterThanOrEqual(1)
    })

    it('should render division labels', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getAllByText('Makuuchi').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Juryo')).toBeInTheDocument()
    })

    it('should render day numbers', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByText('Day 4')).toBeInTheDocument()
    })

    it('should render known kimarite as a clickable button', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      expect(
        screen.getByRole('button', { name: /view details for yorikiri/i })
      ).toBeInTheDocument()
    })

    it('should open kimarite modal when kimarite button is clicked', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.queryByTestId('kimarite-modal')).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /view details for yorikiri/i }))
      expect(screen.getByTestId('kimarite-modal')).toBeInTheDocument()
    })
  })

  describe('sort controls', () => {
    beforeEach(() => {
      useRikishiMatches.mockReturnValue({ data: mockData, isLoading: false, isError: false })
    })

    it('should render a sort button for each column', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Basho/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Day$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Result$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Kimarite/i })).toBeInTheDocument()
    })

    it('should show descending indicator on the default Basho column', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Basho.*↓/ })).toBeInTheDocument()
    })

    it('should toggle to ascending when the active sort column is clicked', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /Basho/ }))
      expect(screen.getByRole('button', { name: /Basho.*↑/ })).toBeInTheDocument()
    })

    it('should switch sort column and default to ascending when a new header is clicked', () => {
      render(<HeadToHeadModal {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /^Day$/i }))
      expect(screen.getByRole('button', { name: /Day.*↑/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Basho.*↓/ })).not.toBeInTheDocument()
    })
  })
})
