import { DIVISIONS, DIVISION_LEGEND } from '../../utils/constants';
import styles from './DivisionLegend.module.css';

function DivisionLegend() {
  return (
    <div className={styles.legendContainer}>
      {DIVISION_LEGEND.map((division) => (
        <div
          key={division.name}
          className={`${styles.legendItem} ${
            division.name === DIVISIONS.MAKUUCHI
              ? styles.legendItemTopDiv
              : ''
          }`}
          style={{ borderLeftColor: division.color }}
        >
          <div className={styles.legendName}>{division.name}</div>
          <div className={styles.legendDescription}>
            ({division.description})
          </div>
        </div>
      ))}
    </div>
  );
}

export default DivisionLegend;
