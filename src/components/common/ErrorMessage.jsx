import styles from './ErrorMessage.module.css';

function ErrorMessage({ error, onRetry }) {
  const errorMessage =
    error?.message ||
    'An error has occurred attempting to fetch the Banzuke data.';

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorBox}>
        <h3 className={styles.errorTitle}>Error</h3>
        <p className={styles.errorMessage}>{errorMessage}</p>
        {onRetry && (
          <button onClick={onRetry} className={styles.retryButton}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
