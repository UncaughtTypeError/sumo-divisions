import WrestlerRow from './WrestlerRow';
import styles from './WrestlerGrid.module.css';

function WrestlerGrid({ wrestlers, side, onWrestlerClick }) {
  if (!wrestlers || wrestlers.length === 0) {
    return (
      <div className={styles.emptyColumn}>
        <p>No rikishi in {side}</p>
      </div>
    );
  }

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h3>{side}</h3>
        <span className={styles.count}>({wrestlers.length})</span>
      </div>
      <div className={styles.wrestlerList}>
        {wrestlers.map((wrestler) => (
          <WrestlerRow
            key={wrestler.rikishiID}
            wrestler={wrestler}
            onClick={onWrestlerClick}
          />
        ))}
      </div>
    </div>
  );
}

export default WrestlerGrid;
