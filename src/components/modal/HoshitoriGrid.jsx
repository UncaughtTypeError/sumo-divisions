import { useState } from 'react';
import Tooltip from '../common/Tooltip';
import KimariteModal from './KimariteModal';
import { getKimariteInfo } from '../../utils/kimarite';
import useDivisionStore from '../../store/divisionStore';
import styles from './HoshitoriGrid.module.css';

function abbreviateRank(rank) {
  if (!rank) return null;
  const match = rank.match(/^(\w)\w*\s*(\d*)\s*(East|West)?$/i);
  if (!match) return rank;
  const [, firstLetter, number, side] = match;
  const sideAbbrev = side ? side[0].toLowerCase() : '';
  return `${firstLetter}${number}${sideAbbrev}`;
}

const DAYS = Array.from({ length: 15 }, (_, i) => i + 1);

function ResultShape({ result }) {
  if (result === 'win') {
    return (
      <Tooltip position="bottom" content={<><strong>Win</strong><span>Shiroboshi (白星)</span></>}>
        <span className={styles.shiroboshi} />
      </Tooltip>
    );
  }
  if (result === 'loss') {
    return (
      <Tooltip position="bottom" content={<><strong>Loss</strong><span>Kuroboshi (黒星)</span></>}>
        <span className={styles.kuroboshi} />
      </Tooltip>
    );
  }
  if (result === 'fusen win') {
    return (
      <Tooltip position="bottom" content={<><strong>Win by Forfeit</strong><span>Fusensho (不戦勝)</span></>}>
        <span className={styles.fusenshoSquare} />
      </Tooltip>
    );
  }
  if (result === 'fusen loss') {
    return (
      <Tooltip position="bottom" content={<><strong>Loss by Forfeit</strong><span>Fusenpai (不戦敗)</span></>}>
        <span className={styles.fusenpaiSquare} />
      </Tooltip>
    );
  }
  if (result === 'absent') {
    return (
      <Tooltip position="bottom" content={<><strong>Absent</strong><span>Kyūjō (休場)</span></>}>
        <span className={styles.kyujo}>休</span>
      </Tooltip>
    );
  }
  return null;
}

function HoshitoriGrid({ matches = [], color }) {
  const { allWrestlers, adjacentWrestlers, openModal } = useDivisionStore();
  const [selectedKimarite, setSelectedKimarite] = useState(null);
  const [selectedKimariteInfo, setSelectedKimariteInfo] = useState(null);

  const handleKimariteClick = (kimarite) => {
    const info = getKimariteInfo(kimarite);
    if (info) {
      setSelectedKimarite(kimarite);
      setSelectedKimariteInfo(info);
    }
  };

  const handleOpponentClick = (opponentID) => {
    const opponent =
      allWrestlers.find((w) => w.rikishiID === opponentID) ??
      adjacentWrestlers.find((w) => w.rikishiID === opponentID);
    if (opponent) openModal(opponent);
  };

  return (
    <>
      <div className={styles.wrapper}>
        {/* Day headers */}
        <div
          className={styles.row}
          style={{ backgroundColor: `var(--color-${color})` }}
        >
          {DAYS.map((day) => (
            <div key={day} className={styles.dayHeader}>
              D{day}
            </div>
          ))}
        </div>

        {/* Result shapes */}
        <div className={`${styles.row} ${styles.resultRow}`}>
          {DAYS.map((day) => {
            const match = matches[day - 1];
            return (
              <div key={day} className={styles.cell}>
                {match?.result ? <ResultShape result={match.result} /> : null}
              </div>
            );
          })}
        </div>

        {/* Opponent names */}
        <div className={`${styles.row} ${styles.nameRow}`}>
          {DAYS.map((day) => {
            const match = matches[day - 1];
            const name = match?.opponentShikonaEn ?? '';
            const opponent =
              allWrestlers.find((w) => w.rikishiID === match?.opponentID) ??
              adjacentWrestlers.find((w) => w.rikishiID === match?.opponentID);
            const isLinked = !!name && !!opponent;
            const rankAbbr = abbreviateRank(opponent?.rank);
            const tooltipContent = rankAbbr ? `${name} (${rankAbbr})` : name;
            return (
              <div key={day} className={styles.cell}>
                {name ? (
                  isLinked ? (
                    <Tooltip content={tooltipContent} position="bottom">
                      <button
                        type="button"
                        className={styles.opponentBtn}
                        onClick={() => handleOpponentClick(match.opponentID)}
                        aria-label={`View ${name}'s match history`}
                      >
                        {name}
                      </button>
                    </Tooltip>
                  ) : (
                    <Tooltip content={tooltipContent} position="bottom">
                      <span className={styles.opponentText}>{name}</span>
                    </Tooltip>
                  )
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Kimarite */}
        <div className={`${styles.row} ${styles.kimariteRow}`}>
          {DAYS.map((day) => {
            const match = matches[day - 1];
            const k = match?.kimarite;
            if (!k) return <div key={day} className={styles.cell} />;
            const info = getKimariteInfo(k);
            return (
              <div key={day} className={styles.cell}>
                {info ? (
                  <button
                    type="button"
                    className={styles.kimariteBtn}
                    onClick={() => handleKimariteClick(k)}
                    aria-label={`View details for ${k}`}
                  >
                    {k}
                  </button>
                ) : (
                  <span className={styles.kimariteText}>{k}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <KimariteModal
        isOpen={selectedKimarite !== null}
        onClose={() => {
          setSelectedKimarite(null);
          setSelectedKimariteInfo(null);
        }}
        kimarite={selectedKimarite}
        kimariteInfo={selectedKimariteInfo}
      />
    </>
  );
}

export default HoshitoriGrid;
