import { DIVISIONS, DIVISION_LEGEND, DIVISION_INFO, PYRAMID_LEVELS } from '../../utils/constants';
import useDivisionStore from '../../store/divisionStore';
import styles from './DivisionLegend.module.css';

// Map each non-Makuuchi division to its color (rank === division for these)
const divisionColorMap = Object.fromEntries(
  PYRAMID_LEVELS
    .filter((level) => level.rank === level.division)
    .map((level) => [level.division, level.color])
);

function DivisionLegend() {
  const { selectRank, selectDivision } = useDivisionStore();

  const handleDivisionClick = (divisionName) => {
    if (divisionName === DIVISIONS.MAKUUCHI) {
      selectDivision(DIVISIONS.MAKUUCHI, 'Makuuchi', 'makuuchi');
    } else {
      const color = divisionColorMap[divisionName];
      selectRank(divisionName, divisionName, divisionName, color);
    }
  };

  return (
    <div className={styles.legendContainer}>
      {DIVISION_LEGEND.map((division) => {
        const divisionInfo = DIVISION_INFO[division.name];
        return (
          <div
            key={division.name}
            role="button"
            tabIndex={0}
            aria-label={division.name}
            className={`${styles.legendItem} ${styles.legendItemClickable} ${
              division.name === DIVISIONS.MAKUUCHI ? styles.legendItemTopDiv : ''
            }`}
            onClick={() => handleDivisionClick(division.name)}
            onKeyDown={(e) => e.key === 'Enter' && handleDivisionClick(division.name)}
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
