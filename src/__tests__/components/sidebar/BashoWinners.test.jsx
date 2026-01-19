import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BashoWinners from '../../../components/sidebar/BashoWinners'

describe('BashoWinners', () => {
  const mockBashoResults = {
    yusho: [
      {
        type: 'Makuuchi',
        rikishiId: 1,
        shikonaEn: 'Terunofuji',
        shikonaJp: '照ノ富士',
        rank: 'Yokozuna 1 East',
      },
      {
        type: 'Juryo',
        rikishiId: 2,
        shikonaEn: 'Mitoryu',
        shikonaJp: '水戸龍',
        rank: 'Juryo 5 East',
      },
    ],
    specialPrizes: [
      { type: 'Shukun-sho', rikishiId: 3, shikonaEn: 'Onosato', rank: 'Ozeki 1 East' },
      { type: 'Kanto-sho', rikishiId: 4, shikonaEn: 'Wakamotoharu', rank: 'Maegashira 3 West' },
      { type: 'Gino-sho', rikishiId: 5, shikonaEn: 'Abi', rank: 'Maegashira 1 East' },
    ],
  }

  const mockAllWrestlers = [
    { rikishiID: 1, shikonaEn: 'Terunofuji', rank: 'Yokozuna 1 East', wins: 12, losses: 3 },
    { rikishiID: 2, shikonaEn: 'Mitoryu', rank: 'Juryo 5 East', wins: 10, losses: 5 },
    { rikishiID: 3, shikonaEn: 'Onosato', rank: 'Ozeki 1 East', wins: 11, losses: 4 },
    { rikishiID: 4, shikonaEn: 'Wakamotoharu', rank: 'Maegashira 3 West', wins: 9, losses: 6 },
    { rikishiID: 5, shikonaEn: 'Abi', rank: 'Maegashira 1 East', wins: 10, losses: 5 },
  ]

  const defaultProps = {
    bashoResults: mockBashoResults,
    selectedRank: 'Yokozuna',
    selectedApiDivision: 'Makuuchi',
    allWrestlers: mockAllWrestlers,
    onWrestlerClick: vi.fn(),
  }

  it('should return null when bashoResults is null', () => {
    const { container } = render(
      <BashoWinners {...defaultProps} bashoResults={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render yusho winner for Makuuchi', () => {
    render(<BashoWinners {...defaultProps} />)
    expect(screen.getByText('Yusho Winner')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Terunofuji' })).toBeInTheDocument()
    expect(screen.getByText('照ノ富士')).toBeInTheDocument()
  })

  it('should render yusho winner for Juryo', () => {
    render(
      <BashoWinners
        {...defaultProps}
        selectedRank="Juryo"
        selectedApiDivision="Juryo"
      />
    )
    expect(screen.getByRole('button', { name: 'Mitoryu' })).toBeInTheDocument()
    expect(screen.getByText('水戸龍')).toBeInTheDocument()
  })

  it('should render special prizes for Makuuchi', () => {
    render(<BashoWinners {...defaultProps} />)
    expect(screen.getByText('Special Prizes')).toBeInTheDocument()
    expect(screen.getByText('殊勲賞')).toBeInTheDocument()
    expect(screen.getByText('敢闘賞')).toBeInTheDocument()
    expect(screen.getByText('技能賞')).toBeInTheDocument()
  })

  it('should not render special prizes for non-Makuuchi divisions', () => {
    render(
      <BashoWinners
        {...defaultProps}
        selectedRank="Juryo"
        selectedApiDivision="Juryo"
      />
    )
    expect(screen.queryByText('Special Prizes')).not.toBeInTheDocument()
  })

  it('should render trophy icon for yusho', () => {
    render(<BashoWinners {...defaultProps} />)
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('should render yusho winner rank when available', () => {
    render(<BashoWinners {...defaultProps} />)
    expect(screen.getByText('Yokozuna 1 East')).toBeInTheDocument()
  })

  it('should render special prize winners with abbreviated rank', () => {
    render(<BashoWinners {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Onosato' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Wakamotoharu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abi' })).toBeInTheDocument()
  })

  it('should return null when no yusho and no special prizes', () => {
    const emptyResults = {
      yusho: [],
      specialPrizes: [],
    }
    const { container } = render(
      <BashoWinners {...defaultProps} bashoResults={emptyResults} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should handle missing yusho for division', () => {
    const resultsWithoutMakuuchiYusho = {
      yusho: [{ type: 'Juryo', rikishiId: 2, shikonaEn: 'Mitoryu', shikonaJp: '水戸龍' }],
      specialPrizes: mockBashoResults.specialPrizes,
    }
    render(
      <BashoWinners {...defaultProps} bashoResults={resultsWithoutMakuuchiYusho} />
    )
    expect(screen.queryByText('Yusho Winner')).not.toBeInTheDocument()
    expect(screen.getByText('Special Prizes')).toBeInTheDocument()
  })

  describe('click functionality', () => {
    it('should call onWrestlerClick with full wrestler data when yusho winner is clicked', async () => {
      const onWrestlerClick = vi.fn()
      const user = userEvent.setup()

      render(<BashoWinners {...defaultProps} onWrestlerClick={onWrestlerClick} />)

      await user.click(screen.getByRole('button', { name: 'Terunofuji' }))

      expect(onWrestlerClick).toHaveBeenCalledTimes(1)
      expect(onWrestlerClick).toHaveBeenCalledWith(
        expect.objectContaining({
          rikishiID: 1,
          shikonaEn: 'Terunofuji',
          wins: 12,
          losses: 3,
        })
      )
    })

    it('should call onWrestlerClick with full wrestler data when special prize winner is clicked', async () => {
      const onWrestlerClick = vi.fn()
      const user = userEvent.setup()

      render(<BashoWinners {...defaultProps} onWrestlerClick={onWrestlerClick} />)

      await user.click(screen.getByRole('button', { name: 'Onosato' }))

      expect(onWrestlerClick).toHaveBeenCalledTimes(1)
      expect(onWrestlerClick).toHaveBeenCalledWith(
        expect.objectContaining({
          rikishiID: 3,
          shikonaEn: 'Onosato',
          wins: 11,
          losses: 4,
        })
      )
    })

    it('should not call onWrestlerClick when wrestler is not in allWrestlers', async () => {
      const onWrestlerClick = vi.fn()
      const user = userEvent.setup()

      render(
        <BashoWinners
          {...defaultProps}
          allWrestlers={[]}
          onWrestlerClick={onWrestlerClick}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Terunofuji' }))

      expect(onWrestlerClick).not.toHaveBeenCalled()
    })

    it('should not call onWrestlerClick when onWrestlerClick is not provided', async () => {
      const user = userEvent.setup()

      render(<BashoWinners {...defaultProps} onWrestlerClick={undefined} />)

      // Should not throw when clicking
      await user.click(screen.getByRole('button', { name: 'Terunofuji' }))
    })
  })
})
