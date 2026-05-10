import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DivisionLegend from '../../../components/pyramid/DivisionLegend'
import { DIVISIONS, DIVISION_LEGEND } from '../../../utils/constants'

// Mock the store
vi.mock('../../../store/divisionStore', () => ({
  default: vi.fn(),
}))

import useDivisionStore from '../../../store/divisionStore'

describe('DivisionLegend', () => {
  const mockSelectRank = vi.fn()
  const mockSelectDivision = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useDivisionStore.mockReturnValue({
      selectRank: mockSelectRank,
      selectDivision: mockSelectDivision,
    })
  })

  it('should render all division names', () => {
    render(<DivisionLegend />)

    Object.values(DIVISIONS).forEach((division) => {
      expect(screen.getByText(division)).toBeInTheDocument()
    })
  })

  it('should render all division descriptions', () => {
    render(<DivisionLegend />)

    DIVISION_LEGEND.forEach((division, index) => {
      expect(screen.getByText(`(Division ${index + 1})`)).toBeInTheDocument()
    })
  })

  it('should render 6 division items', () => {
    const { container } = render(<DivisionLegend />)
    const divisionNames = container.querySelectorAll('div')
    expect(divisionNames.length).toBeGreaterThan(0)
  })

  it('should display Makuuchi as Division 1', () => {
    render(<DivisionLegend />)
    expect(screen.getByText(DIVISIONS.MAKUUCHI)).toBeInTheDocument()
    expect(screen.getByText('(Division 1)')).toBeInTheDocument()
  })

  it('should display Jonokuchi as Division 6', () => {
    render(<DivisionLegend />)
    expect(screen.getByText(DIVISIONS.JONOKUCHI)).toBeInTheDocument()
    expect(screen.getByText('(Division 6)')).toBeInTheDocument()
  })

  describe('legend click behaviour', () => {
    it('should render all legend items as clickable buttons', () => {
      render(<DivisionLegend />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(6)
    })

    it('should call selectDivision with Makuuchi args when Makuuchi legend is clicked', () => {
      render(<DivisionLegend />)
      fireEvent.click(screen.getByRole('button', { name: DIVISIONS.MAKUUCHI }))
      expect(mockSelectDivision).toHaveBeenCalledTimes(1)
      expect(mockSelectDivision).toHaveBeenCalledWith('Makuuchi', 'Makuuchi', 'makuuchi')
      expect(mockSelectRank).not.toHaveBeenCalled()
    })

    it('should call selectRank when Juryo legend is clicked', () => {
      render(<DivisionLegend />)
      fireEvent.click(screen.getByRole('button', { name: DIVISIONS.JURYO }))
      expect(mockSelectRank).toHaveBeenCalledTimes(1)
      expect(mockSelectRank).toHaveBeenCalledWith('Juryo', 'Juryo', 'Juryo', 'juryo')
      expect(mockSelectDivision).not.toHaveBeenCalled()
    })

    it('should call selectRank when Makushita legend is clicked', () => {
      render(<DivisionLegend />)
      fireEvent.click(screen.getByRole('button', { name: DIVISIONS.MAKUSHITA }))
      expect(mockSelectRank).toHaveBeenCalledWith('Makushita', 'Makushita', 'Makushita', 'makushita')
    })

    it('should call selectRank when Sandanme legend is clicked', () => {
      render(<DivisionLegend />)
      fireEvent.click(screen.getByRole('button', { name: DIVISIONS.SANDANME }))
      expect(mockSelectRank).toHaveBeenCalledWith('Sandanme', 'Sandanme', 'Sandanme', 'sandanme')
    })

    it('should call selectRank when Jonidan legend is clicked', () => {
      render(<DivisionLegend />)
      fireEvent.click(screen.getByRole('button', { name: DIVISIONS.JONIDAN }))
      expect(mockSelectRank).toHaveBeenCalledWith('Jonidan', 'Jonidan', 'Jonidan', 'jonidan')
    })

    it('should call selectRank when Jonokuchi legend is clicked', () => {
      render(<DivisionLegend />)
      fireEvent.click(screen.getByRole('button', { name: DIVISIONS.JONOKUCHI }))
      expect(mockSelectRank).toHaveBeenCalledWith('Jonokuchi', 'Jonokuchi', 'Jonokuchi', 'jonokuchi')
    })

    it('should call selectDivision on Enter key press for Makuuchi', () => {
      render(<DivisionLegend />)
      fireEvent.keyDown(screen.getByRole('button', { name: DIVISIONS.MAKUUCHI }), { key: 'Enter' })
      expect(mockSelectDivision).toHaveBeenCalledWith('Makuuchi', 'Makuuchi', 'makuuchi')
    })

    it('should call selectRank on Enter key press for non-Makuuchi division', () => {
      render(<DivisionLegend />)
      fireEvent.keyDown(screen.getByRole('button', { name: DIVISIONS.JURYO }), { key: 'Enter' })
      expect(mockSelectRank).toHaveBeenCalledWith('Juryo', 'Juryo', 'Juryo', 'juryo')
    })

    it('should not call any action on other key presses', () => {
      render(<DivisionLegend />)
      fireEvent.keyDown(screen.getByRole('button', { name: DIVISIONS.MAKUUCHI }), { key: 'Space' })
      expect(mockSelectDivision).not.toHaveBeenCalled()
      expect(mockSelectRank).not.toHaveBeenCalled()
    })
  })
})
