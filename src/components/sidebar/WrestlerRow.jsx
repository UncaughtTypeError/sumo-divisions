import { useState } from 'react';
import {
  AWARD_INFO,
  AWARD_TYPES,
  RECORD_STATUS_INFO,
  getRecordStatus,
  getKinboshiCount,
  isMaegashira,
  isYokozuna,
} from '../../utils/awards';
import { getFlagData } from '../common/flags';
import useDivisionStore from '../../store/divisionStore';
import Tooltip from '../common/Tooltip';
import RikishiDetailModal from '../modal/RikishiDetailModal';
import RankHistoryModal from '../modal/RankHistoryModal';
import styles from './WrestlerRow.module.css';

function RankHistoryIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden="true">
      <rect x="0"   y="6" width="2" height="5" rx="0.5" />
      <rect x="3"   y="3" width="2" height="8" rx="0.5" />
      <rect x="6"   y="1" width="2" height="10" rx="0.5" />
      <rect x="9"   y="4" width="2" height="7" rx="0.5" />
    </svg>
  );
}

function WrestlerRow({ wrestler, onClick, color, division, rikishiMap }) {
  const { rankLookup } = useDivisionStore();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRankHistoryOpen, setIsRankHistoryOpen] = useState(false);

  // Get rikishi details from the pre-fetched map (no individual API calls)
  const rikishiDetails = rikishiMap?.get(wrestler.rikishiID);
  const heya = rikishiDetails?.heya;
  const shusshin = rikishiDetails?.shusshin;
  const flagData = getFlagData(shusshin);
  const FlagComponent = flagData?.component;
  const countryCode = flagData?.code;
  const countryName = flagData?.name;

  // Use the wins, losses, and absences from the API response
  const {
    wins = 0,
    losses = 0,
    absences = 0,
    awards = [],
    rank,
    record: matchRecord = [],
    rankMovement = null,
    rankDelta = 0,
    isCareerHigh = false,
    debutType = null,
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

  const isRankDataLoading = wrestler.rankDataLoading === true;
  const hasRankIndicator = (rankMovement === 'up' || rankMovement === 'down') || !!debutType || isCareerHigh;
  const hasAnyBadges = recordStatus || awards.length > 0 || kinboshiCount > 0 || hasRankIndicator || isRankDataLoading;

  return (
    <>
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
                    <strong>
                      {isYokozunaWrestler ? 'Kinboshi Given' : 'Kinboshi'}
                    </strong>
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
                    isYokozunaWrestler
                      ? styles.reverseKinboshi
                      : styles.kinboshi
                  }`}
                >
                  ★{kinboshiCount}
                </span>
              </Tooltip>
            )}
            {/* Rank movement arrow — independent of debut/career-high */}
            {rankMovement === 'up' && (
              <Tooltip content={`Up ${rankDelta.toFixed(1)} ranks`}>
                <span className={styles.rankUp}>▲ {rankDelta.toFixed(1)}</span>
              </Tooltip>
            )}
            {rankMovement === 'down' && (
              <Tooltip content={`Down ${rankDelta.toFixed(1)} ranks`}>
                <span className={styles.rankDown}>▼ {rankDelta.toFixed(1)}</span>
              </Tooltip>
            )}
            {/* Debut badge — mutually exclusive with career-high.
                Both sanyaku and division debuts show the same "Debut" label;
                the tooltip describes which kind it is. */}
            {debutType === 'sanyaku-debut' && (
              <Tooltip content={`First appearance at ${rank?.split(' ')[0] ?? 'this rank'}`}>
                <span className={styles.rankDebut}>Debut</span>
              </Tooltip>
            )}
            {debutType === 'division-debut' && (
              <Tooltip content="Division debut">
                <span className={styles.rankDebut}>Debut</span>
              </Tooltip>
            )}
            {/* Pulsing dots while rank history is loading */}
            {isRankDataLoading && (
              <span className={styles.rankLoading} aria-label="Loading rank data">
                <span />
                <span />
                <span />
              </span>
            )}
            {/* Career high — only when NOT a debut (debut implies career high) */}
            {isCareerHigh && (
              <Tooltip content="New career highest rank">
                <span className={styles.careerHigh}>High</span>
              </Tooltip>
            )}
          </span>
        )}
      </div>
      <div className={styles.name}>{wrestler.shikonaEn}</div>
      <div className={styles.record}>{record}</div>
      <div className={styles.meta}>
        {FlagComponent && (
          <span className={styles.country}>
            <Tooltip content={shusshin} position="right">
              <FlagComponent className={styles.flag} />
            </Tooltip>
            <Tooltip content={countryName} position="right">
              <span className={styles.countryCode}>{countryCode}</span>
            </Tooltip>
          </span>
        )}
        {heya && (
          <Tooltip content="Heya (Stable)">
            <span className={styles.heya}>{heya}</span>
          </Tooltip>
        )}
        {rikishiDetails && (
          <Tooltip content="Rikishi Details" position="top">
            <button
              className={styles.infoButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailOpen(true);
              }}
              aria-label="View rikishi details"
            >
              i
            </button>
          </Tooltip>
        )}
        {rikishiDetails?.rankHistory?.length > 0 && (
          <Tooltip content="Rank history" position="top">
            <button
              className={styles.infoButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsRankHistoryOpen(true);
              }}
              aria-label="View rank history"
            >
              <RankHistoryIcon />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
    <RikishiDetailModal
      isOpen={isDetailOpen}
      onClose={() => setIsDetailOpen(false)}
      rikishiDetails={rikishiDetails}
      color={color}
    />
    <RankHistoryModal
      isOpen={isRankHistoryOpen}
      onClose={() => setIsRankHistoryOpen(false)}
      rikishiDetails={rikishiDetails}
      color={color}
    />
    </>
  );
}

export default WrestlerRow;
