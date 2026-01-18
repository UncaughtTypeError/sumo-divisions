import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Create a new QueryClient for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  })
}

/**
 * Wrapper component with QueryClientProvider for testing
 */
export function QueryClientWrapper({ children }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

/**
 * Custom render function with QueryClient provider
 */
export function renderWithQueryClient(ui, options = {}) {
  const queryClient = createTestQueryClient()
  return {
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
      options
    ),
    queryClient,
  }
}

/**
 * Mock wrestler data for testing
 */
export const mockWrestler = {
  rikishiID: 1,
  shikonaEn: 'Terunofuji',
  shikonaJp: '照ノ富士',
  rank: 'Yokozuna 1 East',
  rankValue: 1,
  wins: 12,
  losses: 3,
  absences: 0,
  record: [
    { result: 'win', opponentShikonaEn: 'Takakeisho', kimarite: 'yorikiri' },
    { result: 'loss', opponentShikonaEn: 'Kotozakura', kimarite: 'oshidashi' },
    { result: 'win', opponentShikonaEn: 'Hoshoryu', kimarite: 'uwatenage' },
  ],
  awards: [],
}

/**
 * Mock banzuke data for testing
 */
export const mockBanzukeData = {
  bashoId: '202601',
  division: 'Makuuchi',
  east: [
    { ...mockWrestler },
    {
      rikishiID: 2,
      shikonaEn: 'Kotozakura',
      shikonaJp: '琴櫻',
      rank: 'Ozeki 1 East',
      rankValue: 2,
      wins: 11,
      losses: 4,
      absences: 0,
      record: [],
      awards: [],
    },
  ],
  west: [
    {
      rikishiID: 3,
      shikonaEn: 'Hoshoryu',
      shikonaJp: '豊昇龍',
      rank: 'Ozeki 1 West',
      rankValue: 2,
      wins: 10,
      losses: 5,
      absences: 0,
      record: [],
      awards: [],
    },
  ],
}

/**
 * Mock basho results data for testing
 */
export const mockBashoResults = {
  date: '2026-01',
  startDate: '2026-01-12',
  endDate: '2026-01-26',
  yusho: [
    {
      type: 'Makuuchi',
      rikishiId: 1,
      shikonaEn: 'Terunofuji',
      shikonaJp: '照ノ富士',
    },
    {
      type: 'Juryo',
      rikishiId: 10,
      shikonaEn: 'Mitoryu',
      shikonaJp: '水戸龍',
    },
  ],
  specialPrizes: [
    { type: 'Shukun-sho', rikishiId: 4, shikonaEn: 'Onosato' },
    { type: 'Kanto-sho', rikishiId: 5, shikonaEn: 'Wakamotoharu' },
    { type: 'Gino-sho', rikishiId: 6, shikonaEn: 'Abi' },
  ],
}

/**
 * Reset the Zustand store to initial state
 */
export function resetStore(store) {
  const initialState = store.getState()
  if (initialState.reset) {
    initialState.reset()
  }
}
