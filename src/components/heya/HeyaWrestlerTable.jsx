import {
  abbreviateRank,
  getRankSide,
  getRankTier,
  stripRankSide,
  RANK_TO_API_DIVISION,
} from '../../utils/constants';
import {
  getRecordStatus,
  getKinboshiCount,
  isYokozuna,
  RECORD_STATUS_INFO,
  RECORD_STATUS_TYPES,
} from '../../utils/records';
import { getFlagData } from '../common/flags';
import useDivisionStore from '../../store/divisionStore';
import RankBadge from '../common/RankBadge';
import AwardBadge from '../common/AwardBadge';
import KinboshiBadge, { KINBOSHI_TYPES } from '../common/KinboshiBadge';
import Tooltip from '../common/Tooltip';
import styles from './HeyaWrestlerTable.module.css';

// Each wrestler in a stable can belong to a different division, so the
// kachi-koshi/make-koshi threshold (8-of-15 vs 4-of-7) has to be resolved
// per row from that wrestler's own rank, unlike a single-division banzuke view.
function divisionOf(rank) {
  return RANK_TO_API_DIVISION[getRankTier(rank)];
}

// A record counts as "winning" once kachi-koshi is clinched, "losing" once
// make-koshi is clinched, and — while still undecided — whichever side it's
// currently leaning toward, so the split stays meaningful mid-tournament too.
function isWinningRecord(w) {
  const status = getRecordStatus(w.wins ?? 0, w.losses ?? 0, divisionOf(w.rank), w.absences ?? 0);
  if (status === RECORD_STATUS_TYPES.KACHI_KOSHI) return true;
  if (status === RECORD_STATUS_TYPES.MAKE_KOSHI) return false;
  return (w.wins ?? 0) >= (w.losses ?? 0);
}

function compareBySortOrder(a, b, sortOrder) {
  if (sortOrder === 'rank-desc') return b.rankValue - a.rankValue;
  if (sortOrder === 'wins-asc') return a.wins - b.wins;
  if (sortOrder === 'wins-desc') return b.wins - a.wins;
  return a.rankValue - b.rankValue; // rank-asc (default)
}

function RecordCell({ wrestler }) {
  const { wins = 0, losses = 0, absences = 0 } = wrestler;
  const status = getRecordStatus(wins, losses, divisionOf(wrestler.rank), absences);
  const statusInfo = status ? RECORD_STATUS_INFO[status] : null;

  return (
    <td className={styles.td}>
      <div className={styles.recordInner}>
        <span className={styles.statusSlot}>
          {statusInfo && (
            <Tooltip
              content={
                <>
                  <strong>{statusInfo.nameEn}</strong>
                  <span>{statusInfo.nameJp}</span>
                </>
              }
            >
              <span
                className={`${styles.statusBadge} ${statusInfo.color === 'green' ? styles.kachiKoshi : styles.makeKoshi}`}
              >
                {statusInfo.abbrev}
              </span>
            </Tooltip>
          )}
        </span>
        <span className={styles.recordText}>{wins}-{losses}-{absences}</span>
      </div>
    </td>
  );
}

function NameCell({ wrestler, rikishiMap, onWrestlerClick }) {
  const details = rikishiMap?.get(wrestler.rikishiID);
  const flagData = getFlagData(details?.shusshin);
  const FlagComponent = flagData?.component;

  return (
    <td className={styles.td}>
      <div className={styles.nameCellInner}>
        <Tooltip content={<><strong>{wrestler.shikonaEn}</strong><span>{wrestler.rank}</span></>}>
          <button type="button" className={styles.nameBtn} onClick={() => onWrestlerClick(wrestler)}>
            {wrestler.shikonaEn}
          </button>
        </Tooltip>
        {FlagComponent && (
          <div className={styles.metaRow}>
            <Tooltip content={details?.shusshin}>
              <FlagComponent className={styles.flag} />
            </Tooltip>
            {flagData?.code && <span className={styles.countryCode}>{flagData.code}</span>}
          </div>
        )}
      </div>
    </td>
  );
}

function StatusCell({ wrestler, rankLookup }) {
  const {
    awards = [],
    rank,
    record: matchRecord = [],
    rankMovement = null,
    rankDelta = 0,
    isCareerHigh = false,
    debutType = null,
    isKyujo = false,
  } = wrestler;

  const kinboshiCount = getKinboshiCount(rank, matchRecord, rankLookup);
  const isYokozunaWrestler = isYokozuna(rank);
  const hasAnyBadges = awards.length > 0 || kinboshiCount > 0
    || rankMovement === 'up' || rankMovement === 'down'
    || !!debutType || isCareerHigh || isKyujo;

  if (!hasAnyBadges) return <td className={styles.td} />;

  return (
    <td className={styles.td}>
      <div className={styles.badgeCluster}>
        {awards.map((award) => (
          <AwardBadge key={award} type={award} />
        ))}
        {kinboshiCount > 0 && (
          <KinboshiBadge
            type={isYokozunaWrestler ? KINBOSHI_TYPES.GIVEN : KINBOSHI_TYPES.WON}
            count={kinboshiCount}
          />
        )}
        {isKyujo && (
          <Tooltip content="Absent (Kyujo)">
            <span className={styles.kyujo}>Kyujo</span>
          </Tooltip>
        )}
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
        {(debutType === 'sanyaku-debut' || debutType === 'division-debut') && (
          <Tooltip content={debutType === 'sanyaku-debut' ? `First appearance at ${getRankTier(rank) ?? 'this rank'}` : 'Division debut'}>
            <span className={styles.rankDebut}>Debut</span>
          </Tooltip>
        )}
        {isCareerHigh && (
          <Tooltip content="New career highest rank">
            <span className={styles.careerHigh}>High</span>
          </Tooltip>
        )}
      </div>
    </td>
  );
}

function WrestlerTableRow({ wrestler, rikishiMap, rankLookup, onWrestlerClick }) {
  const side = getRankSide(wrestler.rank);
  return (
    <tr className={styles.row}>
      <td className={styles.td}>
        <RankBadge
          rank={getRankTier(wrestler.rank)}
          side={side ?? undefined}
          label={abbreviateRank(stripRankSide(wrestler.rank))}
          compact
        />
      </td>
      <NameCell wrestler={wrestler} rikishiMap={rikishiMap} onWrestlerClick={onWrestlerClick} />
      <RecordCell wrestler={wrestler} />
      <StatusCell wrestler={wrestler} rankLookup={rankLookup} />
    </tr>
  );
}

function HeyaWrestlerTable({ wrestlers, sortOrder, onWrestlerClick, rikishiMap }) {
  const { rankLookup } = useDivisionStore();

  if (wrestlers.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No rikishi found</p>
      </div>
    );
  }

  const winning = wrestlers.filter(isWinningRecord).sort((a, b) => compareBySortOrder(a, b, sortOrder));
  const losing = wrestlers.filter((w) => !isWinningRecord(w)).sort((a, b) => compareBySortOrder(a, b, sortOrder));

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <colgroup>
          <col />
          <col className={styles.colName} />
          <col />
          <col className={styles.colStatus} />
        </colgroup>
        <thead>
          <tr>
            <th className={`${styles.th} ${styles.thLeft}`}>Rank</th>
            <th className={`${styles.th} ${styles.thLeft}`}>Wrestler</th>
            <th className={`${styles.th} ${styles.thLeft}`}>Record</th>
            <th className={`${styles.th} ${styles.thLeft}`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {winning.map((w) => (
            <WrestlerTableRow
              key={w.rikishiID}
              wrestler={w}
              rikishiMap={rikishiMap}
              rankLookup={rankLookup}
              onWrestlerClick={onWrestlerClick}
            />
          ))}
          {winning.length > 0 && losing.length > 0 && (
            <tr className={styles.dividerRow} aria-hidden="true">
              <td colSpan={4}>
                <div className={styles.dividerLine}>
                  <span className={styles.dividerLabel}>
                    {winning.length} winning &middot; {losing.length} losing
                  </span>
                </div>
              </td>
            </tr>
          )}
          {losing.map((w) => (
            <WrestlerTableRow
              key={w.rikishiID}
              wrestler={w}
              rikishiMap={rikishiMap}
              rankLookup={rankLookup}
              onWrestlerClick={onWrestlerClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HeyaWrestlerTable;
