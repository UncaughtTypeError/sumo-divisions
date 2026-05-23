# <img src="public/favicon.svg" width="32" height="32" alt="Sumo Divisions Logo"> Sumo Divisions

An interactive React application for visualizing sumo wrestling divisions, rankings, wrestler statistics, and stable (heya) compositions. View tournament standings, wrestler records, and detailed match history in an intuitive pyramid interface — or switch to the Heya dashboard to explore every stable's roster and divisional spread. Full historical data going back to 1958. [sumo-divisions.com](https://sumo-divisions.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/b1d4a3fe-fb6f-4a6e-be3c-6c62c36101a4/deploy-status)](https://app.netlify.com/projects/sumo-divisions/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/UncaughtTypeError/sumo-divisions/blob/master/LICENSE)

## Features

### Rankings view

- **Hierarchical Pyramid Visualization**: 10 levels displaying all sumo ranks from Yokozuna (Grand Champion) down to Jonokuchi (entry level)
- **Division Groupings**: Visual indicators for San'yaku, Maku-uchi, Sekitori, and Minarai groupings
- **East/West Rankings**: Side-by-side grid layout showing wrestlers ranked by East and West positions
- **Win-Loss-Forfeit Records**: Fetched directly from API data for each wrestler
- **Search & Sort**: Filter rikishi by name within any rank or division view; sort by rank or win count in either direction
- **Filter by Day**: Dropdown to show only wrestlers who competed on a specific tournament day, excluding absences and forfeits
- **Wrestler Metadata**: Each wrestler card includes heya (stable), country of origin, and rank context
- **Rank Movement Indicators**: Each wrestler card shows how their rank changed since the previous basho — promotion (▲) or demotion (▼) with the number of rank positions moved, a debut badge for first appearances at a sanyaku rank or division, and a career-high badge the first time a wrestler reaches their personal best rank
- **Match History**: Detailed view of each wrestler's basho record in two tabs — a **Match History** list with day number, result, opponent, kimarite, and head-to-head access per bout, and a **Hoshitori** grid showing the full 15-day record using traditional win/loss symbols (shiroboshi/kuroboshi), with opponent names and kimarite arranged by day
- **Head-to-Head Records**: Historical match record between any two wrestlers, including win/loss totals, win percentage, and sortable match details

### Rikishi detail

- **Rikishi Info Pop-up**: Country, stable, height, weight, age, debut date, career highest rank, and retirement date for retired wrestlers
- **Full Rank History**: A separate pop-up showing every basho's rank entry with movement indicators (▲/▼), debut badges, and career-high badges per row, plus a summary of total bashos, climbs, and drops

### Wrestler sidebar — Banzuke & Torikumi tabs

- **Banzuke tab**: Full wrestler roster for the selected rank or division, with search, sort, day filter, KK/MK badges, rank movement indicators, and match-history access
- **Torikumi tab**: Scheduled and completed bout matchups for each tournament day — East vs West layout with kimarite (winning technique), result icons (shiroboshi/kuroboshi/fusen), and running W-L records per wrestler
- **Live results**: A refresh button appears on the current tournament day whenever results are still pending; auto-refresh fires every 3 minutes while pending results remain, backing off exponentially after three missed updates and stopping after five back-off attempts
- **Rank filter**: Selecting a specific Makuuchi rank (e.g. Sekiwake) filters torikumi to bouts involving wrestlers at that rank; Makuuchi shows all bouts

### Heya (Stable) dashboard

- **Heya Grid**: Sortable table showing every stable with per-rank wrestler counts across all six divisions; sticky header; coloured rank badges with tooltips in each cell
- **Heya Cards**: Responsive card layout for each stable showing name, total count, and rank badge rows split by sekitori and apprentice tiers
- **Dual Search**: Filter stables by name or by any rikishi within them
- **Sort Controls**: Sort by heya name, any individual rank, or total count (ascending/descending) in both grid and card layouts
- **Heya Sidebar**: Click any stable to open a sidebar listing all its wrestlers for the current basho, grouped by rank/division — same wrestler rows, awards, records, rank movement indicators, and match-history as the rankings sidebar

### General

- **View Toggle**: Tabbed interface to switch between the Rankings pyramid and Heya dashboard
- **Historical Records**: Full basho data available going back to 1958 — browse any tournament in sumo history
- **Basho Selection**: View data from the current basho or any historical tournament via the basho selector
- **Real-Time Data**: Fetches current or most recent valid basho (tournament) data automatically
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Automatic Caching**: Reduces API calls and improves performance; shared cache means data fetched in one view is reused in another
- **Rate Limiting**: Respects API usage guidelines with built-in request throttling

## Use Case & Behavior

### Rankings view

1. **View Pyramid**: The Rankings tab displays a pyramid showing all 10 sumo ranks
2. **Select a Rank**: Click any rank card in the pyramid (e.g., Yokozuna, Maegashira, Juryo) to open that rank's wrestler sidebar
3. **Select a Division**: Click any division label in the legend (e.g., Makuuchi) to open the full division view, showing all ranks within that division grouped with dividers
4. **Wrestler Sidebar**: A sidebar slides in with two tabs — **Banzuke** (default) and **Torikumi**
5. **Banzuke tab**: Browse wrestlers divided by East and West; rank movement indicators (▲/▼), debut badges, and career-high badges load automatically; filter by name, sort by rank or wins, and use the day dropdown to view records as of a specific tournament day — absent wrestlers are shown with a Kyujo badge
6. **Torikumi tab**: View scheduled and completed bouts for any tournament day; use the day selector to navigate, filter by wrestler name, or reverse bout order; click a kimarite to read its description; click a wrestler name to open their match history; a refresh button appears on the current day while results are still coming in
7. **View Match History**: Click any wrestler (from either tab) to open their match history modal; switch between the **Match History** tab (day-by-day list of opponents, kimarite, and head-to-head buttons) and the **Hoshitori** tab (traditional 15-day grid using shiroboshi/kuroboshi symbols, with opponent names and kimarite per column); rank movement indicators also appear in the modal header
8. **View Rikishi Detail**: Click the **i** icon on any wrestler card to see personal details including career highest rank and retirement date (for retired wrestlers); click the bar-chart icon to open the full rank history across all bashos
9. **Browse History**: Use the basho selector in the sidebar header to switch between tournaments, with records going back to 1958
10. **Navigate**: Close the sidebar or modal to return to the pyramid

### Heya dashboard

1. **Switch View**: Click the **Heya** tab to open the stable dashboard
2. **Browse Stables**: View all heya in card layout (default) or switch to the sortable grid layout
3. **Search**: Type in the heya search box to filter by stable name, or use the rikishi search to find the stable any wrestler belongs to
4. **Sort**: In card layout use the sort dropdown; in grid layout click any column header to sort ascending or descending
5. **Open a Stable**: Click any card or grid row to open the heya sidebar — all rikishi in that stable for the current basho, grouped by rank, with rank movement indicators
6. **Explore Wrestlers**: The heya sidebar behaves identically to the rankings sidebar — click any wrestler for full match history, use search and sort, switch basho via the selector
7. **Navigate**: Close the heya sidebar to return to the dashboard

## License

MIT

## Acknowledgments

- Data provided by [Sumo API](https://www.sumo-api.com/)
- Sumo wrestling ranking system based on the Japan Sumo Association's official banzuke

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, project structure, and development guidelines.

## Contact

For bug reports, feature requests, or questions, please [open an issue](https://github.com/UncaughtTypeError/sumo-divisions/issues) on the GitHub repository.

For other inquiries, [contact me](mailto:nathan.shepherd8@gmail.com).
