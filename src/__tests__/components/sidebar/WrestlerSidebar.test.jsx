import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WrestlerSidebar from '../../../components/sidebar/WrestlerSidebar'
import { renderWithQueryClient, mockBanzukeData, mockBashoResults } from '../../testUtils'

// Mock the store
vi.mock('../../../store/divisionStore', () => ({
  default: vi.fn(),
}))

// Mock the hooks
vi.mock('../../../hooks/useBanzuke', () => ({
  default: vi.fn(),
}))

vi.mock('../../../hooks/useBashoResults', () => ({
  default: vi.fn(),
}))

// Mock child components
vi.mock('../../../components/sidebar/WrestlerGrid', () => ({
  default: ({ wrestlers, side, onWrestlerClick }) => (
    <div data-testid={`wrestler-grid-${side.toLowerCase()}`}>
      {wrestlers.map((w) => (
        <div key={w.rikishiID} onClick={() => onWrestlerClick(w)}>
          {w.shikonaEn}
        </div>
      ))}
    </div>
  ),
}))

vi.mock('../../../components/sidebar/BashoSelector', () => ({
  default: ({ selectedBashoId, onBashoChange }) => (
    <select
      data-testid="basho-selector"
      value={selectedBashoId}
      onChange={(e) => onBashoChange(e.target.value)}
    >
      <option value="202601">Jan 2026</option>
      <option value="202511">Nov 2025</option>
    </select>
  ),
}))

vi.mock('../../../components/sidebar/BashoWinners', () => ({
  default: () => <div data-testid="basho-winners">BashoWinners</div>,
}))

vi.mock('../../../components/modal/MatchHistoryModal', () => ({
  default: () => <div data-testid="match-history-modal">MatchHistoryModal</div>,
}))

vi.mock('../../../components/common/Loading', () => ({
  default: ({ message }) => <div data-testid="loading">{message}</div>,
}))

vi.mock('../../../components/common/ErrorMessage', () => ({
  default: ({ error, onRetry }) => (
    <div data-testid="error-message" onClick={onRetry}>
      {error?.message}
    </div>
  ),
}))

import useDivisionStore from '../../../store/divisionStore'
import useBanzuke from '../../../hooks/useBanzuke'
import useBashoResults from '../../../hooks/useBashoResults'

describe('WrestlerSidebar', () => {
  const mockCloseSidebar = vi.fn()
  const mockOpenModal = vi.fn()
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when sidebar is closed', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isSidebarOpen: false,
        selectedRank: null,
        selectedApiDivision: null,
        closeSidebar: mockCloseSidebar,
        openModal: mockOpenModal,
      })
      useBanzuke.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({
        data: null,
      })
    })

    it('should return null when sidebar is not open', () => {
      const { container } = render(<WrestlerSidebar />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when sidebar is open', () => {
    beforeEach(() => {
      useDivisionStore.mockReturnValue({
        isSidebarOpen: true,
        selectedRank: 'Yokozuna',
        selectedApiDivision: 'Makuuchi',
        closeSidebar: mockCloseSidebar,
        openModal: mockOpenModal,
      })
    })

    it('should render loading state', () => {
      useBanzuke.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: null })

      render(<WrestlerSidebar />)
      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.getByText('Loading rikishi...')).toBeInTheDocument()
    })

    it('should render error state', () => {
      const error = { message: 'Failed to fetch' }
      useBanzuke.mockReturnValue({
        data: null,
        isLoading: false,
        error,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: null })

      render(<WrestlerSidebar />)
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    it('should render sidebar header with rank', () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      render(<WrestlerSidebar />)
      expect(screen.getByText('Yokozuna')).toBeInTheDocument()
    })

    it('should render close button', () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      render(<WrestlerSidebar />)
      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument()
    })

    it('should render BashoSelector', () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      render(<WrestlerSidebar />)
      expect(screen.getByTestId('basho-selector')).toBeInTheDocument()
    })

    it('should render MatchHistoryModal', () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      render(<WrestlerSidebar />)
      expect(screen.getByTestId('match-history-modal')).toBeInTheDocument()
    })

    it('should call closeSidebar when close button is clicked', async () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      render(<WrestlerSidebar />)

      fireEvent.click(screen.getByLabelText('Close sidebar'))

      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalled()
      }, { timeout: 500 })
    })

    it('should call closeSidebar when overlay is clicked', async () => {
      useBanzuke.mockReturnValue({
        data: mockBanzukeData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })
      useBashoResults.mockReturnValue({ data: mockBashoResults })

      const { container } = render(<WrestlerSidebar />)
      const overlay = container.querySelector('div')

      fireEvent.click(overlay)

      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalled()
      }, { timeout: 500 })
    })
  })
})
