import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

// Mock the DivisionPyramid component
vi.mock('../components/pyramid/DivisionPyramid', () => ({
  default: () => <div data-testid="division-pyramid">DivisionPyramid</div>,
}))

describe('App', () => {
  it('should render the app header', () => {
    render(<App />)
    expect(screen.getByText('Sumo Divisions')).toBeInTheDocument()
  })

  it('should render the DivisionPyramid component', () => {
    render(<App />)
    expect(screen.getByTestId('division-pyramid')).toBeInTheDocument()
  })

  it('should have main element', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('should have header element', () => {
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should render h1 heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Sumo Divisions'
    )
  })
})
