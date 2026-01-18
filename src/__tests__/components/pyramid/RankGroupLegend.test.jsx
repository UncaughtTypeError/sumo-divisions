import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RankGroupLegend from '../../../components/pyramid/RankGroupLegend'
import { RANK_GROUPS } from '../../../utils/constants'

describe('RankGroupLegend', () => {
  it('should render all rank group names', () => {
    render(<RankGroupLegend />)

    RANK_GROUPS.forEach((group) => {
      expect(screen.getByText(group.name)).toBeInTheDocument()
    })
  })

  it('should render all rank group descriptions', () => {
    render(<RankGroupLegend />)

    RANK_GROUPS.forEach((group) => {
      expect(screen.getByText(`(${group.description})`)).toBeInTheDocument()
    })
  })

  it('should render Sanyaku group', () => {
    render(<RankGroupLegend />)
    expect(screen.getByText("San'yaku")).toBeInTheDocument()
    expect(screen.getByText('(Three Ranks)')).toBeInTheDocument()
  })

  it('should render Sekitori group', () => {
    render(<RankGroupLegend />)
    expect(screen.getByText('Sekitori')).toBeInTheDocument()
    expect(screen.getByText('(Professionals)')).toBeInTheDocument()
  })

  it('should render Minarai group', () => {
    render(<RankGroupLegend />)
    expect(screen.getByText('Minarai')).toBeInTheDocument()
    expect(screen.getByText('(Apprentices)')).toBeInTheDocument()
  })

  it('should render exactly 3 groups', () => {
    const { container } = render(<RankGroupLegend />)
    const groups = RANK_GROUPS.map((g) => screen.getByText(g.name))
    expect(groups).toHaveLength(3)
  })
})
