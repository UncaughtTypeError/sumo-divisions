import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('should return null when bashoResults is null', () => {
    const { container } = render(
      <BashoWinners
        bashoResults={null}
        selectedRank="Yokozuna"
        selectedApiDivision="Makuuchi"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render yusho winner for Makuuchi', () => {
    render(
      <BashoWinners
        bashoResults={mockBashoResults}
        selectedRank="Yokozuna"
        selectedApiDivision="Makuuchi"
      />
    )
    expect(screen.getByText('Yusho Winner')).toBeInTheDocument()
    expect(screen.getByText('Terunofuji')).toBeInTheDocument()
    expect(screen.getByText('照ノ富士')).toBeInTheDocument()
  })

  it('should render yusho winner for Juryo', () => {
    render(
      <BashoWinners
        bashoResults={mockBashoResults}
        selectedRank="Juryo"
        selectedApiDivision="Juryo"
      />
    )
    expect(screen.getByText('Mitoryu')).toBeInTheDocument()
    expect(screen.getByText('水戸龍')).toBeInTheDocument()
  })

  it('should render special prizes for Makuuchi', () => {
    render(
      <BashoWinners
        bashoResults={mockBashoResults}
        selectedRank="Yokozuna"
        selectedApiDivision="Makuuchi"
      />
    )
    expect(screen.getByText('Special Prizes')).toBeInTheDocument()
    expect(screen.getByText('殊勲賞')).toBeInTheDocument()
    expect(screen.getByText('敢闘賞')).toBeInTheDocument()
    expect(screen.getByText('技能賞')).toBeInTheDocument()
  })

  it('should not render special prizes for non-Makuuchi divisions', () => {
    render(
      <BashoWinners
        bashoResults={mockBashoResults}
        selectedRank="Juryo"
        selectedApiDivision="Juryo"
      />
    )
    expect(screen.queryByText('Special Prizes')).not.toBeInTheDocument()
  })

  it('should render trophy icon for yusho', () => {
    render(
      <BashoWinners
        bashoResults={mockBashoResults}
        selectedRank="Yokozuna"
        selectedApiDivision="Makuuchi"
      />
    )
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('should render yusho winner rank when available', () => {
    render(
      <BashoWinners
        bashoResults={mockBashoResults}
        selectedRank="Yokozuna"
        selectedApiDivision="Makuuchi"
      />
    )
    expect(screen.getByText('Yokozuna 1 East')).toBeInTheDocument()
  })

  it('should render special prize winners with abbreviated rank', () => {
    render(
      <BashoWinners
        bashoResults={mockBashoResults}
        selectedRank="Yokozuna"
        selectedApiDivision="Makuuchi"
      />
    )
    expect(screen.getByText('Onosato')).toBeInTheDocument()
    expect(screen.getByText('Wakamotoharu')).toBeInTheDocument()
    expect(screen.getByText('Abi')).toBeInTheDocument()
  })

  it('should return null when no yusho and no special prizes', () => {
    const emptyResults = {
      yusho: [],
      specialPrizes: [],
    }
    const { container } = render(
      <BashoWinners
        bashoResults={emptyResults}
        selectedRank="Yokozuna"
        selectedApiDivision="Makuuchi"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should handle missing yusho for division', () => {
    const resultsWithoutMakuuchiYusho = {
      yusho: [{ type: 'Juryo', rikishiId: 2, shikonaEn: 'Mitoryu', shikonaJp: '水戸龍' }],
      specialPrizes: mockBashoResults.specialPrizes,
    }
    render(
      <BashoWinners
        bashoResults={resultsWithoutMakuuchiYusho}
        selectedRank="Yokozuna"
        selectedApiDivision="Makuuchi"
      />
    )
    expect(screen.queryByText('Yusho Winner')).not.toBeInTheDocument()
    expect(screen.getByText('Special Prizes')).toBeInTheDocument()
  })
})
