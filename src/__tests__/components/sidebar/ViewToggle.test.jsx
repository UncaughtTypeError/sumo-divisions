import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ViewToggle from '../../../components/sidebar/ViewToggle'

describe('ViewToggle', () => {
  it('renders both card and grid buttons', () => {
    render(<ViewToggle value="card" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Card view' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Grid view' })).toBeInTheDocument()
  })

  it('marks the card button pressed when value is "card"', () => {
    render(<ViewToggle value="card" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Card view' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('marks the grid button pressed when value is "grid"', () => {
    render(<ViewToggle value="grid" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Card view' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with "grid" when the grid button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ViewToggle value="card" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Grid view' }))
    expect(onChange).toHaveBeenCalledWith('grid')
  })

  it('calls onChange with "card" when the card button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ViewToggle value="grid" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Card view' }))
    expect(onChange).toHaveBeenCalledWith('card')
  })
})
