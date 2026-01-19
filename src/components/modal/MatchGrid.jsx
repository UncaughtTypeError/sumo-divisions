import Tooltip from '../common/Tooltip';
import styles from './MatchGrid.module.css';

function MatchGrid({ matches, color }) {
  if (!matches || matches.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No match records available</p>
      </div>
    );
  }

  const getResultDisplay = (result) => {
    return result ? result.toUpperCase() : 'Result pending' || 'Unknown';
  };

  const getResultClass = (result) => {
    if (result === 'win') return styles.resultWin;
    if (result === 'loss') return styles.resultLoss;
    return styles.resultForfeit;
  };

  const getResultCircle = (result) => {
    if (result === 'win') {
      return (
        <Tooltip
          content={
            <>
              <strong>Win</strong>
              <span>Shiroboshi (白星)</span>
            </>
          }
        >
          <span className={styles.shiroboshi} />
        </Tooltip>
      );
    }
    if (result === 'loss') {
      return (
        <Tooltip
          content={
            <>
              <strong>Loss</strong>
              <span>Kuroboshi (黒星)</span>
            </>
          }
        >
          <span className={styles.kuroboshi} />
        </Tooltip>
      );
    }
    return null;
  };

  return (
    <div className={styles.matchGridContainer}>
      {/* Header */}
      <div
        className={styles.matchGridHeader}
        style={{ backgroundColor: `var(--color-${color})` }}
      >
        <div className={styles.headerCell}>Result</div>
        <div className={styles.headerCell}>Opponent</div>
        <div className={styles.headerCell}>Kimarite</div>
      </div>

      {/* Matches */}
      <div className={styles.matchList}>
        {matches.map((match, index) => (
          <div key={index} className={styles.matchRow}>
            <div className={`${styles.cell} ${getResultClass(match.result)}`}>
              {getResultDisplay(match.result)}
              {getResultCircle(match.result)}
            </div>
            <div className={styles.cell}>
              {match.opponentShikonaEn || 'Unknown'}
            </div>
            <div className={styles.cell}>{match.kimarite || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchGrid;
