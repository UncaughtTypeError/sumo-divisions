import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HoshitoriGrid from '../../../components/modal/HoshitoriGrid'
import useDivisionStore from '../../../store/divisionStore'

vi.mock('../../../components/modal/KimariteModal', () => ({
  default: ({ isOpen, kimarite }) =>
    isOpen ? <div data-testid="kimarite-modal">{kimarite}</div> : null,
}))

const makeMatches = (overrides = []) =>
  Array.from({ length: 15 }, (_, i) => overrides[i] ?? null)

describe('HoshitoriGrid', () => {
  afterEach(() => {
    useDivisionStore.getState().reset()
  })

  // ── Day headers ─────────────────────────────────────────────────────────────

  describe('day headers', () => {
    it('renders all 15 day headers', () => {
      render(<HoshitoriGrid />)
      for (let d = 1; d <= 15; d++) {
        expect(screen.getByText(`D${d}`)).toBeInTheDocument()
      }
    })
  })

  // ── Result shapes ────────────────────────────────────────────────────────────

  describe('result shapes', () => {
    it('renders shiroboshi for a win', () => {
      const matches = makeMatches([{ result: 'win', opponentShikonaEn: 'Opponent', opponentID: 1, kimarite: null }])
      const { container } = render(<HoshitoriGrid matches={matches} />)
      expect(container.querySelector('[class*="shiroboshi"]')).toBeInTheDocument()
    })

    it('renders kuroboshi for a loss', () => {
      const matches = makeMatches([{ result: 'loss', opponentShikonaEn: 'Opponent', opponentID: 1, kimarite: null }])
      const { container } = render(<HoshitoriGrid matches={matches} />)
      expect(container.querySelector('[class*="kuroboshi"]')).toBeInTheDocument()
    })

    it('renders fusenshoSquare for a fusen win', () => {
      const matches = makeMatches([{ result: 'fusen win', opponentShikonaEn: 'Opponent', opponentID: 1, kimarite: null }])
      const { container } = render(<HoshitoriGrid matches={matches} />)
      expect(container.querySelector('[class*="fusenshoSquare"]')).toBeInTheDocument()
    })

    it('renders fusenpaiSquare for a fusen loss', () => {
      const matches = makeMatches([{ result: 'fusen loss', opponentShikonaEn: 'Opponent', opponentID: 1, kimarite: null }])
      const { container } = render(<HoshitoriGrid matches={matches} />)
      expect(container.querySelector('[class*="fusenpaiSquare"]')).toBeInTheDocument()
    })

    it('renders kyujo text for absent', () => {
      const matches = makeMatches([{ result: 'absent', opponentShikonaEn: null, opponentID: null, kimarite: null }])
      render(<HoshitoriGrid matches={matches} />)
      expect(screen.getByText('休')).toBeInTheDocument()
    })

    it('renders a placeholder dash for days with no match', () => {
      render(<HoshitoriGrid matches={[]} />)
      // 3 rows (result, opponent, kimarite) × 15 days = 45 placeholders
      const dashes = screen.getAllByText('–')
      expect(dashes).toHaveLength(45)
    })
  })

  // ── Opponent names ───────────────────────────────────────────────────────────

  describe('opponent names', () => {
    const match = { result: 'win', opponentShikonaEn: 'Terunofuji', opponentID: 100, kimarite: 'yorikiri' }

    it('renders opponent name as plain text when not in any wrestler list', () => {
      render(<HoshitoriGrid matches={makeMatches([match])} />)
      expect(screen.getByText('Terunofuji')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /view terunofuji/i })).not.toBeInTheDocument()
    })

    it('renders opponent as a clickable button when in allWrestlers', () => {
      useDivisionStore.getState().setAllWrestlers([{ rikishiID: 100, shikonaEn: 'Terunofuji', rank: 'Yokozuna 1 East' }])
      render(<HoshitoriGrid matches={makeMatches([match])} />)
      expect(screen.getByRole('button', { name: /view terunofuji/i })).toBeInTheDocument()
    })

    it('renders cross-division opponent as a clickable button when in adjacentWrestlers', () => {
      useDivisionStore.getState().setAdjacentWrestlers([{ rikishiID: 100, shikonaEn: 'Terunofuji', rank: 'Juryo 1 East' }])
      render(<HoshitoriGrid matches={makeMatches([match])} />)
      expect(screen.getByRole('button', { name: /view terunofuji/i })).toBeInTheDocument()
    })

    it('clicking a linked opponent opens the modal', () => {
      const wrestler = { rikishiID: 100, shikonaEn: 'Terunofuji', rank: 'Yokozuna 1 East' }
      useDivisionStore.getState().setAllWrestlers([wrestler])
      render(<HoshitoriGrid matches={makeMatches([match])} />)
      fireEvent.click(screen.getByRole('button', { name: /view terunofuji/i }))
      expect(useDivisionStore.getState().isModalOpen).toBe(true)
      expect(useDivisionStore.getState().selectedWrestler).toEqual(wrestler)
    })
  })

  // ── Rank in tooltip ──────────────────────────────────────────────────────────

  describe('rank abbreviation in tooltip', () => {
    const match = { result: 'win', opponentShikonaEn: 'Terunofuji', opponentID: 100, kimarite: 'yorikiri' }

    it('includes abbreviated rank in tooltip when opponent is in allWrestlers', () => {
      useDivisionStore.getState().setAllWrestlers([{ rikishiID: 100, shikonaEn: 'Terunofuji', rank: 'Yokozuna 1 East' }])
      const { container } = render(<HoshitoriGrid matches={makeMatches([match])} />)
      fireEvent.mouseEnter(screen.getByRole('button', { name: /view terunofuji/i }).closest('span'))
      expect(screen.getByText('Terunofuji (Y1e)')).toBeInTheDocument()
    })

    it('includes abbreviated rank in tooltip for adjacent division opponent', () => {
      useDivisionStore.getState().setAdjacentWrestlers([{ rikishiID: 100, shikonaEn: 'Terunofuji', rank: 'Juryo 3 West' }])
      const { container } = render(<HoshitoriGrid matches={makeMatches([match])} />)
      fireEvent.mouseEnter(screen.getByRole('button', { name: /view terunofuji/i }).closest('span'))
      expect(screen.getByText('Terunofuji (J3w)')).toBeInTheDocument()
    })

    it('uses Ms prefix for Makushita (distinguishes from Maegashira M)', () => {
      useDivisionStore.getState().setAdjacentWrestlers([{ rikishiID: 100, shikonaEn: 'Terunofuji', rank: 'Makushita 10 East' }])
      render(<HoshitoriGrid matches={makeMatches([match])} />)
      fireEvent.mouseEnter(screen.getByRole('button', { name: /view terunofuji/i }).closest('span'))
      expect(screen.getByText('Terunofuji (Ms10e)')).toBeInTheDocument()
    })

    it('uses Jd prefix for Jonidan (distinguishes from Juryo J)', () => {
      useDivisionStore.getState().setAdjacentWrestlers([{ rikishiID: 100, shikonaEn: 'Terunofuji', rank: 'Jonidan 50 West' }])
      render(<HoshitoriGrid matches={makeMatches([match])} />)
      fireEvent.mouseEnter(screen.getByRole('button', { name: /view terunofuji/i }).closest('span'))
      expect(screen.getByText('Terunofuji (Jd50w)')).toBeInTheDocument()
    })

    it('uses Jk prefix for Jonokuchi (distinguishes from Juryo J)', () => {
      useDivisionStore.getState().setAdjacentWrestlers([{ rikishiID: 100, shikonaEn: 'Terunofuji', rank: 'Jonokuchi 15 East' }])
      render(<HoshitoriGrid matches={makeMatches([match])} />)
      fireEvent.mouseEnter(screen.getByRole('button', { name: /view terunofuji/i }).closest('span'))
      expect(screen.getByText('Terunofuji (Jk15e)')).toBeInTheDocument()
    })

    it('shows name only in tooltip when opponent has no rank', () => {
      useDivisionStore.getState().setAllWrestlers([{ rikishiID: 100, shikonaEn: 'Terunofuji', rank: null }])
      const { container } = render(<HoshitoriGrid matches={makeMatches([match])} />)
      fireEvent.mouseEnter(screen.getByRole('button', { name: /view terunofuji/i }).closest('span'))
      // Tooltip should show name only — no rank in parentheses
      expect(screen.queryByText(/terunofuji \(/i)).not.toBeInTheDocument()
    })
  })

  // ── Kimarite ─────────────────────────────────────────────────────────────────

  describe('kimarite', () => {
    it('renders known kimarite as a clickable button', () => {
      const matches = makeMatches([{ result: 'win', opponentShikonaEn: 'Opponent', opponentID: 1, kimarite: 'yorikiri' }])
      render(<HoshitoriGrid matches={matches} />)
      expect(screen.getByRole('button', { name: /view details for yorikiri/i })).toBeInTheDocument()
    })

    it('renders unknown kimarite as plain text without a button', () => {
      const matches = makeMatches([{ result: 'win', opponentShikonaEn: 'Opponent', opponentID: 1, kimarite: 'unknowntechnique' }])
      render(<HoshitoriGrid matches={matches} />)
      expect(screen.getByText('unknowntechnique')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /view details for unknowntechnique/i })).not.toBeInTheDocument()
    })

    it('opens kimarite modal when kimarite button is clicked', () => {
      const matches = makeMatches([{ result: 'win', opponentShikonaEn: 'Opponent', opponentID: 1, kimarite: 'yorikiri' }])
      render(<HoshitoriGrid matches={matches} />)
      fireEvent.click(screen.getByRole('button', { name: /view details for yorikiri/i }))
      expect(screen.getByTestId('kimarite-modal')).toBeInTheDocument()
      expect(screen.getByTestId('kimarite-modal')).toHaveTextContent('yorikiri')
    })

    it('renders empty cell when kimarite is null', () => {
      const matches = makeMatches([{ result: 'win', opponentShikonaEn: 'Opponent', opponentID: 1, kimarite: null }])
      render(<HoshitoriGrid matches={matches} />)
      expect(screen.queryByRole('button', { name: /view details/i })).not.toBeInTheDocument()
    })
  })
})
