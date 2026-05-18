import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ViewTabs from '../../../components/views/ViewTabs'

describe('ViewTabs', () => {
  it('renders Rankings and Heya tabs', () => {
    render(<ViewTabs activeView="rankings" onViewChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Rankings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Heya' })).toBeInTheDocument()
  })

  it('marks the active tab as selected', () => {
    render(<ViewTabs activeView="heya" onViewChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Heya' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Rankings' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onViewChange with "rankings" when Rankings tab is clicked', () => {
    const onViewChange = vi.fn()
    render(<ViewTabs activeView="heya" onViewChange={onViewChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Rankings' }))
    expect(onViewChange).toHaveBeenCalledWith('rankings')
  })

  it('calls onViewChange with "heya" when Heya tab is clicked', () => {
    const onViewChange = vi.fn()
    render(<ViewTabs activeView="rankings" onViewChange={onViewChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Heya' }))
    expect(onViewChange).toHaveBeenCalledWith('heya')
  })

  it('has a tablist role on the wrapper', () => {
    render(<ViewTabs activeView="rankings" onViewChange={vi.fn()} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})
