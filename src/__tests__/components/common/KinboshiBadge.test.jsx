import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import KinboshiBadge, { KINBOSHI_TYPES } from '../../../components/common/KinboshiBadge'

describe('KinboshiBadge', () => {
  it('renders star with count for kinboshi won', () => {
    render(<KinboshiBadge type={KINBOSHI_TYPES.WON} count={3} />)
    expect(screen.getByText('★3')).toBeInTheDocument()
  })

  it('renders star with count for kinboshi given', () => {
    render(<KinboshiBadge type={KINBOSHI_TYPES.GIVEN} count={7} />)
    expect(screen.getByText('★7')).toBeInTheDocument()
  })

  it('renders count of 1', () => {
    render(<KinboshiBadge type={KINBOSHI_TYPES.WON} count={1} />)
    expect(screen.getByText('★1')).toBeInTheDocument()
  })

  it('shows Kinboshi tooltip for won type on hover', () => {
    render(<KinboshiBadge type={KINBOSHI_TYPES.WON} count={2} />)
    fireEvent.mouseEnter(screen.getByText('★2').closest('[class*="tooltipWrapper"]'))
    expect(screen.getByText('Kinboshi')).toBeInTheDocument()
    expect(screen.getByText('金星')).toBeInTheDocument()
    expect(screen.getByText('Gold star for defeating a Yokozuna')).toBeInTheDocument()
  })

  it('shows Kinboshi Given tooltip for given type on hover', () => {
    render(<KinboshiBadge type={KINBOSHI_TYPES.GIVEN} count={5} />)
    fireEvent.mouseEnter(screen.getByText('★5').closest('[class*="tooltipWrapper"]'))
    expect(screen.getByText('Kinboshi Given')).toBeInTheDocument()
    expect(screen.getByText('金星')).toBeInTheDocument()
    expect(screen.getByText('Gold star given to Maegashira opponent')).toBeInTheDocument()
  })
})
