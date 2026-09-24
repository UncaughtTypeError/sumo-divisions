import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WrestlerCompactGrid from '../../../components/sidebar/WrestlerCompactGrid'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeWrestler = (id, rank, rankValue, wins = 0, losses = 0, absences = 0, overrides = {}) => ({
  rikishiID: id,
  shikonaEn: `Wrestler${id}`,
  rank,
  rankValue,
  wins,
  losses,
  absences,
  record: [],
  ...overrides,
})

// A no-op day-enrichment passthrough — BanzukeTab normally supplies this.
const identityEnrich = (wrestlers) => wrestlers

const defaultProps = {
  rankGroups: [
    {
      rank: 'Maegashira',
      rankInfo: null,
      east: [
        makeWrestler(1, 'Maegashira 1 East', 5.1, 6, 5), // undecided
        makeWrestler(2, 'Maegashira 2 East', 5.2, 3, 9), // make-koshi
      ],
      west: [
        makeWrestler(3, 'Maegashira 1 West', 5.15, 4, 4), // undecided
        makeWrestler(4, 'Maegashira 2 West', 5.25, 9, 3), // kachi-koshi
      ],
    },
  ],
  enrichForDay: identityEnrich,
  searchQuery: '',
  sortOrder: 'rank-asc',
  onWrestlerClick: vi.fn(),
  color: 'makuuchi',
  division: 'Makuuchi',
  rikishiMap: new Map(),
}

describe('WrestlerCompactGrid', () => {
  describe('empty state', () => {
    it('renders a message when there are no rank groups', () => {
      render(<WrestlerCompactGrid {...defaultProps} rankGroups={[]} />)
      expect(screen.getByText('No rikishi found')).toBeInTheDocument()
    })

    it('renders a message when the search query matches nothing', () => {
      render(<WrestlerCompactGrid {...defaultProps} searchQuery="nobody-has-this-name" />)
      expect(screen.getByText('No rikishi found')).toBeInTheDocument()
    })
  })

  describe('pairing', () => {
    it('pairs east and west wrestlers by rank order into rows', () => {
      render(<WrestlerCompactGrid {...defaultProps} />)
      expect(screen.getByText('Wrestler1')).toBeInTheDocument()
      expect(screen.getByText('Wrestler2')).toBeInTheDocument()
      expect(screen.getByText('Wrestler3')).toBeInTheDocument()
      expect(screen.getByText('Wrestler4')).toBeInTheDocument()
    })

    it('leaves an empty cell when one side has no wrestler at that rank', () => {
      const rankGroups = [
        {
          rank: 'Maegashira',
          east: [makeWrestler(1, 'Maegashira 1 East', 5.1, 5, 5)],
          west: [],
        },
      ]
      const { container } = render(<WrestlerCompactGrid {...defaultProps} rankGroups={rankGroups} />)
      expect(screen.getByText('Wrestler1')).toBeInTheDocument()
      // 6 cells total, half of them (the whole west side) render as empty <td>s
      const emptyCells = [...container.querySelectorAll('td')].filter((td) => td.textContent === '')
      expect(emptyCells.length).toBeGreaterThan(0)
    })
  })

  describe('record + KK/MK status', () => {
    it('shows the win-loss-absence record for each side', () => {
      render(<WrestlerCompactGrid {...defaultProps} />)
      expect(screen.getByText('6-5-0')).toBeInTheDocument()
      expect(screen.getByText('4-4-0')).toBeInTheDocument()
    })

    it('shows an MK badge for a make-koshi record', () => {
      render(<WrestlerCompactGrid {...defaultProps} />)
      expect(screen.getByText('MK')).toBeInTheDocument()
    })

    it('shows a KK badge for a kachi-koshi record', () => {
      render(<WrestlerCompactGrid {...defaultProps} />)
      expect(screen.getByText('KK')).toBeInTheDocument()
    })

    it('shows no badge for an undecided record', () => {
      render(<WrestlerCompactGrid {...defaultProps} />)
      // Wrestler1 (6-5) and Wrestler3 (4-4) are both still undecided —
      // only Wrestler2 (MK) and Wrestler4 (KK) have clinched a badge
      expect(screen.queryAllByText(/^(KK|MK)$/)).toHaveLength(2)
    })
  })

  describe('rank badges', () => {
    it('shows an East/West designation on the rank badge for each side', () => {
      render(<WrestlerCompactGrid {...defaultProps} />)
      expect(screen.getAllByText('E').length).toBeGreaterThan(0)
      expect(screen.getAllByText('W').length).toBeGreaterThan(0)
    })

    it('shows the individual rank label, not just the tier', () => {
      render(<WrestlerCompactGrid {...defaultProps} />)
      // "M1" shows once per side (east + west), same for "M2"
      expect(screen.getAllByText('M1')).toHaveLength(2)
      expect(screen.getAllByText('M2')).toHaveLength(2)
    })
  })

  describe('stable + country', () => {
    it('shows the stable badge from rikishiMap', () => {
      const rikishiMap = new Map([[1, { heya: 'Isegahama', shusshin: 'Mongolia' }]])
      render(<WrestlerCompactGrid {...defaultProps} rikishiMap={rikishiMap} />)
      expect(screen.getByText('Isegahama')).toBeInTheDocument()
    })

    it('shows the country code from rikishiMap when a flag is resolved', () => {
      const rikishiMap = new Map([[1, { heya: 'Isegahama', shusshin: 'Mongolia' }]])
      render(<WrestlerCompactGrid {...defaultProps} rikishiMap={rikishiMap} />)
      expect(screen.getByText('MGL')).toBeInTheDocument()
    })

    it('omits the stable badge when rikishiMap has no entry', () => {
      render(<WrestlerCompactGrid {...defaultProps} rikishiMap={new Map()} />)
      expect(screen.queryByText('Isegahama')).not.toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('calls onWrestlerClick with the wrestler when a name is clicked', async () => {
      const user = userEvent.setup()
      const onWrestlerClick = vi.fn()
      render(<WrestlerCompactGrid {...defaultProps} onWrestlerClick={onWrestlerClick} />)
      await user.click(screen.getByText('Wrestler1'))
      expect(onWrestlerClick).toHaveBeenCalledWith(
        expect.objectContaining({ rikishiID: 1, shikonaEn: 'Wrestler1' })
      )
    })
  })

  describe('search', () => {
    it('keeps a row if either side matches the search query', () => {
      // Wrestler1 (east) matches, its west pair (Wrestler3) does not — row stays
      render(<WrestlerCompactGrid {...defaultProps} searchQuery="Wrestler1" />)
      expect(screen.getByText('Wrestler1')).toBeInTheDocument()
      expect(screen.getByText('Wrestler3')).toBeInTheDocument()
      // the unrelated second row should be filtered out
      expect(screen.queryByText('Wrestler2')).not.toBeInTheDocument()
    })
  })

  describe('sort order', () => {
    const wideRankGroups = [
      {
        rank: 'Maegashira',
        east: [
          makeWrestler(1, 'Maegashira 1 East', 5.1),
          makeWrestler(2, 'Maegashira 2 East', 5.2),
        ],
        west: [],
      },
    ]

    it('orders rows ascending by rank by default', () => {
      const { container } = render(
        <WrestlerCompactGrid {...defaultProps} rankGroups={wideRankGroups} sortOrder="rank-asc" />
      )
      const names = [...container.querySelectorAll('tbody tr')].map((tr) => tr.textContent)
      expect(names[0]).toContain('Wrestler1')
      expect(names[1]).toContain('Wrestler2')
    })

    it('reverses row order for rank-desc', () => {
      const { container } = render(
        <WrestlerCompactGrid {...defaultProps} rankGroups={wideRankGroups} sortOrder="rank-desc" />
      )
      const names = [...container.querySelectorAll('tbody tr')].map((tr) => tr.textContent)
      expect(names[0]).toContain('Wrestler2')
      expect(names[1]).toContain('Wrestler1')
    })
  })

  describe('table header', () => {
    it('renders column headers for record, rank, east and west', () => {
      render(<WrestlerCompactGrid {...defaultProps} />)
      const headers = screen.getAllByRole('columnheader').map((th) => th.textContent)
      expect(headers).toEqual(['Record', 'Rank', 'East', 'West', 'Rank', 'Record'])
    })
  })

  describe('meta row mirroring', () => {
    // The DOM order of stable badge / flag / country code is always
    // stable→flag→code on both sides — it's CSS row-reverse (via the
    // metaRowReverse class) that visually flips east to read
    // code→flag→stable, mirroring around the table's centre.
    it('keeps stable→flag→code DOM order but applies row-reverse only on the east (centre-aligned) side', () => {
      const rikishiMap = new Map([
        [1, { heya: 'Isegahama', shusshin: 'Mongolia' }],
        [3, { heya: 'Sadogatake', shusshin: 'Japan' }],
      ])
      const { container } = render(<WrestlerCompactGrid {...defaultProps} rikishiMap={rikishiMap} />)
      const nameCells = container.querySelectorAll('[class*="nameCellInner"]')
      const eastCell = [...nameCells].find((el) => el.className.includes('nameAlignEnd'))
      const westCell = [...nameCells].find((el) => !el.className.includes('nameAlignEnd'))

      const eastMetaRow = eastCell.querySelector('[class*="metaRow"]')
      const westMetaRow = westCell.querySelector('[class*="metaRow"]')

      expect([...eastMetaRow.children].map((el) => el.textContent)).toEqual(['Isegahama', '', 'MGL'])
      expect([...westMetaRow.children].map((el) => el.textContent)).toEqual(['Sadogatake', '', 'JPN'])

      expect(eastMetaRow.className).toMatch(/metaRowReverse/)
      expect(westMetaRow.className).not.toMatch(/metaRowReverse/)
    })
  })

  describe('day filtering', () => {
    it('applies enrichForDay to each side before pairing', () => {
      const enrichForDay = vi.fn((wrestlers) => wrestlers)
      render(<WrestlerCompactGrid {...defaultProps} enrichForDay={enrichForDay} />)
      expect(enrichForDay).toHaveBeenCalledWith(defaultProps.rankGroups[0].east)
      expect(enrichForDay).toHaveBeenCalledWith(defaultProps.rankGroups[0].west)
    })

    it('reflects day-specific records supplied by enrichForDay', () => {
      const dayEnrich = (wrestlers) => wrestlers.map((w) => ({ ...w, wins: 1, losses: 0, absences: 0 }))
      render(<WrestlerCompactGrid {...defaultProps} enrichForDay={dayEnrich} />)
      expect(screen.getAllByText('1-0-0').length).toBeGreaterThan(0)
      expect(screen.queryByText('10-5-0')).not.toBeInTheDocument()
    })
  })
})
