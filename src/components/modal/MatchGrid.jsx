import { useState } from 'react';
import Tooltip from '../common/Tooltip';
import KimariteModal from './KimariteModal';
import { getKimariteInfo } from '../../utils/kimarite';
import { isKinboshiMatch, isYokozuna } from '../../utils/awards';
import useDivisionStore from '../../store/divisionStore';
import styles from './MatchGrid.module.css';

function MatchGrid({ matches, color, wrestlerRank }) {
  const [selectedKimarite, setSelectedKimarite] = useState(null);
  const [selectedKimariteInfo, setSelectedKimariteInfo] = useState(null);
  const { rankLookup } = useDivisionStore();

  if (!matches || matches.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No match records available</p>
      </div>
    );
  }

  const isYokozunaWrestler = isYokozuna(wrestlerRank);

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

  const handleKimariteClick = (kimarite) => {
    const info = getKimariteInfo(kimarite);
    if (info) {
      setSelectedKimarite(kimarite);
      setSelectedKimariteInfo(info);
    }
  };

  const handleCloseKimariteModal = () => {
    setSelectedKimarite(null);
    setSelectedKimariteInfo(null);
  };

  const renderKimarite = (kimarite) => {
    if (!kimarite) return '—';

    const info = getKimariteInfo(kimarite);

    if (!info) {
      // Unknown kimarite - display without click functionality
      return kimarite;
    }

    return (
      <button
        type="button"
        className={styles.kimarite}
        onClick={() => handleKimariteClick(kimarite)}
        aria-label={`View details for ${kimarite}`}
      >
        {kimarite}
      </button>
    );
  };

  const renderKinboshiStar = (match) => {
    if (!isKinboshiMatch(wrestlerRank, match, rankLookup)) {
      return null;
    }

    return (
      <Tooltip
        content={
          <>
            <strong>Kinboshi</strong>
            <span>金星</span>
            <span>
              {isYokozunaWrestler
                ? 'Gold star awarded to opponent'
                : 'Gold star for defeating a Yokozuna'}
            </span>
          </>
        }
      >
        <span
          className={
            isYokozunaWrestler ? styles.reverseKinboshiStar : styles.kinboshiStar
          }
        >
          ★
        </span>
      </Tooltip>
    );
  };

  return (
    <>
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
                {renderKinboshiStar(match)}
              </div>
              <div className={styles.cell}>
                {renderKimarite(match.kimarite)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <KimariteModal
        isOpen={selectedKimarite !== null}
        onClose={handleCloseKimariteModal}
        kimarite={selectedKimarite}
        kimariteInfo={selectedKimariteInfo}
      />
    </>
  );
}

export default MatchGrid;
