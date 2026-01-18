import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import WrestlerGrid from '../../../components/sidebar/WrestlerGrid'

// Mock WrestlerRow
vi.mock('../../../components/sidebar/WrestlerRow', () => ({
  default: ({ wrestler, onClick }) => (
    <div data-testid={`wrestler-row-${wrestler.rikishiID}`} onClick={() => onClick(wrestler)}>
      {wrestler.shikonaEn}
    </div>
  ),
}))

describe('WrestlerGrid', () => {
  const mockWrestlers = [
    { rikishiID: 1, shikonaEn: 'Terunofuji', rank: 'Yokozuna 1 East' },
    { rikishiID: 2, shikonaEn: 'Kotozakura', rank: 'Ozeki 1 East' },
  ]

  it('should render empty message when no wrestlers', () => {
    render(<WrestlerGrid wrestlers={[]} side="East" onWrestlerClick={() => {}} />)
    expect(screen.getByText('No rikishi in East')).toBeInTheDocument()
  })

  it('should render empty message when wrestlers is null', () => {
    render(<WrestlerGrid wrestlers={null} side="West" onWrestlerClick={() => {}} />)
    expect(screen.getByText('No rikishi in West')).toBeInTheDocument()
  })

  it('should render side header', () => {
    render(<WrestlerGrid wrestlers={mockWrestlers} side="East" onWrestlerClick={() => {}} />)
    expect(screen.getByText('East')).toBeInTheDocument()
  })

  it('should render wrestler count', () => {
    render(<WrestlerGrid wrestlers={mockWrestlers} side="East" onWrestlerClick={() => {}} />)
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('should render all wrestlers', () => {
    render(<WrestlerGrid wrestlers={mockWrestlers} side="East" onWrestlerClick={() => {}} />)
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.getByText('Kotozakura')).toBeInTheDocument()
  })

  it('should pass onWrestlerClick to WrestlerRow components', () => {
    const onWrestlerClick = vi.fn()
    render(<WrestlerGrid wrestlers={mockWrestlers} side="East" onWrestlerClick={onWrestlerClick} />)

    screen.getByTestId('wrestler-row-1').click()
    expect(onWrestlerClick).toHaveBeenCalledWith(mockWrestlers[0])
  })
})
