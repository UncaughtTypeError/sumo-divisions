import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorMessage from '../../../components/common/ErrorMessage'

describe('ErrorMessage', () => {
  it('should render default error message when no error provided', () => {
    render(<ErrorMessage />)
    expect(
      screen.getByText(
        'An error has occurred attempting to fetch the Banzuke data.'
      )
    ).toBeInTheDocument()
  })

  it('should render custom error message from error object', () => {
    const error = { message: 'Network error occurred' }
    render(<ErrorMessage error={error} />)
    expect(screen.getByText('Network error occurred')).toBeInTheDocument()
  })

  it('should render error title', () => {
    render(<ErrorMessage />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage onRetry={onRetry} />)
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage />)
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage onRetry={onRetry} />)

    fireEvent.click(screen.getByText('Try Again'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should handle error without message property', () => {
    const error = {}
    render(<ErrorMessage error={error} />)
    expect(
      screen.getByText(
        'An error has occurred attempting to fetch the Banzuke data.'
      )
    ).toBeInTheDocument()
  })
})
