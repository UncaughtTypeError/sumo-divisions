# <img src="public/favicon.svg" width="32" height="32" alt="Sumo Divisions Logo"> Sumo Divisions

An interactive React application for visualizing sumo wrestling divisions, rankings, and wrestler statistics. View tournament standings, wrestler records, and detailed match history in an intuitive pyramid interface. [sumo-divisions.com](https://sumo-divisions.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/b1d4a3fe-fb6f-4a6e-be3c-6c62c36101a4/deploy-status)](https://app.netlify.com/projects/sumo-divisions/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/UncaughtTypeError/sumo-divisions/blob/master/LICENSE)

## Features

- **Hierarchical Pyramid Visualization**: 10 levels displaying all sumo ranks from Yokozuna (Grand Champion) down to Jonokuchi (entry level)
- **Division Groupings**: Visual indicators for San'yaku, Maku-uchi, Sekitori, and Minarai groupings
- **East/West Rankings**: Side-by-side grid layout showing wrestlers ranked by East and West positions
- **Win-Loss-Forfeit Records**: Fetched directly from API data for each wrestler
- **Match History**: Detailed view of each wrestler's matches including opponents and winning techniques (kimarite)
- **Basho Selection**: View data from current basho or any historical tournament
- **Real-Time Data**: Fetches current or most recent valid basho (tournament) data with ability to browse past tournaments
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Automatic Caching**: Reduces API calls and improves performance
- **Rate Limiting**: Respects API usage guidelines with built-in request throttling

## Use Case & Behavior

1. **View Pyramid**: The main screen displays a pyramid showing all 10 sumo ranks
2. **Select Division**: Click any rank in the pyramid (e.g., Yokozuna, Maegashira, Juryo)
3. **View Wrestlers**: A sidebar slides in showing all wrestlers in that rank, divided by East and West
4. **View Match History**: Click any wrestler to see their complete match record for the current basho
5. **Navigate**: Close sidebar or modal to return to previous view

## Technology Stack

### Core

- **React 18+** - UI framework with hooks
- **Vite** - Fast build tool and development server
- **JavaScript (ES6+)** - Modern JavaScript features

### State Management & Data Fetching

- **Zustand** - Lightweight state management
- **React Query (TanStack Query)** - Data fetching, caching, and synchronization
- **Axios** - HTTP client with interceptors

### Styling

- **CSS Modules** - Component-scoped styling
- **CSS Custom Properties** - Design tokens and theming
- **CSS Grid & Flexbox** - Modern layout (no HTML tables)

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

- `GET /api/basho/:bashoId/banzuke/:division` - Fetch wrestler rankings and records
- `GET /api/basho/:bashoId` - Fetch tournament results (yusho winners, special prizes)

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

## Project Structure

```
sumo-divisions/
├── src/
│   ├── components/
│   │   ├── pyramid/           # Pyramid visualization
│   │   │   ├── DivisionPyramid.jsx
│   │   │   ├── PyramidLegend.jsx
│   │   │   └── RankCard.jsx
│   │   ├── sidebar/           # Wrestler list sidebar
│   │   │   ├── WrestlerSidebar.jsx
│   │   │   ├── WrestlerGrid.jsx
│   │   │   ├── WrestlerRow.jsx
│   │   │   ├── BashoSelector.jsx
│   │   │   └── BashoWinners.jsx
│   │   ├── modal/             # Match history modal
│   │   │   ├── MatchHistoryModal.jsx
│   │   │   └── MatchGrid.jsx
│   │   └── common/            # Shared components
│   │       ├── Loading.jsx
│   │       └── ErrorMessage.jsx
│   ├── services/
│   │   ├── api/               # API client & services
│   │   │   ├── sumoApi.js
│   │   │   ├── banzukeService.js
│   │   │   ├── bashoService.js
│   │   │   └── apiConfig.js
│   │   └── rateLimiter/       # Rate limiting
│   │       └── rateLimiter.js
│   ├── store/
│   │   └── divisionStore.js   # Zustand state management
│   ├── hooks/
│   │   ├── useBanzuke.js      # Banzuke data hook
│   │   └── useBashoResults.js # Basho results hook
│   ├── utils/
│   │   ├── bashoId.js         # BashoId calculation
│   │   ├── awards.js          # Wrestler awards utility
│   │   └── constants.js       # App constants
│   ├── styles/
│   │   ├── global.css         # Global styles
│   │   └── variables.css      # CSS custom properties
│   ├── __tests__/             # Test files
│   ├── App.jsx                # Root component
│   └── main.jsx               # Entry point
├── public/                    # Static assets (favicon, images)
├── index.html                 # HTML template
├── package.json
├── vite.config.js
├── vitest.config.js
└── README.md
```

## Key Implementation Details

### Caching Strategy

- All API responses cached for 5 minutes (stale time)
- Cache persists for 30 minutes
- Automatic request deduplication via React Query
- Makuuchi division cached once, filtered for San'yaku ranks

### Rate Limiting

- Maximum 60 requests per minute
- Token bucket algorithm
- Automatic queuing when limit approached
- User-friendly error messages

### Win-Loss-Forfeit Calculation

Records are derived from the `wins`, `losses`, and `absences` fields in the API response for each wrestler. These values are provided directly by the API rather than calculated from match data.

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

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Acknowledgments

- Data provided by [Sumo API](https://www.sumo-api.com/)
- Sumo wrestling ranking system based on the Japan Sumo Association's official banzuke

## Contributing

This is a community project. Feel free to fork and modify for your own use.

## Contact

For issues or questions, please open an issue on the GitHub repository.

For other inquiries, [contact me](mailto:nathan.shepherd8@gmail.com).
