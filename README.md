# <img src="public/favicon.svg" width="32" height="32" alt="Sumo Divisions Logo"> Sumo Divisions

An interactive React application for visualizing sumo wrestling divisions, rankings, and wrestler statistics. View tournament standings, wrestler records, and detailed match history in an intuitive pyramid interface, with full historical data available going back to 1958. [sumo-divisions.com](https://sumo-divisions.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/b1d4a3fe-fb6f-4a6e-be3c-6c62c36101a4/deploy-status)](https://app.netlify.com/projects/sumo-divisions/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/UncaughtTypeError/sumo-divisions/blob/master/LICENSE)

## Features

- **Hierarchical Pyramid Visualization**: 10 levels displaying all sumo ranks from Yokozuna (Grand Champion) down to Jonokuchi (entry level)
- **Division Groupings**: Visual indicators for San'yaku, Maku-uchi, Sekitori, and Minarai groupings
- **East/West Rankings**: Side-by-side grid layout showing wrestlers ranked by East and West positions
- **Win-Loss-Forfeit Records**: Fetched directly from API data for each wrestler
- **Search & Sort**: Filter rikishi by name within any rank or division view; sort by rank or win count in either direction
- **Wrestler Metadata**: Each wrestler card includes heya (stable), country of origin, and rank context
- **Match History**: Detailed view of each wrestler's matches including opponents and winning techniques (kimarite)
- **Historical Records**: Full basho data available going back to 1958 — browse any tournament in sumo history
- **Basho Selection**: View data from the current basho or any historical tournament via the basho selector
- **Real-Time Data**: Fetches current or most recent valid basho (tournament) data automatically
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Automatic Caching**: Reduces API calls and improves performance
- **Rate Limiting**: Respects API usage guidelines with built-in request throttling

## Use Case & Behavior

1. **View Pyramid**: The main screen displays a pyramid showing all 10 sumo ranks
2. **Select a Rank**: Click any rank card in the pyramid (e.g., Yokozuna, Maegashira, Juryo) to open that rank's wrestler sidebar
3. **Select a Division**: Click any division label in the legend (e.g., Makuuchi) to open the full division view, showing all ranks within that division grouped with dividers
4. **View Wrestlers**: A sidebar slides in showing all wrestlers in that rank or division, divided by East and West
5. **Filter & Sort**: Use the search bar to filter wrestlers by name; use the sort control to order by rank or win count
6. **View Match History**: Click any wrestler to see their complete match record for the selected basho
7. **Browse History**: Use the basho selector in the sidebar header to switch between tournaments, with records going back to 1958
8. **Navigate**: Close the sidebar or modal to return to the pyramid

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
