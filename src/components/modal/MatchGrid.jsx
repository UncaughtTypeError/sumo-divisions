import { useState } from 'react';
import Tooltip from '../common/Tooltip';
import KimariteModal from './KimariteModal';
import HeadToHeadModal from './HeadToHeadModal';
import { getKimariteInfo } from '../../utils/kimarite';
import { isKinboshiMatch, isYokozuna } from '../../utils/awards';
import useDivisionStore from '../../store/divisionStore';
import styles from './MatchGrid.module.css';

// Abbreviate rank to first letter + number + cardinal point (e.g., "Maegashira 17 East" -> "M17e")
function abbreviateRank(rank) {
  if (!rank) return null;
  const match = rank.match(/^(\w)\w*\s*(\d*)\s*(East|West)?$/i);
  if (!match) return rank;
  const [, firstLetter, number, side] = match;
  const sideAbbrev = side ? side[0].toLowerCase() : '';
  return `${firstLetter}${number}${sideAbbrev}`;
}

function MatchGrid({ matches, color, wrestlerRank, rikishiId, rikishiName }) {
  const [selectedKimarite, setSelectedKimarite] = useState(null);
  const [selectedKimariteInfo, setSelectedKimariteInfo] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const { rankLookup, openModal, allWrestlers } = useDivisionStore();

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
    if (result === 'win' || result === 'fusen win') return styles.resultWin;
    if (result === 'loss' || result === 'fusen loss') return styles.resultLoss;
    return styles.resultForfeit;
  };

  const getResultCircle = (result) => {
    if (result === 'win') {
      return (
        <Tooltip
          position="right"
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
          position="right"
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
    if (result === 'fusen win') {
      return (
        <Tooltip
          position="right"
          content={
            <>
              <strong>Win by Forfeit</strong>
              <span>Fusensho (不戦勝)</span>
            </>
          }
        >
          <span className={styles.fusenshoSquare} />
        </Tooltip>
      );
    }
    if (result === 'fusen loss') {
      return (
        <Tooltip
          position="right"
          content={
            <>
              <strong>Loss by Forfeit</strong>
              <span>Fusenpai (不戦敗)</span>
            </>
          }
        >
          <span className={styles.fusenpaiSquare} />
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

  const handleH2HClick = (match) => {
    setSelectedOpponent({ id: match.opponentID, name: match.opponentShikonaEn || 'Unknown' });
  };

  const handleCloseH2HModal = () => {
    setSelectedOpponent(null);
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
        position="right"
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

  const handleOpponentClick = (opponentID) => {
    const opponent = allWrestlers.find((w) => w.rikishiID === opponentID);
    if (opponent) {
      openModal(opponent);
    }
  };

  const renderOpponentName = (match) => {
    const name = match.opponentShikonaEn || 'Unknown';
    const isLinked = allWrestlers.some((w) => w.rikishiID === match.opponentID);
    if (!isLinked) return name;
    return (
      <button
        type="button"
        className={styles.opponentLink}
        onClick={() => handleOpponentClick(match.opponentID)}
        aria-label={`View ${name}'s match history`}
      >
        {name}
      </button>
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
          <div className={styles.headerCell}>#</div>
          <div className={styles.headerCell}>Result</div>
          <div className={styles.headerCell}>Opponent</div>
          <div className={styles.headerCell}>Kimarite</div>
          <div className={styles.headerCell}>
            <Tooltip content="Head-to-head history" position="bottom">
              <span>H2H</span>
            </Tooltip>
          </div>
        </div>

        {/* Matches */}
        <div className={styles.matchList}>
          {matches.map((match, index) => (
            <div key={index} className={styles.matchRow}>
              <div className={`${styles.cell} ${styles.dayNumber}`}>
                {index + 1}
              </div>
              <div className={`${styles.cell} ${getResultClass(match.result)}`}>
                {getResultDisplay(match.result)}
                {getResultCircle(match.result)}
              </div>
              <div className={styles.cell}>
                {renderOpponentName(match)}
                {rankLookup.get(match.opponentID) && (
                  <span className={styles.opponentRank}>
                    {abbreviateRank(rankLookup.get(match.opponentID))}
                  </span>
                )}
                {renderKinboshiStar(match)}
              </div>
              <div className={styles.cell}>
                {renderKimarite(match.kimarite)}
              </div>
              <div className={styles.cell}>
                {rikishiId && match.opponentID && match.opponentShikonaEn ? (
                  <Tooltip content="Head-to-head history" position="left">
                    <button
                      type="button"
                      className={styles.h2hButton}
                      onClick={() => handleH2HClick(match)}
                      aria-label={`View head-to-head history with ${match.opponentShikonaEn}`}
                    >
                      ⚔
                    </button>
                  </Tooltip>
                ) : '—'}
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
      <HeadToHeadModal
        isOpen={selectedOpponent !== null}
        onClose={handleCloseH2HModal}
        rikishiId={rikishiId}
        opponentId={selectedOpponent?.id}
        rikishiName={rikishiName}
        opponentName={selectedOpponent?.name}
      />
    </>
  );
}

export default MatchGrid;
