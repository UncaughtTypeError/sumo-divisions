import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RankCard from '../../../components/pyramid/RankCard'
import { RANKS } from '../../../utils/constants'

describe('RankCard', () => {
  it('should render rank text', () => {
    render(<RankCard rank="Yokozuna" color="yokozuna" onClick={() => {}} />)
    expect(screen.getByText('Yokozuna')).toBeInTheDocument()
  })

  it('should render as a button', () => {
    render(<RankCard rank="Ozeki" color="sanyaku" onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<RankCard rank="Sekiwake" color="sanyaku" onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should apply correct background color style', () => {
    render(<RankCard rank="Komusubi" color="sanyaku" onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ backgroundColor: 'var(--color-sanyaku)' })
  })

  it('should render all rank types correctly', () => {
    const ranks = [
      { rank: RANKS.YOKOZUNA, color: 'yokozuna' },
      { rank: RANKS.OZEKI, color: 'sanyaku' },
      { rank: RANKS.MAEGASHIRA, color: 'makuuchi' },
      { rank: RANKS.JURYO, color: 'juryo' },
    ]

    ranks.forEach(({ rank, color }) => {
      const { unmount } = render(
        <RankCard rank={rank} color={color} onClick={() => {}} />
      )
      expect(screen.getByText(rank)).toBeInTheDocument()
      unmount()
    })
  })
})
