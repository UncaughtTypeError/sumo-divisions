import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TorikumiModal from '../../../components/modal/TorikumiModal'
import { SIDEBAR_VIEWS } from '../../../utils/constants'

vi.mock('../../../components/sidebar/TorikumiTab', () => ({
  default: () => <div data-testid="torikumi-tab-content">TorikumiTabContent</div>,
}))

describe('TorikumiModal', () => {
  const mockOnClose = vi.fn()
  const mockOnDivisionChange = vi.fn()
  const mockOnDayChange = vi.fn()

  const makuuchiView = SIDEBAR_VIEWS.find((v) => v.value === 'makuuchi')
  const yokozunaView = SIDEBAR_VIEWS.find((v) => v.value === 'yokozuna')

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    torikumiData: null,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    torikumiMaxDay: 15,
    maxDay: 10,
    day: 8,
    onDayChange: mockOnDayChange,
    activeView: makuuchiView,
    onDivisionChange: mockOnDivisionChange,
    currentApiDivision: 'Makuuchi',
    currentColor: 'makuuchi',
    currentIsDivisionView: true,
    currentRank: null,
    wrestlerById: new Map(),
    openModal: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('visibility', () => {
    it('does not render when isOpen is false', () => {
      render(<TorikumiModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the dialog when isOpen is true', () => {
      render(<TorikumiModal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders TorikumiTab content inside the modal', () => {
      render(<TorikumiModal {...defaultProps} />)
      expect(screen.getByTestId('torikumi-tab-content')).toBeInTheDocument()
    })
  })

  describe('header', () => {
    it('applies the division colour as the header background', () => {
      render(<TorikumiModal {...defaultProps} currentColor="makuuchi" />)
      expect(document.querySelector('[style*="--color-makuuchi"]')).toBeInTheDocument()
    })

    it('uses the correct colour variable for a different division', () => {
      render(
        <TorikumiModal {...defaultProps} currentColor="juryo" activeView={SIDEBAR_VIEWS.find((v) => v.value === 'juryo')} />,
      )
      expect(document.querySelector('[style*="--color-juryo"]')).toBeInTheDocument()
    })

    it('renders the close button', () => {
      render(<TorikumiModal {...defaultProps} />)
      expect(screen.getByLabelText('Close')).toBeInTheDocument()
    })

    it('calls onClose when the close button is clicked', () => {
      render(<TorikumiModal {...defaultProps} />)
      fireEvent.click(screen.getByLabelText('Close'))
      expect(mockOnClose).toHaveBeenCalledOnce()
    })
  })

  describe('division select', () => {
    it('renders a division select with all SIDEBAR_VIEWS options', () => {
      render(<TorikumiModal {...defaultProps} />)
      const select = screen.getByLabelText('Select division or rank')
      expect(select).toBeInTheDocument()
      SIDEBAR_VIEWS.forEach((v) => {
        expect(screen.getByRole('option', { name: new RegExp(v.label) })).toBeInTheDocument()
      })
    })

    it('shows the current activeView as the selected option', () => {
      render(<TorikumiModal {...defaultProps} activeView={yokozunaView} />)
      expect(screen.getByLabelText('Select division or rank')).toHaveValue('yokozuna')
    })

    it('calls onDivisionChange with the new value when the select changes', () => {
      render(<TorikumiModal {...defaultProps} activeView={makuuchiView} />)
      fireEvent.change(screen.getByLabelText('Select division or rank'), { target: { value: 'juryo' } })
      expect(mockOnDivisionChange).toHaveBeenCalledWith('juryo')
    })

    it('does not call onDivisionChange when selecting the current value', () => {
      render(<TorikumiModal {...defaultProps} activeView={makuuchiView} />)
      fireEvent.change(screen.getByLabelText('Select division or rank'), { target: { value: 'makuuchi' } })
      expect(mockOnDivisionChange).toHaveBeenCalledWith('makuuchi')
    })
  })
})
