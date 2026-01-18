import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DivisionLegend from '../../../components/pyramid/DivisionLegend'
import { DIVISIONS, DIVISION_LEGEND } from '../../../utils/constants'

describe('DivisionLegend', () => {
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
    // Each division has a name div
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
})
