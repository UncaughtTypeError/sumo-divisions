import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('should not render tooltip content before hover', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument()
  })

  it('should show tooltip content on mouseEnter', () => {
    const { container } = render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(container.firstChild)
    expect(screen.getByText('Tooltip text')).toBeInTheDocument()
  })

  it('should hide tooltip on mouseLeave', () => {
    const { container } = render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(container.firstChild)
    expect(screen.getByText('Tooltip text')).toBeInTheDocument()
    fireEvent.mouseLeave(container.firstChild)
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument()
  })

  it('should show complex tooltip content on hover', () => {
    const { container } = render(
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
    fireEvent.mouseEnter(container.firstChild)
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('should wrap children in a span', () => {
    const { container } = render(
      <Tooltip content="Test">
        <button>Button</button>
      </Tooltip>
    )
    expect(container.querySelector('span')).toBeInTheDocument()
  })

  it('should render tooltip via portal outside the container', () => {
    const { container } = render(
      <Tooltip content="Portal text">
        <button>Hover</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(container.firstChild)
    const tooltip = screen.getByText('Portal text')
    expect(container.contains(tooltip)).toBe(false)
    expect(document.body.contains(tooltip)).toBe(true)
  })

  it('should apply top class by default', () => {
    const { container } = render(
      <Tooltip content="Test">
        <button>Button</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(container.firstChild)
    const tooltip = screen.getByText('Test')
    // CSS modules produce hashed names like "_top_abc123"; match the pattern
    expect(tooltip.className).toMatch(/_top_/)
  })

  it('should apply the given position class', () => {
    const { container } = render(
      <Tooltip content="Test" position="right">
        <button>Button</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(container.firstChild)
    const tooltip = screen.getByText('Test')
    expect(tooltip.className).toMatch(/_right_/)
    expect(tooltip.className).not.toMatch(/_top_/)
  })
})
