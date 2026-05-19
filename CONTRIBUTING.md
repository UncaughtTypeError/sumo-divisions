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
- **CSS Grid & Flexbox** - Primary layout primitives; `<table>` is used only where tabular data semantics apply (Heya grid)

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

- `GET /api/rikishis` - Fetch all active rikishi (heya, shusshin, current rank, personal details). Cached for 1 hour; used by both the Rankings sidebar and the Heya dashboard.
- `GET /api/basho/:bashoId/banzuke/:division` - Fetch wrestler rankings and records for one division. Cached under the key `['banzuke', bashoId, division]` — the same key is used by `useBanzuke` (single division) and `useAllDivisionsBanzuke` (all six in parallel), so data fetched in one view is immediately available in the other.
- `GET /api/basho/:bashoId` - Fetch tournament results (yusho winners, special prizes)
- `GET /api/rikishi/:id` - Fetch a single rikishi's profile (opened via the detail modal)
- `GET /api/rikishi/:id/matches/:opponentId` - Head-to-head match history between two wrestlers

### BashoId Logic

Sumo bashos (tournaments) occur **6 times per year** in odd months only:

- January (01)
- March (03)
- May (05)
- July (07)
- September (09)
- November (11)

The application automatically calculates the current or most recent valid basho ID. If the current month is invalid (e.g., February), it falls back to the most recent valid month (e.g., January).

### Data Structure

```javascript
{
  bashoId: "202601",
  division: "Makuuchi",
  east: [
    {
      rikishiID: 19,
      shikonaEn: "Hoshoryu",
      rank: "Yokozuna 1 East",
      rankValue: 101,
      record: [
        {
          result: "win",
          opponentShikonaEn: "Wakamotoharu",
          kimarite: "yoritaoshi"
        },
        // ... more matches
      ]
    }
  ],
  west: [...]
}
```

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
│   │   │   └── RikishiDetailModal.jsx
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
│   │   ├── useBanzuke.js           # Single-division banzuke data
│   │   ├── useBashoResults.js      # Tournament results (yusho, special prizes)
│   │   ├── useRikishi.js           # All rikishi roster + single rikishi + head-to-head
│   │   ├── useHeyaData.js          # Derives stable list from useAllRikishi
│   │   ├── useAllDivisionsBanzuke.js  # Parallel fetch across all 6 divisions (shared cache)
│   │   └── useLocalStorage.js      # useState wrapper that reads/writes localStorage (user preferences)
│   ├── utils/
│   │   ├── bashoId.js         # BashoId calculation
│   │   ├── awards.js          # Awards & record status logic
│   │   ├── constants.js       # App constants (ranks, divisions, colours, abbreviations)
│   │   ├── kimarite.js        # Kimarite (technique) data
│   │   └── flags.js           # Country flag lookup
│   ├── styles/
│   │   ├── global.css         # Global styles
│   │   └── variables.css      # CSS custom properties
│   ├── __tests__/             # Test files (mirrors src structure)
│   │   └── testUtils.jsx      # Shared render helpers & mock data
│   ├── App.jsx                # Root component — view state + QueryClientProvider
│   └── main.jsx               # Entry point
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
- `useBanzuke` and `useAllDivisionsBanzuke` deliberately share the same query key shape — `['banzuke', bashoId, division]` — so data fetched from the Rankings sidebar is already in cache when the Heya sidebar opens, and vice versa
- `useAllRikishi` is cached for 1 hour (roster data changes infrequently); the resulting `rikishiMap` is memoized separately for O(1) lookups
- `HeyaDashboard` prefetches all six division banzuke queries for the current basho on mount, so the Heya sidebar opens with no loading state on the first click

### Rate Limiting

- Maximum 60 requests per minute
- Token bucket algorithm
- Automatic queuing when limit approached
- User-friendly error messages

### State Management

The Zustand store (`divisionStore`) manages two independent sidebar surfaces:

| State slice | Purpose |
|---|---|
| `selectedRank/Division`, `isSidebarOpen`, `isDivisionView` | Rankings pyramid sidebar |
| `selectedHeya`, `isHeyaSidebarOpen` | Heya stable sidebar |
| `isModalOpen`, `selectedWrestler`, `selectedColor`, `selectedApiDivision` | Match history modal — `openModal` accepts optional `color` and `division` so callers outside the rankings view (e.g. the heya sidebar) can supply the correct header colour |
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
