# Contributing to Sumo Divisions

## Before Opening a PR

- [ ] All tests pass — `npm test`
- [ ] Commits follow the [conventional commit](#commit-style) style used in this project
- [ ] Tested in at least one major Chromium-based browser
- [ ] Checked responsiveness at mobile, tablet, and desktop widths
- [ ] PR description uses the [provided template](.github/PULL_REQUEST_TEMPLATE.md)

## Commit Style

This project uses [Conventional Commits](https://www.conventionalcommits.org/) without scopes. Keep messages concise — describe the **what** and **why**, not the implementation detail.

```
feat: add basho selector to sidebar header
fix: prevent sidebar opening when pyramid is loading
refactor: unify rank and division view rendering
test: add coverage for division legend click behaviour
docs: update contributing guide with PR checklist
chore: upgrade vitest to v4
```

**Types used in this project:**

| Type | When to use |
|------|-------------|
| `feat` | New user-facing functionality |
| `fix` | Bug fix |
| `refactor` | Code change with no behaviour change |
| `test` | Adding or correcting tests |
| `docs` | Documentation only |
| `chore` | Tooling, dependencies, config |

## Technology Stack

### Core

- **React 18+** - UI framework with hooks
- **Vite** - Fast build tool and development server
- **JavaScript (ES6+)** - Modern JavaScript features

### State Management & Data Fetching

- **Zustand** - Lightweight state management
- **React Query (TanStack Query)** - Data fetching, caching, and synchronization
- **Axios** - HTTP client with interceptors
- **localStorage** - User preference persistence (active view, heya layout) via the `useLocalStorage` hook; survives page reload and return visits without a server or auth layer

### Styling

- **CSS Modules** - Component-scoped styling
- **CSS Custom Properties** - Design tokens and theming
- **CSS Grid & Flexbox** - Primary layout primitives; `<table>` is used only where tabular data semantics apply (Heya grid, Rank History modal)

### UI Components

- **Headless UI** - Accessible, unstyled components (modals, dialogs)

### Utilities

- **date-fns** - Date manipulation for basho ID calculations

### Testing

- **Vitest** - Fast unit test runner
- **Testing Library** - React component testing
- **MSW (Mock Service Worker)** - API mocking

## API

This application uses the **Sumo API** (https://www.sumo-api.com/) to fetch real-time sumo wrestling data.

### Key Endpoints Used

| Endpoint | Purpose | Cache key |
|---|---|---|
| `GET /api/rikishis` | Active wrestler roster for the Heya overview (grouping by stable). Does **not** include `ranks=true` to avoid hitting the API's default page limit. | `['allRikishi']` — 1 hour stale |
| `GET /api/rikishi/:id?ranks=true` | Full rikishi profile **with complete rank history** for a single wrestler. Called in parallel for every wrestler currently displayed in a sidebar (typically ≤ 42 for Makuuchi). Includes retired wrestlers, `intai` date, heya, and the `rankHistory` array used for rank movement indicators and career-high detection. | `['rikishi', id]` — 1 hour stale |
| `GET /api/basho/:bashoId/banzuke/:division` | Wrestler rankings and records for one division. | `['banzuke', bashoId, division]` — shared between `useBanzuke` and `useAllDivisionsBanzuke` so data fetched in the Rankings view is immediately available in the Heya view |
| `GET /api/basho/:bashoId` | Tournament results (yusho winners, special prizes) | `['bashoResults', bashoId]` |
| `GET /api/rikishi/:id/matches/:opponentId` | Head-to-head match history between two wrestlers | `['rikishiMatches', id, opponentId]` |
| `GET /api/basho/:bashoId/torikumi/:division/:day` | Scheduled and completed bouts for one day of a basho | `['torikumi', bashoId, division, day]` — 5 min stale; bypassed on manual/auto refresh |

### Torikumi auto-refresh back-off strategy

When the torikumi tab is open and the latest day has pending results, the app auto-refreshes every 3 minutes. If three consecutive refreshes return no new results, it switches to an incremental back-off (5–25 minute intervals, up to 5 attempts) before stopping for the session. The manual refresh button remains active throughout and restarts auto-refresh once the session has been fully stopped (clicking during back-off does not reset the counter).

### Why per-wrestler fetches instead of the bulk endpoint

The bulk endpoint (`/api/rikishis?intai=true&ranks=true`) hits the API's default page limit when including all retired wrestlers plus full rank history, causing active wrestlers to silently drop out of the result. The application instead calls `/api/rikishi/:id?ranks=true` individually for each wrestler currently in view — at most ~42 parallel requests for a full Makuuchi sidebar, well within the 60 req/min rate limit. React Query caches each result under `['rikishi', id]`, so the data is fetched once per session and served from cache on all subsequent sidebar opens.

### Rank History & Movement Indicators

Each `/api/rikishi/:id?ranks=true` response includes a `rankHistory` array:

```javascript
{
  id: 19,
  shikonaEn: "Hoshoryu",
  heya: "Tatsunami",
  intai: null,                   // ISO date string if retired, null if active
  rankHistory: [
    {
      id: "202605-19",
      bashoId: "202605",         // YYYYMM format, newest first
      rikishiId: 19,
      rankValue: 101,            // lower = better; 100s = Yokozuna, 200s = Ozeki, etc.
      rank: "Yokozuna 1 East"
    },
    // ... earlier bashos
  ]
}
```

`rankHistory` is sorted newest-first by the API. The `rankValue` field correctly encodes division and rank number (`Yokozuna = 101–1xx`, `Ozeki = 201–2xx`, `Maegashira = 501–5xx`, etc.) but treats East and West of the same rank number identically. The `rankMovement.js` utility uses `rankValue` for cross-group direction (to avoid the position-formula edge case where `Ozeki 2 West` bleeds past `Sekiwake 1 East`) and banzuke position for same-rankValue East/West distinction.

Entries with `rankValue >= 2000` (Mae-zumo, Banzuke-gai) are excluded from all career-high and debut calculations.

### Banzuke record results

Each wrestler's `record` array in the banzuke response always contains 15 entries for sekitori (7 for lower divisions). The `result` field uses these values:

| Value | Meaning |
|---|---|
| `"win"` | Won the bout |
| `"loss"` | Lost the bout |
| `"fusen win"` | Opponent withdrew — wrestler awarded win without fighting |
| `"fusen loss"` | Wrestler withdrew — opponent awarded win |
| `"absent"` | Wrestler was absent (kyujo) |
| `""` | Future day not yet competed |

The day filter uses `COMPETING_RESULTS = new Set(['win', 'loss', 'fusen win'])` — only these values indicate the wrestler was physically present and competing. `absent` and `fusen loss` correctly exclude the wrestler from that day's view.

### BashoId Logic

Sumo bashos (tournaments) occur **6 times per year** in odd months only:

- January (01) — March (03) — May (05) — July (07) — September (09) — November (11)

The application automatically calculates the current or most recent valid basho ID. If the current month is invalid (e.g., February), it falls back to the most recent valid month (e.g., January). The format is `YYYYMM` (e.g., `202605`).

## Installation & Setup

### Prerequisites

- Node.js 16+ and npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or the next available port).

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode with Coverage

```bash
npm run test:coverage
```

### Generate Coverage Report

```bash
npm run test:coverage:report
```

This runs all tests once and generates a detailed coverage report in the `coverage/` directory.

### View Coverage Report in Browser

After generating the coverage report, open the HTML report:

```bash
# Windows
start coverage/index.html

# macOS
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

Or manually open `coverage/index.html` in your browser.

The report provides:

- **Summary view**: Overall coverage percentages for statements, branches, functions, and lines
- **File browser**: Navigate through source files to see line-by-line coverage
- **Highlighted code**: Green = covered, red = uncovered, yellow = partially covered branches

### Test Files Location

- `src/__tests__/utils/` - Utility function tests
- `src/__tests__/services/` - API service tests
- `src/__tests__/hooks/` - Custom hook tests
- `src/__tests__/store/` - Zustand store tests
- `src/__tests__/components/` - Component tests
  - `src/__tests__/components/pyramid/` - Pyramid component tests
  - `src/__tests__/components/sidebar/` - Sidebar component tests
  - `src/__tests__/components/modal/` - Modal component tests
  - `src/__tests__/components/common/` - Common component tests
  - `src/__tests__/components/views/` - ViewTabs tests
  - `src/__tests__/components/heya/` - Heya dashboard component tests

## Project Structure

<details>
<summary>Expand project tree</summary>

```
sumo-divisions/
├── src/
│   ├── components/
│   │   ├── views/             # Top-level view switching
│   │   │   └── ViewTabs.jsx   # Rankings / Heya tab bar
│   │   ├── pyramid/           # Rankings pyramid view
│   │   │   ├── DivisionPyramid.jsx
│   │   │   ├── DivisionLegend.jsx
│   │   │   ├── RankGroupLegend.jsx
│   │   │   └── RankCard.jsx
│   │   ├── heya/              # Heya (stable) dashboard view
│   │   │   ├── HeyaDashboard.jsx   # Root container — search, sort, layout toggle
│   │   │   ├── HeyaGrid.jsx        # Sortable table (one row per stable)
│   │   │   ├── HeyaCardGrid.jsx    # Responsive card grid wrapper
│   │   │   ├── HeyaCard.jsx        # Individual stable card
│   │   │   ├── HeyaRankBadge.jsx   # Coloured rank badge with tooltip
│   │   │   └── HeyaSidebar.jsx     # Sidebar listing all wrestlers in a stable
│   │   ├── sidebar/           # Shared wrestler list sidebar
│   │   │   ├── WrestlerSidebar.jsx
│   │   │   ├── WrestlerGrid.jsx
│   │   │   ├── WrestlerRow.jsx
│   │   │   ├── BashoSelector.jsx
│   │   │   └── BashoWinners.jsx
│   │   ├── modal/             # Modals
│   │   │   ├── MatchHistoryModal.jsx
│   │   │   ├── MatchGrid.jsx
│   │   │   ├── HeadToHeadModal.jsx
│   │   │   ├── KimariteModal.jsx
│   │   │   ├── RikishiDetailModal.jsx
│   │   │   └── RankHistoryModal.jsx    # Full rank history table with movement indicators
│   │   └── common/            # Shared components
│   │       ├── Loading.jsx
│   │       ├── ErrorMessage.jsx
│   │       ├── NoDataMessage.jsx
│   │       ├── Tooltip.jsx
│   │       └── flags/         # Country flag SVG components
│   ├── services/
│   │   ├── api/               # API client & services
│   │   │   ├── sumoApi.js
│   │   │   ├── banzukeService.js
│   │   │   ├── bashoResultsService.js
│   │   │   ├── rikishiService.js
│   │   │   └── apiConfig.js
│   │   └── rateLimiter/       # Rate limiting
│   │       └── rateLimiter.js
│   ├── store/
│   │   └── divisionStore.js   # Zustand state (rankings sidebar + heya sidebar + modals)
│   ├── hooks/
│   │   ├── useBanzuke.js              # Single-division banzuke data
│   │   ├── useBashoResults.js         # Tournament results (yusho, special prizes)
│   │   ├── useRikishi.js              # Roster hook + useRikishiList (per-wrestler fetch) + head-to-head
│   │   ├── useHeyaData.js             # Derives stable list from useAllRikishi
│   │   ├── useAllDivisionsBanzuke.js  # Parallel fetch across all 6 divisions (shared cache)
│   │   └── useLocalStorage.js         # useState wrapper that reads/writes localStorage
│   ├── utils/
│   │   ├── bashoId.js         # BashoId calculation
│   │   ├── awards.js          # Awards & record status logic
│   │   ├── constants.js       # App constants (ranks, divisions, colours, abbreviations)
│   │   ├── kimarite.js        # Kimarite (technique) data
│   │   ├── flags.js           # Country flag lookup
│   │   └── rankMovement.js    # Rank delta, debut detection, career-high logic
│   ├── styles/
│   │   ├── global.css         # Global styles
│   │   └── variables.css      # CSS custom properties
│   ├── __tests__/             # Test files (mirrors src structure)
│   │   └── testUtils.jsx      # Shared render helpers & mock data
│   ├── App.jsx                # Root component — view state + QueryClientProvider
│   └── main.jsx               # Entry point
├── scripts/
│   └── scanBrokenBasho.js     # Utility to identify empty/broken historical basho endpoints
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── public/                    # Static assets (favicon, images)
├── index.html                 # HTML template
├── package.json
├── vite.config.js
├── vitest.config.js
└── README.md
```

</details>

## Key Implementation Details

### Caching Strategy

- All API responses have a 5-minute stale time; entries are garbage-collected after 30 minutes of inactivity
- Automatic request deduplication via React Query — identical query keys are never fetched twice concurrently
- `useBanzuke` and `useAllDivisionsBanzuke` deliberately share the same query key shape — `['banzuke', bashoId, division]` — so data fetched from the Rankings sidebar is already in cache when the Heya sidebar opens
- `useRikishiList` fetches individual rikishi via `['rikishi', id]` — if a wrestler's detail was already fetched (e.g. when a sidebar was open), the MatchHistoryModal detail pop-up is a cache hit with zero network requests
- `HeyaDashboard` prefetches all six division banzuke queries for the current basho on mount, so the Heya sidebar opens with no loading state on the first click

### Rank Movement Calculation

`src/utils/rankMovement.js` provides the core logic for rank indicators:

- **`getBanzukePosition(rank)`** — converts a rank string (e.g. `"Maegashira 5 East"`) to a unified sequential position. Sanyaku ranks (Y/O/S/K) use `maxPerSide=1` so adjacent groups are exactly one slot apart (O1W→Y1E = 1.5 ranks; S1E→O1W = 0.5 ranks). Maegashira through Jonokuchi use their full typical sizes.
- **`computeRankDelta(currentRank, prevRank)`** — signed delta in 0.5-unit rank steps using banzuke positions. Negative = improved, positive = worsened.
- **`directionFromRankValue(currRV, prevRV, currRank, prevRank)`** — determines movement direction. Uses `rankValue` from the API for cross-group comparisons (e.g. Ozeki 2 West vs Sekiwake 1 East, where the position formula bleeds across group boundaries). Falls back to banzuke position only for same-rankValue East/West distinction (e.g. Y1E vs Y1W both have `rankValue=101`).
- **`computeWrestlerRankIndicators(wrestler, rankHistory, currentBashoId, prevBashoId)`** — used by sidebars to enrich each banzuke wrestler with `{ isCareerHigh, debutType, rankMovement, rankDelta }`.
- **`computeHistoryRowIndicators(entry, index, validHistory)`** — used by `RankHistoryModal` to compute per-row indicators across the rank history table (newest-first array).

### Rate Limiting

- Maximum 60 requests per minute
- Token bucket algorithm
- Automatic queuing when limit approached
- `useRikishiList` fires ~42 parallel individual rikishi fetches for a Makuuchi sidebar — all fit within the 60 req/min window on first load; subsequent opens are served from cache

### State Management

The Zustand store (`divisionStore`) manages two independent sidebar surfaces:

| State slice | Purpose |
|---|---|
| `selectedRank/Division`, `isSidebarOpen`, `isDivisionView` | Rankings pyramid sidebar |
| `selectedHeya`, `isHeyaSidebarOpen`, `selectedHeyaRikishiIds` | Heya stable sidebar — IDs are passed from the card/row click so the sidebar can filter banzuke wrestlers without needing the (size-limited) bulk rikishi endpoint |
| `isModalOpen`, `selectedWrestler`, `selectedColor`, `selectedApiDivision` | Match history modal — `openModal` accepts optional `color` and `division` so callers outside the rankings view supply the correct header colour |
| `rankLookup`, `allWrestlers` | Cross-component data shared between the sidebar and MatchGrid for kinboshi calculation and opponent lookups |

### Division Hierarchy

1. Yokozuna (Grand Champion)
2. Ozeki
3. Sekiwake
4. Komusubi
5. Maegashira (Division 1)
6. Juryo (Division 2)
7. Makushita (Division 3)
8. Sandanme (Division 4)
9. Jonidan (Division 5)
10. Jonokuchi (Division 6)

### Groupings

- **San'yaku**: Yokozuna, Ozeki, Sekiwake, Komusubi (top 4 ranks)
- **Maku-uchi**: San'yaku + Maegashira (Division 1)
- **Sekitori**: Maku-uchi + Juryo (salaried professionals)
- **Minarai**: Makushita, Sandanme, Jonidan, Jonokuchi (apprentices)

## Browser Support

All major Chromium-based browsers are supported. Tested against the latest stable releases of:

- Chrome / Edge
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)
