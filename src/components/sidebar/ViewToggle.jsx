import styles from './ViewToggle.module.css';

function ViewToggle({ value, onChange }) {
  return (
    <div className={styles.viewToggle} role="group" aria-label="Wrestler list view">
      <button
        type="button"
        className={`${styles.viewButton} ${value === 'card' ? styles.viewButtonActive : ''}`}
        onClick={() => onChange('card')}
        aria-label="Card view"
        aria-pressed={value === 'card'}
      >
        ⊞
      </button>
      <button
        type="button"
        className={`${styles.viewButton} ${value === 'grid' ? styles.viewButtonActive : ''}`}
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        aria-pressed={value === 'grid'}
      >
        ☰
      </button>
    </div>
  );
}

export default ViewToggle;
