import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DivisionPyramid from './components/pyramid/DivisionPyramid';
import styles from './App.module.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.appContainer}>
        <header className={styles.appHeader}>
          <h1>
            <img src="/favicon.svg" alt="" className={styles.appLogo} />
            Sumo Divisions
          </h1>
          <h2>Up to date Banzuke and Basho records</h2>
          <div className={styles.appCredits}>
            Powered by{' '}
            <a href="https://sumo-api.com" target="_blank" rel="noopener">
              <img src="/sumo-api-logo.png" alt="Sumo-API Logo" />
              Sumo-API
            </a>
          </div>
        </header>
        <main className={styles.appMain}>
          <DivisionPyramid />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
