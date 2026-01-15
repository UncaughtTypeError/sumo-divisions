import { RANK_GROUPS } from '../../utils/constants';
import styles from './RankGroupLegend.module.css';

function RankGroupLegend() {
  const positions = {
    sanyaku: { top: '165px', height: '195px', marginLeft: '1rem' },
    sekitori: { top: '32px', height: '459px' },
    minarai: { top: '494px', height: '263px' },
  };

  return (
    <div className={styles.legendWrapper}>
      <div className={styles.legendContainer}>
        {RANK_GROUPS.map((group) => (
          <div
            key={group.name}
            className={styles.legendItem}
            style={{
              borderLeftColor: group.color,
              ...positions[group.id],
            }}
          >
            <div className={styles.legendName}>{group.name}</div>
            <div className={styles.legendDescription}>
              ({group.description})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankGroupLegend;
