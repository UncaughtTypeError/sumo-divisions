import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BashoSelector from '../../../components/sidebar/BashoSelector'

// Mock the bashoId utility
vi.mock('../../../utils/bashoId', () => ({
  generateBashoIdList: vi.fn(() => ['202601', '202511', '202509']),
  formatBashoDate: vi.fn((bashoId) => {
    const mapping = {
      '202601': 'Jan 2026',
      '202511': 'Nov 2025',
      '202509': 'Sep 2025',
    }
    return mapping[bashoId] || bashoId
  }),
}))

describe('BashoSelector', () => {
  it('should render select element', () => {
    render(
      <BashoSelector selectedBashoId="202601" onBashoChange={() => {}} />
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should have correct aria-label', () => {
    render(
      <BashoSelector selectedBashoId="202601" onBashoChange={() => {}} />
    )
    expect(
      screen.getByLabelText('Select basho tournament')
    ).toBeInTheDocument()
  })

  it('should render all basho options', () => {
    render(
      <BashoSelector selectedBashoId="202601" onBashoChange={() => {}} />
    )
    expect(screen.getByText('Jan 2026')).toBeInTheDocument()
    expect(screen.getByText('Nov 2025')).toBeInTheDocument()
    expect(screen.getByText('Sep 2025')).toBeInTheDocument()
  })

  it('should have correct selected value', () => {
    render(
      <BashoSelector selectedBashoId="202511" onBashoChange={() => {}} />
    )
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('202511')
  })

  it('should call onBashoChange when selection changes', () => {
    const onBashoChange = vi.fn()
    render(
      <BashoSelector selectedBashoId="202601" onBashoChange={onBashoChange} />
    )

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '202511' },
    })

    expect(onBashoChange).toHaveBeenCalledWith('202511')
  })

  it('should render options with correct values', () => {
    render(
      <BashoSelector selectedBashoId="202601" onBashoChange={() => {}} />
    )
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveValue('202601')
    expect(options[1]).toHaveValue('202511')
    expect(options[2]).toHaveValue('202509')
  })
})
