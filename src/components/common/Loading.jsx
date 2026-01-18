import styles from './Loading.module.css';

function Loading({ message = 'Loading...', color }) {
  return (
    <div className={styles.loadingContainer}>
      <div
        className={styles.spinner}
        style={color ? { borderTopColor: `var(--color-${color})` } : undefined}
      ></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export default Loading;
