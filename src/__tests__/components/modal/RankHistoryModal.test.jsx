import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RankHistoryModal from '../../../components/modal/RankHistoryModal'

vi.mock('../../../components/modal/RikishiRankHistory', () => ({
  default: ({ rikishiDetails }) => (
    <div data-testid="rank-history-content">
      {rikishiDetails?.rankHistory?.length > 0 ? 'rank history rendered' : 'No rank history available.'}
    </div>
  ),
}))

const mockClose = vi.fn()
afterEach(() => mockClose.mockReset())

const rikishiWithHistory = {
  shikonaEn: 'Terunofuji',
  rankHistory: [
    { id: '202605-45', bashoId: '202605', rank: 'Yokozuna 1 East', rankValue: 101 },
  ],
}

describe('RankHistoryModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <RankHistoryModal isOpen={false} onClose={mockClose} rikishiDetails={rikishiWithHistory} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the rikishi name and Rank History in the title when open', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    expect(screen.getByText(/Terunofuji.*Rank History/)).toBeInTheDocument()
  })

  it('renders RikishiRankHistory inside the modal panel', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    expect(screen.getByTestId('rank-history-content')).toBeInTheDocument()
    expect(screen.getByText('rank history rendered')).toBeInTheDocument()
  })

  it('passes rikishiDetails with empty history to RikishiRankHistory', () => {
    const rikishi = { shikonaEn: 'Test', rankHistory: [] }
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishi} />)
    expect(screen.getByText('No rank history available.')).toBeInTheDocument()
  })

  it('calls onClose when header close button is clicked', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    fireEvent.click(screen.getByLabelText('Close rank history'))
    expect(mockClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when footer Close button is clicked', () => {
    render(<RankHistoryModal isOpen onClose={mockClose} rikishiDetails={rikishiWithHistory} />)
    fireEvent.click(screen.getByText('Close'))
    expect(mockClose).toHaveBeenCalledOnce()
  })
})
