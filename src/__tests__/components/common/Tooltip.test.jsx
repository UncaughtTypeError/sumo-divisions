import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Tooltip from '../../../components/common/Tooltip'

describe('Tooltip', () => {
  it('should render children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('should render tooltip content', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByText('Tooltip text')).toBeInTheDocument()
  })

  it('should render complex tooltip content', () => {
    render(
      <Tooltip
        content={
          <>
            <strong>Title</strong>
            <span>Description</span>
          </>
        }
      >
        <span>Trigger</span>
      </Tooltip>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('should wrap children in span element', () => {
    const { container } = render(
      <Tooltip content="Test">
        <button>Button</button>
      </Tooltip>
    )
    expect(container.querySelector('span')).toBeInTheDocument()
  })
})
