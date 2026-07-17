import { useState } from 'react';
import Tooltip from '../common/Tooltip';
import KimariteModal from '../modal/KimariteModal';
import { getKimariteInfo } from '../../utils/kimarite';
import {
  computeRecordOnDay, getRecordStatus, RECORD_STATUS_INFO,
} from '../../utils/records';
import styles from './TorikumiList.module.css';

// ── Result icon ───────────────────────────────────────────────────────────────

function ResultIcon({ result }) {
  if (result === 'win') return (
    <Tooltip position="top" content={<><strong>Win</strong><span>Shiroboshi (白星)</span></>}>
      <span className={styles.shiroboshi} />
    </Tooltip>
  );
  if (result === 'loss') return (
    <Tooltip position="top" content={<><strong>Loss</strong><span>Kuroboshi (黒星)</span></>}>
      <span className={styles.kuroboshi} />
    </Tooltip>
  );
  if (result === 'fusen win') return (
    <Tooltip position="top" content={<><strong>Win by Forfeit</strong><span>Fusensho (不戦勝)</span></>}>
      <span className={styles.fusenshoSquare} />
    </Tooltip>
  );
  if (result === 'fusen loss') return (
    <Tooltip position="top" content={<><strong>Loss by Forfeit</strong><span>Fusenpai (不戦敗)</span></>}>
      <span className={styles.fusenpaiSquare} />
    </Tooltip>
  );
  return null;
}

// ── KK / MK badge with tooltip ────────────────────────────────────────────────

function RecordBadge({ record, division }) {
  if (!record) return null;
  const status = getRecordStatus(record.wins, record.losses, division, record.absences);
  const info = status ? RECORD_STATUS_INFO[status] : null;
  if (!info) return null;
  return (
    <Tooltip
      content={
        <>
          <strong>{info.nameEn}</strong>
          <span>{info.nameJp}</span>
          <span>{info.description}</span>
        </>
      }
    >
      <span className={`${styles.torikumiBadge} ${info.color === 'green' ? styles.torikumiBadgeKK : styles.torikumiBadgeMK}`}>
        {info.abbrev}
      </span>
    </Tooltip>
  );
}

// ── Single bout row ───────────────────────────────────────────────────────────

function TorikumiRow({ bout, wrestlerById, day, division, onWrestlerClick, onKimariteClick }) {
  const east = wrestlerById(bout.eastId);
  const west = wrestlerById(bout.westId);

  const hasResult = !!bout.winnerId;
  const isFusen   = hasResult && bout.kimarite === 'fusen';
  const eastWon   = hasResult && bout.winnerId === bout.eastId;
  const westWon   = hasResult && bout.winnerId === bout.westId;

  const getResult = (won) => {
    if (!hasResult) return null;
    return won ? (isFusen ? 'fusen win' : 'win') : (isFusen ? 'fusen loss' : 'loss');
  };

  // Use the wrestler's own rank to determine the correct KK threshold
  const divisionFor = (wrestler, rank) => {
    const r = wrestler?.rank ?? rank ?? '';
    if (r.startsWith('Juryo')) return 'Juryo';
    return division;
  };

  const eastDiv = divisionFor(east, bout.eastRank);
  const westDiv = divisionFor(west, bout.westRank);
  const eastRecord = east ? computeRecordOnDay(east.record, day, eastDiv) : null;
  const westRecord = west ? computeRecordOnDay(west.record, day, westDiv) : null;

  const fmtRecord = (r) => r ? `${r.wins}-${r.losses}${r.absences ? `-${r.absences}` : ''}` : null;

  const renderName = (id, shikona, won) => {
    const wrestler = wrestlerById(id);
    const winnerClass = won ? ` ${styles.torikumiNameWinner}` : '';
    if (!wrestler || !onWrestlerClick) {
      return <span className={`${styles.torikumiName}${winnerClass}`}>{shikona ?? '–'}</span>;
    }
    return (
      <button
        type="button"
        className={`${styles.torikumiNameBtn}${winnerClass}`}
        onClick={() => onWrestlerClick(wrestler)}
        aria-label={`View ${shikona}'s match history`}
      >
        {shikona ?? '–'}
      </button>
    );
  };

  const renderKimarite = () => {
    if (!hasResult) return <span className={styles.torikumiVs}>vs</span>;
    const k = bout.kimarite;
    if (!k) return null;
    const info = getKimariteInfo(k);
    if (!info) return <span className={styles.torikumiKimarite}>{k}</span>;
    return (
      <button
        type="button"
        className={styles.torikumiKimariteBtn}
        onClick={() => onKimariteClick(k, info)}
        aria-label={`View details for ${k}`}
      >
        {k}
      </button>
    );
  };

  return (
    <div className={styles.torikumiRow}>
      {/* East */}
      <div className={`${styles.torikumiWrestler} ${styles.torikumiEast}`}>
        <div className={styles.torikumiNameRow}>
          <RecordBadge record={eastRecord} division={eastDiv} />
          {renderName(bout.eastId, bout.eastShikona, eastWon)}
          <ResultIcon result={getResult(eastWon)} />
        </div>
        <span className={styles.torikumiRank}>{bout.eastRank ?? east?.rank ?? ''}</span>
        {fmtRecord(eastRecord) && (
          <span className={styles.torikumiRecord}>{fmtRecord(eastRecord)}</span>
        )}
      </div>

      {/* Centre */}
      <div className={styles.torikumiCenter}>{renderKimarite()}</div>

      {/* West */}
      <div className={`${styles.torikumiWrestler} ${styles.torikumiWest}`}>
        <div className={styles.torikumiNameRow}>
          <RecordBadge record={westRecord} division={westDiv} />
          {renderName(bout.westId, bout.westShikona, westWon)}
          <ResultIcon result={getResult(westWon)} />
        </div>
        <span className={styles.torikumiRank}>{bout.westRank ?? west?.rank ?? ''}</span>
        {fmtRecord(westRecord) && (
          <span className={styles.torikumiRecord}>{fmtRecord(westRecord)}</span>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

function TorikumiList({ bouts, wrestlerById, day, division, onWrestlerClick }) {
  const [kimariteModal, setKimariteModal] = useState(null);

  return (
    <>
      <div className={styles.torikumiList}>
        <div className={styles.torikumiHeader}>
          <div className={styles.torikumiHeaderEast}>East</div>
          <div className={styles.torikumiHeaderCenter}>Kimarite</div>
          <div className={styles.torikumiHeaderWest}>West</div>
        </div>
        {bouts.map((bout, i) => (
          <TorikumiRow
            key={bout.matchNo ?? i}
            bout={bout}
            wrestlerById={wrestlerById}
            day={day}
            division={division}
            onWrestlerClick={onWrestlerClick}
            onKimariteClick={(k, info) => setKimariteModal({ kimarite: k, info })}
          />
        ))}
      </div>
      <KimariteModal
        isOpen={kimariteModal !== null}
        onClose={() => setKimariteModal(null)}
        kimarite={kimariteModal?.kimarite ?? null}
        kimariteInfo={kimariteModal?.info ?? null}
      />
    </>
  );
}

export default TorikumiList;
