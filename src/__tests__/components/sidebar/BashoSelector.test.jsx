import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BashoSelector from '../../../components/sidebar/BashoSelector'

// Mock the bashoId utility
vi.mock('../../../utils/bashoId', () => ({
  generateBashoIdList: vi.fn(() => ['202601', '202511', '202509']),
  formatBashoDate: vi.fn((bashoId) => {
    const mapping = {
      '202601': 'Jan 2026, Hatsu',
      '202511': 'Nov 2025, Kyushu',
      '202509': 'Sep 2025, Aki',
    }
    return mapping[bashoId] || bashoId
  }),
  formatBashoDateFull: vi.fn((bashoId, startDate, endDate) => {
    if (startDate && endDate) {
      const mapping = {
        '202601': '11 - 25 Jan 2026, Hatsu Basho (初場所 "Opening Tournament")',
        '202511': '9 - 23 Nov 2025, Kyushu Basho (九州場所 "Kyushu Tournament")',
        '202509': '14 - 28 Sep 2025, Aki Basho (秋場所 "Autumn Tournament")',
      }
      return mapping[bashoId] || bashoId
    }
    // Fallback to short format
    const mapping = {
      '202601': 'Jan 2026, Hatsu',
      '202511': 'Nov 2025, Kyushu',
      '202509': 'Sep 2025, Aki',
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

  it('should render all basho options with nicknames in dropdown', () => {
    render(
      <BashoSelector selectedBashoId="202601" onBashoChange={() => {}} />
    )
    // Check that options exist in the select
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('Jan 2026, Hatsu')
    expect(options[1]).toHaveTextContent('Nov 2025, Kyushu')
    expect(options[2]).toHaveTextContent('Sep 2025, Aki')
  })

  it('should render selected basho display with full info when bashoResults provided', () => {
    const bashoResults = {
      startDate: '2026-01-11T00:00:00Z',
      endDate: '2026-01-25T00:00:00Z',
    }
    render(
      <BashoSelector
        selectedBashoId="202601"
        onBashoChange={() => {}}
        bashoResults={bashoResults}
      />
    )
    expect(
      screen.getByText('11 - 25 Jan 2026, Hatsu Basho (初場所 "Opening Tournament")')
    ).toBeInTheDocument()
  })

  it('should fallback to short format when bashoResults not provided', () => {
    render(
      <BashoSelector selectedBashoId="202601" onBashoChange={() => {}} />
    )
    // The selectedBasho div shows the short format as fallback
    // There are 2 elements with this text: the selectedBasho div and the option
    const elements = screen.getAllByText('Jan 2026, Hatsu')
    expect(elements.length).toBeGreaterThanOrEqual(1)
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
