import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DivisionPyramid from '../../../components/pyramid/DivisionPyramid'
import { PYRAMID_LEVELS, RANKS } from '../../../utils/constants'

const mockSelectRank = vi.fn()

// Mock the child components and store
vi.mock('../../../store/divisionStore', () => ({
  default: vi.fn((selector) => {
    const state = { selectRank: mockSelectRank }
    return selector ? selector(state) : state
  }),
}))

vi.mock('../../../components/sidebar/WrestlerSidebar', () => ({
  default: () => <div data-testid="wrestler-sidebar">WrestlerSidebar</div>,
}))

vi.mock('../../../components/pyramid/DivisionLegend', () => ({
  default: () => <div data-testid="division-legend">DivisionLegend</div>,
}))

vi.mock('../../../components/pyramid/RankGroupLegend', () => ({
  default: () => <div data-testid="rank-group-legend">RankGroupLegend</div>,
}))

describe('DivisionPyramid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all pyramid levels', () => {
    render(<DivisionPyramid />)

    PYRAMID_LEVELS.forEach((level) => {
      expect(screen.getByText(level.rank)).toBeInTheDocument()
    })
  })

  it('should render WrestlerSidebar', () => {
    render(<DivisionPyramid />)
    expect(screen.getByTestId('wrestler-sidebar')).toBeInTheDocument()
  })

  it('should render DivisionLegend', () => {
    render(<DivisionPyramid />)
    expect(screen.getByTestId('division-legend')).toBeInTheDocument()
  })

  it('should render RankGroupLegend', () => {
    render(<DivisionPyramid />)
    expect(screen.getByTestId('rank-group-legend')).toBeInTheDocument()
  })

  it('should call selectRank when a rank card is clicked', () => {
    render(<DivisionPyramid />)

    const yokozunaButton = screen.getByText(RANKS.YOKOZUNA)
    fireEvent.click(yokozunaButton)

    expect(mockSelectRank).toHaveBeenCalledWith(
      RANKS.YOKOZUNA,
      'Makuuchi',
      'Makuuchi',
      'yokozuna' // color
    )
  })

  it('should render 10 pyramid levels', () => {
    render(<DivisionPyramid />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(10)
  })
})
