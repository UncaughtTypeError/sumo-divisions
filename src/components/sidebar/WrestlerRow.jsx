import {
  AWARD_INFO,
  AWARD_TYPES,
  RECORD_STATUS_INFO,
  getRecordStatus,
  getKinboshiCount,
  isMaegashira,
  isYokozuna,
} from '../../utils/awards';
import useDivisionStore from '../../store/divisionStore';
import Tooltip from '../common/Tooltip';
import styles from './WrestlerRow.module.css';

function WrestlerRow({ wrestler, onClick, color, division }) {
  const { rankLookup } = useDivisionStore();

  // Use the wins, losses, and absences from the API response
  const {
    wins = 0,
    losses = 0,
    absences = 0,
    awards = [],
    rank,
    record: matchRecord = [],
  } = wrestler;
  const record = `${wins}-${losses}-${absences}`;

  // Get record status (kachi-koshi or make-koshi)
  const recordStatus = getRecordStatus(wins, losses, division, absences);
  const recordStatusInfo = recordStatus
    ? RECORD_STATUS_INFO[recordStatus]
    : null;

  // Calculate kinboshi count (works for both Maegashira and Yokozuna)
  const kinboshiCount = getKinboshiCount(rank, matchRecord, rankLookup);
  const isYokozunaWrestler = isYokozuna(rank);

  const hasAnyBadges = recordStatus || awards.length > 0 || kinboshiCount > 0;

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
                    recordStatusInfo.color === 'green'
                      ? styles.kachiKoshi
                      : styles.makeKoshi
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
                    className={`${styles.award} ${
                      award === AWARD_TYPES.YUSHO ? styles.yusho : ''
                    }`}
                  >
                    {award === AWARD_TYPES.YUSHO && '🏆'}
                    {info.abbrev}
                  </span>
                </Tooltip>
              );
            })}
            {/* Kinboshi badge */}
            {kinboshiCount > 0 && (
              <Tooltip
                content={
                  <>
                    <strong>{isYokozunaWrestler ? 'Kinboshi Given' : 'Kinboshi'}</strong>
                    <span>金星</span>
                    <span>
                      {isYokozunaWrestler
                        ? 'Gold star given to Maegashira opponent'
                        : 'Gold star for defeating a Yokozuna'}
                    </span>
                  </>
                }
              >
                <span
                  className={`${styles.award} ${
                    isYokozunaWrestler ? styles.reverseKinboshi : styles.kinboshi
                  }`}
                >
                  ★{kinboshiCount}
                </span>
              </Tooltip>
            )}
          </span>
        )}
      </div>
      <div className={styles.name}>{wrestler.shikonaEn}</div>
      <div className={styles.record}>{record}</div>
    </div>
  );
}

export default WrestlerRow;
