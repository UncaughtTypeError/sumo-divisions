import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WinLossChart from '../../../components/sidebar/WinLossChart'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeWrestler = (id, wins, losses, absences = 0, rankValue = id, overrides = {}) => ({
  rikishiID: id,
  shikonaEn: `Wrestler${id}`,
  rank: `Maegashira ${id} East`,
  wins,
  losses,
  absences,
  rankValue,
  ...overrides,
})

const defaultProps = {
  wrestlers: [
    makeWrestler(1, 11, 4, 0, 1),
    makeWrestler(2, 6, 9, 0, 2),
  ],
  division: 'Makuuchi',
  onWrestlerClick: vi.fn(),
}

// ─── Null conditions ────────────────────────────────────────────────────────────

describe('WinLossChart', () => {
  describe('null conditions', () => {
    it('renders nothing when wrestlers is empty', () => {
      const { container } = render(<WinLossChart {...defaultProps} wrestlers={[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when wrestlers is null', () => {
      const { container } = render(<WinLossChart {...defaultProps} wrestlers={null} />)
      expect(container.firstChild).toBeNull()
    })
  })

  // ─── Accordion ──────────────────────────────────────────────────────────────

  describe('accordion', () => {
    it('renders the header', () => {
      render(<WinLossChart {...defaultProps} />)
      expect(screen.getByText('勝敗表')).toBeInTheDocument()
      expect(screen.getByText('Win/Loss Chart')).toBeInTheDocument()
    })

    it('is collapsed by default', () => {
      render(<WinLossChart {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Expand Win\/Loss Chart/ })).toBeInTheDocument()
    })

    it('expands when the header is clicked', async () => {
      const user = userEvent.setup()
      render(<WinLossChart {...defaultProps} />)
      await user.click(screen.getByRole('button', { name: /Expand Win\/Loss Chart/ }))
      expect(screen.getByRole('button', { name: /Collapse Win\/Loss Chart/ })).toBeInTheDocument()
    })
  })

  // ─── Bars ───────────────────────────────────────────────────────────────────

  describe('bars', () => {
    it('renders one column button per wrestler', () => {
      render(<WinLossChart {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Wrestler1: 11-4' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Wrestler2: 6-9' })).toBeInTheDocument()
    })

    it('includes absences in the accessible record label', () => {
      render(
        <WinLossChart
          {...defaultProps}
          wrestlers={[makeWrestler(3, 5, 5, 5, 3)]}
        />
      )
      expect(screen.getByRole('button', { name: 'Wrestler3: 5-5-5' })).toBeInTheDocument()
    })

    it('renders absences as a separate, greyed-out segment below the loss bar', () => {
      const { container } = render(
        <WinLossChart
          division="Makuuchi"
          wrestlers={[makeWrestler(4, 3, 2, 6, 4)]}
          onWrestlerClick={vi.fn()}
        />
      )
      // maxScale 15, HALF_HEIGHT_PX 90 -> unitPx 6
      const lossBar = container.querySelector('[class*="lossBar"]')
      const absenceBar = container.querySelector('[class*="absenceBar"]')
      expect(lossBar.style.height).toBe('12px') // losses 2 * 6
      expect(absenceBar.style.height).toBe('36px') // absences 6 * 6
    })

    it('omits the absence segment when there are no absences', () => {
      const { container } = render(
        <WinLossChart {...defaultProps} division="Makuuchi" />
      )
      expect(container.querySelector('[class*="absenceBar"]')).not.toBeInTheDocument()
    })

    it('rounds the loss bar itself when there are no absences', () => {
      const { container } = render(
        <WinLossChart
          division="Makuuchi"
          wrestlers={[makeWrestler(5, 8, 7, 0, 5)]}
          onWrestlerClick={vi.fn()}
        />
      )
      const lossBar = container.querySelector('[class*="lossBar"]')
      expect(lossBar.className).toMatch(/barEnd/)
    })

    it('renders a fully-kyujo wrestler with no loss segment and a rounded absence segment', () => {
      const { container } = render(
        <WinLossChart
          division="Makuuchi"
          wrestlers={[makeWrestler(6, 0, 0, 15, 6)]}
          onWrestlerClick={vi.fn()}
        />
      )
      expect(container.querySelector('[class*="lossBar"]')).not.toBeInTheDocument()
      const absenceBar = container.querySelector('[class*="absenceBar"]')
      expect(absenceBar.style.height).toBe('90px') // absences 15 * 6, full half-height
      expect(absenceBar.className).toMatch(/barEnd/)
    })

    it('squares the loss/absence seam for a wrestler who went kyujo mid-basho', () => {
      const { container } = render(
        <WinLossChart
          division="Makuuchi"
          wrestlers={[makeWrestler(7, 6, 3, 4, 7)]}
          onWrestlerClick={vi.fn()}
        />
      )
      const lossBar = container.querySelector('[class*="lossBar"]')
      const absenceBar = container.querySelector('[class*="absenceBar"]')
      // the loss segment sits flush against the zero line, so only the far
      // (outer) end — the absence segment — should be rounded
      expect(lossBar.className).not.toMatch(/barEnd/)
      expect(absenceBar.className).toMatch(/barEnd/)
    })

    it('orders columns by rankValue ascending regardless of input order', () => {
      const wrestlers = [
        makeWrestler(1, 10, 5, 0, 5),
        makeWrestler(2, 8, 7, 0, 1),
      ]
      render(<WinLossChart wrestlers={wrestlers} onWrestlerClick={vi.fn()} />)
      const buttons = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-label')?.includes(':'))
      expect(buttons[0]).toHaveAccessibleName('Wrestler2: 8-7')
      expect(buttons[1]).toHaveAccessibleName('Wrestler1: 10-5')
    })

    it('calls onWrestlerClick with the wrestler when a column is clicked', async () => {
      const user = userEvent.setup()
      const onWrestlerClick = vi.fn()
      render(<WinLossChart {...defaultProps} onWrestlerClick={onWrestlerClick} />)
      await user.click(screen.getByRole('button', { name: 'Wrestler1: 11-4' }))
      expect(onWrestlerClick).toHaveBeenCalledWith(
        expect.objectContaining({ rikishiID: 1, shikonaEn: 'Wrestler1' })
      )
    })
  })

  // ─── KK/MK status icons ───────────────────────────────────────────────────────

  describe('status icons', () => {
    it('shows a green checkmark above a bar that has clinched kachi-koshi', () => {
      const { container } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 8, 3, 0, 1)]} onWrestlerClick={vi.fn()} />
      )
      const icon = container.querySelector('[class*="statusIconKk"]')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveTextContent('✓')
      expect(container.querySelector('[class*="statusIconMk"]')).not.toBeInTheDocument()
    })

    it('shows a red cross above a bar that has clinched make-koshi', () => {
      const { container } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 3, 8, 0, 1)]} onWrestlerClick={vi.fn()} />
      )
      const icon = container.querySelector('[class*="statusIconMk"]')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveTextContent('✕')
      expect(container.querySelector('[class*="statusIconKk"]')).not.toBeInTheDocument()
    })

    it('counts absences toward the make-koshi cross, same as the loss bar', () => {
      const { container } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 3, 3, 5, 1)]} onWrestlerClick={vi.fn()} />
      )
      // 3 losses + 5 absences = 8, clinching make-koshi even though losses alone don't
      expect(container.querySelector('[class*="statusIconMk"]')).toBeInTheDocument()
    })

    it('shows no icon while the record is still undecided', () => {
      const { container } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 4, 4, 0, 1)]} onWrestlerClick={vi.fn()} />
      )
      expect(container.querySelector('[class*="statusIconKk"]')).not.toBeInTheDocument()
      expect(container.querySelector('[class*="statusIconMk"]')).not.toBeInTheDocument()
    })

    it('uses the lower-division threshold (4) for a lower division', () => {
      const { container } = render(
        <WinLossChart division="Makushita" wrestlers={[makeWrestler(1, 4, 2, 0, 1)]} onWrestlerClick={vi.fn()} />
      )
      expect(container.querySelector('[class*="statusIconKk"]')).toBeInTheDocument()
    })

    it('shows the make-koshi cross for a lower division too', () => {
      const { container } = render(
        <WinLossChart division="Makushita" wrestlers={[makeWrestler(1, 2, 4, 0, 1)]} onWrestlerClick={vi.fn()} />
      )
      expect(container.querySelector('[class*="statusIconMk"]')).toBeInTheDocument()
    })

    it('shows no kk icon one win short of the threshold', () => {
      const { container } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 7, 3, 0, 1)]} onWrestlerClick={vi.fn()} />
      )
      expect(container.querySelector('[class*="statusIconKk"]')).not.toBeInTheDocument()
    })

    it('shows no mk icon one loss short of the threshold', () => {
      const { container } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 3, 7, 0, 1)]} onWrestlerClick={vi.fn()} />
      )
      expect(container.querySelector('[class*="statusIconMk"]')).not.toBeInTheDocument()
    })

    it("positions the kk icon just above the win bar's actual height, not a fixed offset", () => {
      // maxScale 15, HALF_HEIGHT_PX 90 -> unitPx 6
      const { container: c1 } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 8, 3, 0, 1)]} onWrestlerClick={vi.fn()} />
      )
      expect(c1.querySelector('[class*="statusIconKk"]').style.bottom).toBe('50px') // 8*6 + 2

      const { container: c2 } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 12, 3, 0, 1)]} onWrestlerClick={vi.fn()} />
      )
      expect(c2.querySelector('[class*="statusIconKk"]').style.bottom).toBe('74px') // 12*6 + 2
    })

    it("positions the mk icon just below the combined loss+absence bar's actual height", () => {
      const { container } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 6, 3, 5, 1)]} onWrestlerClick={vi.fn()} />
      )
      // (losses 3 + absences 5) * 6 + 2
      expect(container.querySelector('[class*="statusIconMk"]').style.top).toBe('50px')
    })

    it('positions the mk icon correctly for a fully-kyujo wrestler (the case that used to collide with the x-axis label)', () => {
      const { container } = render(
        <WinLossChart division="Makuuchi" wrestlers={[makeWrestler(1, 0, 0, 15, 1)]} onWrestlerClick={vi.fn()} />
      )
      // absences capped at maxScale (15) * unitPx (6) + 2 = 92, i.e. past the 90px bottomHalf
      expect(container.querySelector('[class*="statusIconMk"]').style.top).toBe('92px')
    })

    it('scopes icons to the correct column when multiple wrestlers are rendered together', () => {
      const wrestlers = [
        makeWrestler(1, 8, 3, 0, 1), // kachi-koshi
        makeWrestler(2, 4, 4, 0, 2), // undecided
        makeWrestler(3, 3, 8, 0, 3), // make-koshi
      ]
      render(<WinLossChart division="Makuuchi" wrestlers={wrestlers} onWrestlerClick={vi.fn()} />)

      const kkButton = screen.getByRole('button', { name: 'Wrestler1: 8-3' })
      const undecidedButton = screen.getByRole('button', { name: 'Wrestler2: 4-4' })
      const mkButton = screen.getByRole('button', { name: 'Wrestler3: 3-8' })

      expect(kkButton.querySelector('[class*="statusIconKk"]')).toBeInTheDocument()
      expect(kkButton.querySelector('[class*="statusIconMk"]')).not.toBeInTheDocument()

      expect(undecidedButton.querySelector('[class*="statusIconKk"]')).not.toBeInTheDocument()
      expect(undecidedButton.querySelector('[class*="statusIconMk"]')).not.toBeInTheDocument()

      expect(mkButton.querySelector('[class*="statusIconMk"]')).toBeInTheDocument()
      expect(mkButton.querySelector('[class*="statusIconKk"]')).not.toBeInTheDocument()
    })
  })

  // ─── Legend ─────────────────────────────────────────────────────────────────

  describe('legend', () => {
    it('renders the wins, losses, and kyujo legend entries', () => {
      render(<WinLossChart {...defaultProps} />)
      expect(screen.getByText('Wins')).toBeInTheDocument()
      expect(screen.getByText('Losses')).toBeInTheDocument()
      expect(screen.getByText('Kyujo')).toBeInTheDocument()
    })
  })

  // ─── Zone dividers (Makuuchi only) ───────────────────────────────────────────

  describe('zone dividers', () => {
    const makuuchiWrestlers = [
      makeWrestler(1, 12, 3, 0, 1, { rank: 'Yokozuna 1 East' }),
      makeWrestler(2, 10, 5, 0, 2, { rank: 'Ozeki 1 East' }),
      makeWrestler(3, 9, 6, 0, 3, { rank: 'Sekiwake 1 East' }),
      makeWrestler(4, 8, 7, 0, 4, { rank: 'Komusubi 1 East' }),
      makeWrestler(5, 7, 8, 0, 5, { rank: 'Maegashira 1 East' }),
      makeWrestler(6, 6, 9, 0, 6, { rank: 'Maegashira 5 East' }),
      makeWrestler(7, 5, 10, 0, 7, { rank: 'Maegashira 6 East' }),
    ]

    it('places dividers between sanyaku/joi and joi/rest for Makuuchi', () => {
      const { container } = render(
        <WinLossChart wrestlers={makuuchiWrestlers} division="Makuuchi" onWrestlerClick={vi.fn()} />
      )
      const dividers = container.querySelectorAll('[class*="vGridline"]')
      expect(dividers).toHaveLength(2)
      expect(dividers[0].style.left).toBe(`${(4 / 7) * 100}%`)
      expect(dividers[1].style.left).toBe(`${(6 / 7) * 100}%`)
    })

    it('renders no dividers for a non-Makuuchi division', () => {
      const { container } = render(
        <WinLossChart wrestlers={makuuchiWrestlers} division="Juryo" onWrestlerClick={vi.fn()} />
      )
      expect(container.querySelectorAll('[class*="vGridline"]')).toHaveLength(0)
    })

    it('labels the sanyaku and joi zones, leaving the rest implicit', () => {
      render(
        <WinLossChart wrestlers={makuuchiWrestlers} division="Makuuchi" onWrestlerClick={vi.fn()} />
      )
      expect(screen.getByText('Sanyaku')).toBeInTheDocument()
      expect(screen.getByText('Joi')).toBeInTheDocument()
      expect(screen.queryByText('Maegashira')).not.toBeInTheDocument()
    })

    it('renders no zone labels for a non-Makuuchi division', () => {
      render(
        <WinLossChart wrestlers={makuuchiWrestlers} division="Juryo" onWrestlerClick={vi.fn()} />
      )
      expect(screen.queryByText('Sanyaku')).not.toBeInTheDocument()
    })
  })

  // ─── Y-axis ─────────────────────────────────────────────────────────────────

  describe('y-axis', () => {
    it('renders 12/8/4/0/-4/-8/-12 for a sekitori division, stepping evenly through the kk/mk threshold', () => {
      render(<WinLossChart {...defaultProps} division="Makuuchi" />)
      for (const tick of ['12', '8', '4', '0', '-4', '-8', '-12']) {
        expect(screen.getByText(tick)).toBeInTheDocument()
      }
      expect(screen.queryByText('15')).not.toBeInTheDocument()
      expect(screen.queryByText('10')).not.toBeInTheDocument()
      expect(screen.queryByText('5')).not.toBeInTheDocument()
    })

    it('renders 7/4/0/-4/-7 for a lower division', () => {
      render(<WinLossChart {...defaultProps} division="Makushita" />)
      for (const tick of ['7', '4', '0', '-4', '-7']) {
        expect(screen.getByText(tick)).toBeInTheDocument()
      }
      expect(screen.queryByText('15')).not.toBeInTheDocument()
    })

    it.each(['Makuuchi', 'Juryo'])(
      'renders 7 y-axis labels for sekitori division %s',
      (division) => {
        const { container } = render(<WinLossChart {...defaultProps} division={division} />)
        expect(container.querySelectorAll('[class*="yAxisLabel"]')).toHaveLength(7)
      }
    )

    it.each(['Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'])(
      'renders 5 y-axis labels for lower division %s',
      (division) => {
        const { container } = render(<WinLossChart {...defaultProps} division={division} />)
        expect(container.querySelectorAll('[class*="yAxisLabel"]')).toHaveLength(5)
      }
    )
  })

  // ─── Kachi-koshi / make-koshi threshold line ─────────────────────────────────

  describe('kachi-koshi threshold', () => {
    it('marks 8 wins / 8 losses as the winning-record line for a sekitori division', () => {
      const { container } = render(<WinLossChart {...defaultProps} division="Makuuchi" />)
      const kkLabel = screen.getByText('8')
      const mkLabel = screen.getByText('-8')
      expect(kkLabel.className).toMatch(/yAxisLabelKk/)
      expect(mkLabel.className).toMatch(/yAxisLabelMk/)
      expect(container.querySelector('[class*="gridlineKk"]')).toBeInTheDocument()
      expect(container.querySelector('[class*="gridlineMk"]')).toBeInTheDocument()
    })

    it('marks 4 wins / 4 losses as the winning-record line for a lower division', () => {
      const { container } = render(<WinLossChart {...defaultProps} division="Makushita" />)
      const kkLabel = screen.getByText('4')
      const mkLabel = screen.getByText('-4')
      expect(kkLabel.className).toMatch(/yAxisLabelKk/)
      expect(mkLabel.className).toMatch(/yAxisLabelMk/)
      expect(container.querySelector('[class*="gridlineKk"]')).toBeInTheDocument()
      expect(container.querySelector('[class*="gridlineMk"]')).toBeInTheDocument()
    })

    it('does not double-render a plain grey tick where the threshold line already sits', () => {
      render(<WinLossChart {...defaultProps} division="Makushita" />)
      // "4" should appear exactly once (as the coloured kk label), not also as a plain grey tick
      expect(screen.getAllByText('4')).toHaveLength(1)
      expect(screen.getAllByText('-4')).toHaveLength(1)
    })
  })
})
