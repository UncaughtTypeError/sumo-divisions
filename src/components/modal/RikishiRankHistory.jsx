import { useMemo } from 'react';
import { computeHistoryRowIndicators, getBanzukePosition } from '../../utils/rankMovement';
import { RECORD_STATUS_INFO, RECORD_STATUS_TYPES } from '../../utils/records';
import { AWARD_TYPES } from '../../utils/awards';
import KinboshiBadge, { KINBOSHI_TYPES } from '../common/KinboshiBadge';
import { BASHO_NICKNAMES, getCurrentBashoId } from '../../utils/bashoId';
import Tooltip from '../common/Tooltip';
import AwardBadge from '../common/AwardBadge';
import { useRikishiAllMatches } from '../../hooks/useRikishi';
import { useCareerStats } from '../../hooks/useCareerStats';
import styles from './RankHistoryModal.module.css';

const KK_INFO = RECORD_STATUS_INFO[RECORD_STATUS_TYPES.KACHI_KOSHI];
const MK_INFO = RECORD_STATUS_INFO[RECORD_STATUS_TYPES.MAKE_KOSHI];

function formatBashoId(bashoId) {
  if (!bashoId || bashoId.length !== 6) return bashoId;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const year  = bashoId.slice(0, 4);
  const month = parseInt(bashoId.slice(4, 6), 10);
  const nickname = BASHO_NICKNAMES[month];
  const dateStr = `${months[month - 1]} ${year}`;
  return nickname ? `${dateStr} · ${nickname.short}` : dateStr;
}

function RowIndicators({ movement, delta, debutType, isCareerHigh }) {
  const hasAny = movement === 'up' || movement === 'down' || debutType || isCareerHigh;
  if (!hasAny) return null;
  return (
    <span className={styles.indicators}>
      {movement === 'up' && (
        <Tooltip content={`Up ${delta.toFixed(1)} ranks`} position="top">
          <span className={styles.rankUp}>▲ {delta.toFixed(1)}</span>
        </Tooltip>
      )}
      {movement === 'down' && (
        <Tooltip content={`Down ${delta.toFixed(1)} ranks`} position="top">
          <span className={styles.rankDown}>▼ {delta.toFixed(1)}</span>
        </Tooltip>
      )}
      {debutType === 'sanyaku-debut' && (
        <Tooltip content="First appearance at this rank" position="left">
          <span className={styles.rankDebut}>Debut</span>
        </Tooltip>
      )}
      {debutType === 'division-debut' && (
        <Tooltip content="Division debut" position="left">
          <span className={styles.rankDebut}>Debut</span>
        </Tooltip>
      )}
      {isCareerHigh && (
        <Tooltip content="New career highest rank" position="left">
          <span className={styles.careerHigh}>High</span>
        </Tooltip>
      )}
    </span>
  );
}

function RikishiRankHistory({ rikishiDetails }) {
  const rikishiId = rikishiDetails?.id;
  const rankHistory = rikishiDetails?.rankHistory ?? [];
  const displayHistory = rankHistory.filter((h) => h.rankValue != null && h.rankValue < 2000);

  const rowData = displayHistory.map((entry, index) => ({
    entry,
    indicators: computeHistoryRowIndicators(entry, index, displayHistory),
  }));

  const improved = rowData.filter((r) => r.indicators.movement === 'up').length;
  const dropped  = rowData.filter((r) => r.indicators.movement === 'down').length;
  const careerBestEntry = displayHistory.length > 0
    ? displayHistory.reduce((best, h) => {
        const pos     = getBanzukePosition(h.rank);
        const bestPos = getBanzukePosition(best.rank);
        return pos !== null && (bestPos === null || pos < bestPos) ? h : best;
      })
    : null;

  const { data: allMatchesData, isLoading: matchesLoading } = useRikishiAllMatches(rikishiId, { enabled: !!rikishiId && displayHistory.length > 0 });

  const careerStats = useCareerStats(rikishiId);
  const awardSets = useMemo(() => ({
    yusho:              new Set(careerStats?.yushoBashos     ?? []),
    shukunsho:          new Set(careerStats?.shukunshoBashos ?? []),
    kantosho:           new Set(careerStats?.kantoshoBashos  ?? []),
    ginosho:            new Set(careerStats?.ginoshoBashos   ?? []),
    kinboshiWonByBasho:   careerStats?.kinboshiWonByBasho   ?? {},
    kinboshiGivenByBasho: careerStats?.kinboshiGivenByBasho ?? {},
  }), [careerStats]);

  const recordByBasho = useMemo(() => {
    if (!allMatchesData?.records || !rikishiId) return {};
    const currentBashoId = getCurrentBashoId();
    const map = {};
    for (const match of allMatchesData.records) {
      const { bashoId, winnerId, division } = match;
      if (!map[bashoId]) {
        const upperDiv = division === 'Makuuchi' || division === 'Juryo';
        map[bashoId] = { wins: 0, losses: 0, expectedBouts: upperDiv ? 15 : 7, division };
      }
      if (winnerId === rikishiId) map[bashoId].wins++;
      else map[bashoId].losses++;
    }
    for (const [bashoId, rec] of Object.entries(map)) {
      rec.absences = bashoId === currentBashoId
        ? 0
        : Math.max(0, rec.expectedBouts - rec.wins - rec.losses);
    }
    return map;
  }, [allMatchesData, rikishiId]);

  const bestRecord = useMemo(() => {
    const entries = Object.values(recordByBasho);
    if (entries.length === 0) return null;
    return entries.reduce((best, rec) => {
      if (!best) return rec;
      if (rec.wins > best.wins) return rec;
      if (rec.wins === best.wins && rec.losses < best.losses) return rec;
      return best;
    }, null);
  }, [recordByBasho]);

  if (displayHistory.length === 0) {
    return <p className={styles.empty}>No rank history available.</p>;
  }

  const bestRecordStr = bestRecord
    ? `${bestRecord.wins}-${bestRecord.losses}${bestRecord.absences > 0 ? `-${bestRecord.absences}` : ''}`
    : null;

  return (
    <>
      <div className={styles.summary}>
        {careerBestEntry && (
          <span className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Career highest rank</span>
            <span className={styles.summaryValue}>{careerBestEntry.rank}</span>
          </span>
        )}
        <span className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Bashos</span>
          <span className={styles.summaryValue}>{displayHistory.length}</span>
        </span>
        {(careerStats?.yusho > 0 || careerStats?.shukunsho > 0 || careerStats?.kantosho > 0 || careerStats?.ginosho > 0 || careerStats?.kinboshiWon > 0 || careerStats?.kinboshiGiven > 0) && (
          <span className={styles.summaryItem}>
            <span className={styles.awardBadges}>
              {careerStats.yusho > 0 && <AwardBadge type={AWARD_TYPES.YUSHO} count={careerStats.yusho} />}
              {careerStats.shukunsho > 0 && <AwardBadge type={AWARD_TYPES.SHUKUN_SHO} count={careerStats.shukunsho} />}
              {careerStats.kantosho > 0 && <AwardBadge type={AWARD_TYPES.KANTO_SHO} count={careerStats.kantosho} />}
              {careerStats.ginosho > 0 && <AwardBadge type={AWARD_TYPES.GINO_SHO} count={careerStats.ginosho} />}
              {careerStats.kinboshiWon > 0 && <KinboshiBadge type={KINBOSHI_TYPES.WON} count={careerStats.kinboshiWon} />}
              {careerStats.kinboshiGiven > 0 && <KinboshiBadge type={KINBOSHI_TYPES.GIVEN} count={careerStats.kinboshiGiven} />}
            </span>
          </span>
        )}
      </div>

      <div className={styles.statsRow}>
        {matchesLoading ? (
          <span className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Career best record</span>
            <span className={styles.recordLoading} aria-label="Loading record"><span /><span /><span /></span>
          </span>
        ) : bestRecord ? (
          <span className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Career best record</span>
            <span className={styles.summaryValue}>{bestRecordStr}</span>
            <span className={styles.summaryLabel}>· {bestRecord.division}</span>
          </span>
        ) : null}
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryValue} ${styles.summaryUp}`}>▲ {improved}</span>
          <span className={styles.summaryLabel}> climbs</span>
        </span>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryValue} ${styles.summaryDown}`}>▼ {dropped}</span>
          <span className={styles.summaryLabel}> drops</span>
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Tournament</th>
              <th className={styles.th}>Rank</th>
              <th className={styles.th}>Record</th>
              <th className={styles.th}>Change</th>
            </tr>
          </thead>
          <tbody>
            {rowData.map(({ entry, indicators }) => {
              const record = recordByBasho[entry.bashoId];
              const recordStr = matchesLoading
                ? <span className={styles.recordLoading} aria-label="Loading record"><span /><span /><span /></span>
                : record
                  ? `${record.wins}-${record.losses}${record.absences > 0 ? `-${record.absences}` : ''}`
                  : '—';
              const totalLosses = record ? record.losses + record.absences : 0;
              const threshold = record ? Math.floor(record.expectedBouts / 2) + 1 : 0;
              const badge = !matchesLoading && record && (
                record.wins >= threshold && record.wins > totalLosses ? (
                  <Tooltip position="top" content={<><strong>{KK_INFO.nameEn}</strong><span>{KK_INFO.nameJp}</span><span>{KK_INFO.description}</span></>}>
                    <span className={styles.kkBadge}>KK</span>
                  </Tooltip>
                ) : totalLosses >= threshold && totalLosses > record.wins ? (
                  <Tooltip position="top" content={<><strong>{MK_INFO.nameEn}</strong><span>{MK_INFO.nameJp}</span><span>{MK_INFO.description}</span></>}>
                    <span className={styles.mkBadge}>MK</span>
                  </Tooltip>
                ) : null
              );
              return (
                <tr key={entry.id ?? entry.bashoId} className={styles.row}>
                  <td className={`${styles.td} ${styles.tdTournament}`}>
                    {formatBashoId(entry.bashoId)}
                    {(() => {
                      const wonCount   = awardSets.kinboshiWonByBasho[entry.bashoId]   ?? 0;
                      const givenCount = awardSets.kinboshiGivenByBasho[entry.bashoId] ?? 0;
                      const hasAward   = awardSets.yusho.has(entry.bashoId) || awardSets.shukunsho.has(entry.bashoId) || awardSets.kantosho.has(entry.bashoId) || awardSets.ginosho.has(entry.bashoId);
                      if (!hasAward && wonCount === 0 && givenCount === 0) return null;
                      return (
                        <span className={styles.awardBadges}>
                          {awardSets.yusho.has(entry.bashoId)     && <AwardBadge type={AWARD_TYPES.YUSHO} />}
                          {awardSets.shukunsho.has(entry.bashoId) && <AwardBadge type={AWARD_TYPES.SHUKUN_SHO} />}
                          {awardSets.kantosho.has(entry.bashoId)  && <AwardBadge type={AWARD_TYPES.KANTO_SHO} />}
                          {awardSets.ginosho.has(entry.bashoId)   && <AwardBadge type={AWARD_TYPES.GINO_SHO} />}
                          {wonCount   > 0 && <KinboshiBadge type={KINBOSHI_TYPES.WON}   count={wonCount} />}
                          {givenCount > 0 && <KinboshiBadge type={KINBOSHI_TYPES.GIVEN} count={givenCount} />}
                        </span>
                      );
                    })()}
                  </td>
                  <td className={styles.td}>{entry.rank}</td>
                  <td className={`${styles.td} ${styles.tdRecord}`}>
                    <span className={styles.recordCell}>{badge}{recordStr}</span>
                  </td>
                  <td className={`${styles.td} ${styles.tdChange}`}>
                    <RowIndicators {...indicators} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default RikishiRankHistory;
