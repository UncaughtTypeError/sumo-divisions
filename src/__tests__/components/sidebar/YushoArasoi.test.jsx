import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import YushoArasoi from '../../../components/sidebar/YushoArasoi'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeWrestler = (id, wins, losses, absences = 0, rankValue = id, overrides = {}) => ({
  rikishiID: id,
  shikonaEn: `Wrestler${id}`,
  rank: `Maegashira ${id} East`,
  wins,
  losses,
  absences,
  rankValue,
  record: [],
  ...overrides,
})

// Day 7, Makuuchi: remaining = 15-7 = 8 for each active wrestler.
// Leader 6W; challenger 4W → 4+8=12 ≥ 6 → still in contention → race view (not decided).
const defaultProps = {
  wrestlers: [
    makeWrestler(1, 6, 1, 0, 1),
    makeWrestler(2, 4, 3, 0, 5),
  ],
  maxDay: 7,
  division: 'Makuuchi',
  bashoResults: null,
  onWrestlerClick: vi.fn(),
}

// ─── Null / early-return conditions ───────────────────────────────────────────

describe('YushoArasoi', () => {
  describe('null conditions', () => {
    it('renders nothing when maxDay is 0', () => {
      const { container } = render(<YushoArasoi {...defaultProps} maxDay={0} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when wrestlers is empty', () => {
      const { container } = render(<YushoArasoi {...defaultProps} wrestlers={[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when wrestlers is null', () => {
      const { container } = render(<YushoArasoi {...defaultProps} wrestlers={null} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when bashoResults contains official yusho for the division', () => {
      const bashoResults = {
        yusho: [{ type: 'Makuuchi', rikishiId: 1, shikonaEn: 'Wrestler1' }],
      }
      const { container } = render(
        <YushoArasoi {...defaultProps} bashoResults={bashoResults} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('renders when bashoResults has yusho for a different division', () => {
      const bashoResults = {
        yusho: [{ type: 'Juryo', rikishiId: 99, shikonaEn: 'Someone' }],
      }
      render(<YushoArasoi {...defaultProps} bashoResults={bashoResults} />)
      expect(screen.getByText('優勝争い')).toBeInTheDocument()
    })

    it('renders nothing when all wrestlers are eliminated (no contenders)', () => {
      // Day 15, leader has 15W — no one else can reach them, but there is still
      // exactly one contender (the leader itself) so it won't be null.
      // For a true empty case we need 0 wrestlers to begin with:
      const { container } = render(<YushoArasoi {...defaultProps} wrestlers={[]} />)
      expect(container.firstChild).toBeNull()
    })
  })

  // ─── Header ───────────────────────────────────────────────────────────────────

  describe('header', () => {
    it('renders Japanese and English headings', () => {
      render(<YushoArasoi {...defaultProps} />)
      expect(screen.getByText('優勝争い')).toBeInTheDocument()
      expect(screen.getByText('Yusho Arasoi')).toBeInTheDocument()
    })

    it('starts expanded with aria-expanded="true"', () => {
      render(<YushoArasoi {...defaultProps} />)
      const btn = screen.getByRole('button', { name: 'Collapse Yusho Arasoi' })
      expect(btn).toHaveAttribute('aria-expanded', 'true')
    })

    it('collapses when header is clicked and updates aria attributes', async () => {
      const user = userEvent.setup()
      render(<YushoArasoi {...defaultProps} />)
      const btn = screen.getByRole('button', { name: 'Collapse Yusho Arasoi' })
      await user.click(btn)
      expect(screen.getByRole('button', { name: 'Expand Yusho Arasoi' })).toHaveAttribute(
        'aria-expanded', 'false'
      )
    })

    it('re-expands when header is clicked twice', async () => {
      const user = userEvent.setup()
      render(<YushoArasoi {...defaultProps} />)
      const btn = screen.getByRole('button', { name: 'Collapse Yusho Arasoi' })
      await user.click(btn)
      await user.click(screen.getByRole('button', { name: 'Expand Yusho Arasoi' }))
      expect(screen.getByRole('button', { name: 'Collapse Yusho Arasoi' })).toHaveAttribute(
        'aria-expanded', 'true'
      )
    })
  })

  // ─── Active race ──────────────────────────────────────────────────────────────

  describe('active race', () => {
    it('renders the leader win count label', () => {
      render(<YushoArasoi {...defaultProps} />)
      expect(screen.getByText('6 Wins')).toBeInTheDocument()
    })

    it('renders the leader wrestler name', () => {
      render(<YushoArasoi {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Wrestler1/ })).toBeInTheDocument()
    })

    it('renders challenger group with win label', () => {
      render(<YushoArasoi {...defaultProps} />)
      expect(screen.getByText('4 Wins')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Wrestler2/ })).toBeInTheDocument()
    })

    it('renders at most 4 challenger groups', () => {
      // Day 7, remaining=8. Leader 7W. Four visible challenger groups (5W–2W); 1W group hidden.
      const wrestlers = [
        makeWrestler(1, 7, 0, 0, 1), // leader
        makeWrestler(2, 5, 2, 0, 2), // challenger 1 — 5+8=13≥7 ✓
        makeWrestler(3, 4, 3, 0, 3), // challenger 2
        makeWrestler(4, 3, 4, 0, 4), // challenger 3
        makeWrestler(5, 2, 5, 0, 5), // challenger 4 (last visible)
        makeWrestler(6, 1, 6, 0, 6), // challenger 5 — 1+8=9≥7 ✓ but slice(0,4) hides it
      ]
      render(<YushoArasoi {...defaultProps} wrestlers={wrestlers} maxDay={7} />)
      expect(screen.queryByText('1 Wins')).not.toBeInTheDocument()
      expect(screen.getByText('2 Wins')).toBeInTheDocument()
    })

    it('does not show the playoff badge when leaders have remaining bouts', () => {
      render(<YushoArasoi {...defaultProps} />)
      expect(screen.queryByText(/Ketteisen/)).not.toBeInTheDocument()
    })
  })

  // ─── Clinched ─────────────────────────────────────────────────────────────────

  describe('clinched', () => {
    const clinchedProps = {
      wrestlers: [
        makeWrestler(1, 13, 1, 0, 1),
        makeWrestler(2,  8, 6, 0, 5),
        makeWrestler(3,  7, 7, 0, 9),
      ],
      maxDay: 14,
      division: 'Makuuchi',
      bashoResults: null,
      onWrestlerClick: vi.fn(),
    }

    it('renders trophy icon and "Yusho — Clinched" label', () => {
      render(<YushoArasoi {...clinchedProps} />)
      expect(screen.getByText('🏆')).toBeInTheDocument()
      expect(screen.getByText('Yusho — Clinched')).toBeInTheDocument()
    })

    it('renders the winner name', () => {
      render(<YushoArasoi {...clinchedProps} />)
      expect(screen.getByRole('button', { name: 'Wrestler1' })).toBeInTheDocument()
    })

    it('does not render challenger group labels', () => {
      render(<YushoArasoi {...clinchedProps} />)
      expect(screen.queryByText(/Wins/)).not.toBeInTheDocument()
    })

    it('calls onWrestlerClick with the winner when clicked', async () => {
      const onWrestlerClick = vi.fn()
      const user = userEvent.setup()
      render(<YushoArasoi {...clinchedProps} onWrestlerClick={onWrestlerClick} />)
      await user.click(screen.getByRole('button', { name: 'Wrestler1' }))
      expect(onWrestlerClick).toHaveBeenCalledTimes(1)
      expect(onWrestlerClick).toHaveBeenCalledWith(
        expect.objectContaining({ rikishiID: 1, wins: 13 })
      )
    })
  })

  // ─── Playoff ──────────────────────────────────────────────────────────────────

  describe('playoff', () => {
    // Lower division, two wrestlers both 7-0, tournament over → playoff
    const playoffProps = {
      wrestlers: [
        makeWrestler(1, 7, 0, 0, 1),
        makeWrestler(2, 7, 0, 0, 5),
      ],
      maxDay: 14,
      division: 'Sandanme',
      bashoResults: null,
      onWrestlerClick: vi.fn(),
    }

    it('shows the ketteisen badge when all tied leaders have 0 remaining bouts', () => {
      render(<YushoArasoi {...playoffProps} />)
      expect(screen.getByText(/Ketteisen/)).toBeInTheDocument()
      expect(screen.getByText(/Playoff/)).toBeInTheDocument()
    })

    it('shows both tied leaders in the leader group', () => {
      render(<YushoArasoi {...playoffProps} />)
      expect(screen.getByRole('button', { name: /Wrestler1/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Wrestler2/ })).toBeInTheDocument()
    })

    it('does not show the badge when leaders still have remaining bouts', () => {
      // Same tie but tournament not over yet (day 10, lower div wrestlers at 5-0 have 2 left)
      const ongoingProps = {
        ...playoffProps,
        wrestlers: [
          makeWrestler(1, 5, 0, 0, 1),
          makeWrestler(2, 5, 0, 0, 5),
        ],
        maxDay: 10,
      }
      render(<YushoArasoi {...ongoingProps} />)
      expect(screen.queryByText(/Ketteisen/)).not.toBeInTheDocument()
    })
  })

  // ─── Record symbols ───────────────────────────────────────────────────────────

  describe('record symbols', () => {
    const record = [
      { result: 'win' },
      { result: 'loss' },
      { result: 'fusen win' },
      { result: 'fusen loss' },
      { result: 'absent' },  // should be ignored
    ]
    const wrestler = makeWrestler(1, 10, 4, 0, 1, { record })

    it('renders a shiroboshi (circle) for a regular win', () => {
      const { container } = render(
        <YushoArasoi {...defaultProps} wrestlers={[wrestler, makeWrestler(2, 5, 9, 0, 5)]} />
      )
      expect(container.querySelector('[class*="shiroboshi"]')).toBeInTheDocument()
    })

    it('renders a kuroboshi (circle) for a regular loss', () => {
      const { container } = render(
        <YushoArasoi {...defaultProps} wrestlers={[wrestler, makeWrestler(2, 5, 9, 0, 5)]} />
      )
      expect(container.querySelector('[class*="kuroboshi"]')).toBeInTheDocument()
    })

    it('renders a fusenshoSquare for a fusen win', () => {
      const { container } = render(
        <YushoArasoi {...defaultProps} wrestlers={[wrestler, makeWrestler(2, 5, 9, 0, 5)]} />
      )
      expect(container.querySelector('[class*="fusenshoSquare"]')).toBeInTheDocument()
    })

    it('renders a fusenpaiSquare for a fusen loss', () => {
      const { container } = render(
        <YushoArasoi {...defaultProps} wrestlers={[wrestler, makeWrestler(2, 5, 9, 0, 5)]} />
      )
      expect(container.querySelector('[class*="fusenpaiSquare"]')).toBeInTheDocument()
    })

    it('does not render an icon for absent entries', () => {
      // 4 result entries (win, loss, fusen win, fusen loss) + 1 absent = 4 icons total
      const { container } = render(
        <YushoArasoi {...defaultProps} wrestlers={[wrestler, makeWrestler(2, 5, 9, 0, 5)]} />
      )
      const allIcons = container.querySelectorAll(
        '[class*="shiroboshi"],[class*="kuroboshi"],[class*="fusenshoSquare"],[class*="fusenpaiSquare"]'
      )
      expect(allIcons.length).toBe(4)
    })

    it('renders icons in chronological order', () => {
      const { container } = render(
        <YushoArasoi {...defaultProps} wrestlers={[wrestler, makeWrestler(2, 5, 9, 0, 5)]} />
      )
      const icons = container.querySelectorAll(
        '[class*="shiroboshi"],[class*="kuroboshi"],[class*="fusenshoSquare"],[class*="fusenpaiSquare"]'
      )
      // Order: win, loss, fusen win, fusen loss
      expect(icons[0].className).toMatch(/shiroboshi/)
      expect(icons[1].className).toMatch(/kuroboshi/)
      expect(icons[2].className).toMatch(/fusenshoSquare/)
      expect(icons[3].className).toMatch(/fusenpaiSquare/)
    })
  })

  // ─── Rank abbreviation ────────────────────────────────────────────────────────

  describe('rank abbreviation', () => {
    // defaultProps is day 7, Makuuchi — 6W leader vs 4W challenger (not decided).
    // Rank abbreviation only appears in WrestlerBtn (leader/challenger rows), not clinched view.

    it('abbreviates East suffix to "e"', () => {
      const wrestler = makeWrestler(1, 6, 1, 0, 1, { rank: 'Yokozuna 1 East' })
      render(<YushoArasoi {...defaultProps} wrestlers={[wrestler, makeWrestler(2, 4, 3, 0, 5)]} />)
      expect(screen.getByText('Y1e')).toBeInTheDocument()
    })

    it('abbreviates West suffix to "w"', () => {
      const wrestler = makeWrestler(1, 6, 1, 0, 1, { rank: 'Maegashira 10 West' })
      render(<YushoArasoi {...defaultProps} wrestlers={[wrestler, makeWrestler(2, 4, 3, 0, 5)]} />)
      expect(screen.getByText('M10w')).toBeInTheDocument()
    })

    it('preserves non-East/West suffix (e.g. Tsukedashi "TD")', () => {
      // Makushita, day 14: leader 3W 3L (1 remaining), challenger 2W 3L (2 remaining → 4≥3 ✓).
      render(
        <YushoArasoi
          {...defaultProps}
          wrestlers={[
            makeWrestler(1, 3, 3, 0, 1, { rank: 'Makushita 60 TD' }),
            makeWrestler(2, 2, 3, 0, 5),
          ]}
          division="Makushita"
          maxDay={14}
        />
      )
      expect(screen.getByText('M60TD')).toBeInTheDocument()
    })

    it('renders no rank span when rank is null', () => {
      const wrestler = makeWrestler(1, 6, 1, 0, 1, { rank: null })
      render(<YushoArasoi {...defaultProps} wrestlers={[wrestler, makeWrestler(2, 4, 3, 0, 5)]} />)
      const nameBtn = screen.getByRole('button', { name: 'Wrestler1' })
      expect(nameBtn).toBeInTheDocument()
    })
  })

  // ─── Click handlers ───────────────────────────────────────────────────────────

  describe('click handlers', () => {
    it('calls onWrestlerClick with wrestler data when leader is clicked', async () => {
      const onWrestlerClick = vi.fn()
      const user = userEvent.setup()
      render(<YushoArasoi {...defaultProps} onWrestlerClick={onWrestlerClick} />)
      await user.click(screen.getByRole('button', { name: /Wrestler1/ }))
      expect(onWrestlerClick).toHaveBeenCalledWith(
        expect.objectContaining({ rikishiID: 1, wins: 6 })
      )
    })

    it('calls onWrestlerClick with wrestler data when challenger is clicked', async () => {
      const onWrestlerClick = vi.fn()
      const user = userEvent.setup()
      render(<YushoArasoi {...defaultProps} onWrestlerClick={onWrestlerClick} />)
      await user.click(screen.getByRole('button', { name: /Wrestler2/ }))
      expect(onWrestlerClick).toHaveBeenCalledWith(
        expect.objectContaining({ rikishiID: 2, wins: 4 })
      )
    })

    it('does not throw when onWrestlerClick is not provided', async () => {
      const user = userEvent.setup()
      render(<YushoArasoi {...defaultProps} onWrestlerClick={undefined} />)
      await user.click(screen.getByRole('button', { name: /Wrestler1/ }))
    })
  })
})
