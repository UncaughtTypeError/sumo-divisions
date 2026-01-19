import {
  AWARD_INFO,
  AWARD_TYPES,
  RECORD_STATUS_INFO,
  getRecordStatus,
} from '../../utils/awards';
import Tooltip from '../common/Tooltip';
import styles from './WrestlerRow.module.css';

function WrestlerRow({ wrestler, onClick, color, division }) {
  // Use the wins, losses, and absences from the API response
  const { wins = 0, losses = 0, absences = 0, awards = [] } = wrestler;
  const record = `${wins}-${losses}-${absences}`;

  // Get record status (kachi-koshi or make-koshi)
  const recordStatus = getRecordStatus(wins, losses, division, absences);
  const recordStatusInfo = recordStatus ? RECORD_STATUS_INFO[recordStatus] : null;

  const hasAnyBadges = recordStatus || awards.length > 0;

  return (
    <div
      className={styles.wrestlerRow}
      onClick={() => onClick(wrestler)}
      style={{ '--hover-color': `var(--color-${color})` }}
    >
      <div className={styles.rankRow}>
        <span className={styles.rank}>{wrestler.rank}</span>
        {hasAnyBadges && (
          <span className={styles.awards}>
            {/* Record status badge (KK/MK) comes first */}
            {recordStatusInfo && (
              <Tooltip
                content={
                  <>
                    <strong>{recordStatusInfo.nameEn}</strong>
                    <span>{recordStatusInfo.nameJp}</span>
                    <span>{recordStatusInfo.description}</span>
                  </>
                }
              >
                <span
                  className={`${styles.award} ${
                    recordStatusInfo.color === 'green' ? styles.kachiKoshi : styles.makeKoshi
                  }`}
                >
                  {recordStatusInfo.abbrev}
                </span>
              </Tooltip>
            )}
            {/* Award badges */}
            {awards.map((award) => {
              const info = AWARD_INFO[award];
              if (!info) return null;
              return (
                <Tooltip
                  key={award}
                  content={
                    <>
                      <strong>{info.nameEn}</strong>
                      <span>{info.nameJp}</span>
                      <span>{info.description}</span>
                    </>
                  }
                >
                  <span
                    className={`${styles.award} ${award === AWARD_TYPES.YUSHO ? styles.yusho : ''}`}
                  >
                    {award === AWARD_TYPES.YUSHO && '🏆'}
                    {info.abbrev}
                  </span>
                </Tooltip>
              );
            })}
          </span>
        )}
      </div>
      <div className={styles.name}>{wrestler.shikonaEn}</div>
      <div className={styles.record}>{record}</div>
    </div>
  );
}

export default WrestlerRow;
