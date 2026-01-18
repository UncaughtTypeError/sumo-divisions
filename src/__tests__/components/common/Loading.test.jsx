import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Loading from '../../../components/common/Loading'

describe('Loading', () => {
  it('should render with default message', () => {
    render(<Loading />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    render(<Loading message="Loading rikishi..." />)
    expect(screen.getByText('Loading rikishi...')).toBeInTheDocument()
  })

  it('should render spinner element', () => {
    const { container } = render(<Loading />)
    expect(container.querySelector('div')).toBeInTheDocument()
  })
})
