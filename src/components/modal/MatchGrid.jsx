import { useState } from 'react';
import Tooltip from '../common/Tooltip';
import KimariteModal from './KimariteModal';
import HeadToHeadModal from './HeadToHeadModal';
import { getKimariteInfo } from '../../utils/kimarite';
import { isKinboshiMatch, isYokozuna } from '../../utils/records';
import { abbreviateRank } from '../../utils/constants';
import useDivisionStore from '../../store/divisionStore';
import { useRikishi, useRikishiMatches } from '../../hooks/useRikishi';
import styles from './MatchGrid.module.css';

function OpponentCell({ match, opponent, openModal }) {
  const { data: opponentDetails } = useRikishi(match.opponentID, { enabled: !!match.opponentID });
  const name = match.opponentShikonaEn || 'Unknown';

  const nameEl = opponent ? (
    <button
      type="button"
      className={styles.opponentLink}
      onClick={() => openModal(opponent)}
      aria-label={`View ${name}'s match history`}
    >
      {name}
    </button>
  ) : name;

  const heya = opponentDetails?.heya;
  const shusshin = opponentDetails?.shusshin;
  if (!heya && !shusshin) return nameEl;

  return (
    <Tooltip
      position="top"
      content={
        <>
          {heya && <strong>{heya}</strong>}
          {shusshin && <span>{shusshin}</span>}
        </>
      }
    >
      {nameEl}
    </Tooltip>
  );
}

function H2HRecord({ rikishiId, opponentId }) {
  const { data, isLoading } = useRikishiMatches(rikishiId, opponentId, {
    enabled: !!rikishiId && !!opponentId,
  });
  if (isLoading) return <span className={`${styles.h2hRecord} ${styles.h2hRecordLoading}`} aria-label="Loading record"><span /><span /><span /></span>;
  if (!data) return null;
  const wins   = data.rikishiWins   ?? 0;
  const losses = data.opponentWins  ?? 0;
  const cls = wins > losses ? styles.h2hRecordWin : losses > wins ? styles.h2hRecordLoss : '';
  return <span className={`${styles.h2hRecord} ${cls}`}>{wins}-{losses}</span>;
}

function MatchGrid({ matches, color, wrestlerRank, rikishiId, rikishiName }) {
  const [selectedKimarite, setSelectedKimarite] = useState(null);
  const [selectedKimariteInfo, setSelectedKimariteInfo] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const { rankLookup, openModal, allWrestlers, adjacentWrestlers } = useDivisionStore();

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

  const findOpponent = (id) =>
    allWrestlers.find((w) => w.rikishiID === id) ??
    adjacentWrestlers.find((w) => w.rikishiID === id);

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
          {matches.map((match, index) => {
            const opponent = findOpponent(match.opponentID);
            return (
            <div key={index} className={styles.matchRow}>
              <div className={`${styles.cell} ${styles.dayNumber}`}>
                {index + 1}
              </div>
              <div className={`${styles.cell} ${getResultClass(match.result)}`}>
                {getResultDisplay(match.result)}
                {getResultCircle(match.result)}
              </div>
              <div className={styles.cell}>
                <OpponentCell match={match} opponent={opponent} openModal={openModal} />
                {opponent?.rank && (
                  <span className={styles.opponentRank}>
                    {abbreviateRank(opponent.rank)}
                  </span>
                )}
                {renderKinboshiStar(match)}
              </div>
              <div className={styles.cell}>
                {renderKimarite(match.kimarite)}
              </div>
              <div className={`${styles.cell} ${styles.h2hCell}`}>
                {rikishiId && match.opponentID && match.opponentShikonaEn ? (
                  <>
                    <H2HRecord rikishiId={rikishiId} opponentId={match.opponentID} />
                    <Tooltip content="Head-to-head history" position="left">
                      <button
                        type="button"
                        className={styles.h2hButton}
                        onClick={() => handleH2HClick(match)}
                        aria-label={`View head-to-head history with ${match.opponentShikonaEn}`}
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                          <path d="M4.5 1.5H2a1 1 0 00-1 1v6.5a1 1 0 001 1h6.5a1 1 0 001-1v-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                          <path d="M6.5 1h3.5v3.5M9.5 1.5L5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </Tooltip>
                  </>
                ) : '—'}
              </div>
            </div>
            );
          })}
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
