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
          <h1>Sumo Divisions</h1>
        </header>
        <main className={styles.appMain}>
          <DivisionPyramid />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
