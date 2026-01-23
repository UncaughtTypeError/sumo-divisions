import { DIVISIONS, DIVISION_LEGEND, DIVISION_INFO } from '../../utils/constants';
import styles from './DivisionLegend.module.css';

function DivisionLegend() {
  return (
    <div className={styles.legendContainer}>
      {DIVISION_LEGEND.map((division) => {
        const divisionInfo = DIVISION_INFO[division.name];
        return (
          <div
            key={division.name}
            className={`${styles.legendItem} ${
              division.name === DIVISIONS.MAKUUCHI ? styles.legendItemTopDiv : ''
            }`}
          >
            <div className={styles.legendName}>
              {division.name}
              {divisionInfo && (
                <span className={styles.legendKanji}>{divisionInfo.nameJp}</span>
              )}
            </div>
            <div className={styles.legendDescription}>
              ({division.description})
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DivisionLegend;
