import { abbreviateRank, getRankTier, stripRankSide } from '../../utils/constants';
import { getRecordStatus, RECORD_STATUS_INFO } from '../../utils/records';
import { getFlagData } from '../common/flags';
import RankBadge from '../common/RankBadge';
import Tooltip from '../common/Tooltip';
import styles from './WrestlerCompactGrid.module.css';

// East/West are independently rank-sorted, so pairing them by index lines up
// the same rank number on each side — mirroring how the card view's two
// columns already read as aligned rows via matching sort order.
function buildRows(rankGroups, enrichForDay) {
  const rows = [];
  for (const group of rankGroups) {
    const east = enrichForDay(group.east ?? []).sort((a, b) => a.rankValue - b.rankValue);
    const west = enrichForDay(group.west ?? []).sort((a, b) => a.rankValue - b.rankValue);
    const len = Math.max(east.length, west.length);
    for (let i = 0; i < len; i++) {
      const e = east[i] ?? null;
      const w = west[i] ?? null;
      rows.push({ key: `${group.rank}-${i}`, east: e, west: w, rankValue: e?.rankValue ?? w?.rankValue ?? 0 });
    }
  }
  return rows;
}

function matchesSearch(wrestler, query) {
  if (!query) return true;
  return !!wrestler?.shikonaEn?.toLowerCase().includes(query);
}

function RecordCell({ wrestler, division, edge }) {
  if (!wrestler) return <td className={styles.td} />;
  const { wins = 0, losses = 0, absences = 0 } = wrestler;
  const status = getRecordStatus(wins, losses, division, absences);
  const statusInfo = status ? RECORD_STATUS_INFO[status] : null;

  return (
    <td className={styles.td}>
      {/* Badge stacked above the record (rather than beside it) so this
          column only needs to be as wide as the wider of the two lines —
          both stay pinned to the table's outer edge via alignment. */}
      <div className={`${styles.recordInner} ${edge === 'right' ? styles.recordAlignEnd : ''}`}>
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

function NameCell({ wrestler, rikishiMap, onWrestlerClick, align }) {
  if (!wrestler) return <td className={styles.td} />;
  const details = rikishiMap?.get(wrestler.rikishiID);
  const heya = details?.heya;
  const flagData = getFlagData(details?.shusshin);
  const FlagComponent = flagData?.component;

  return (
    <td className={`${styles.td} ${align === 'right' ? styles.right : ''}`}>
      <div className={`${styles.nameCellInner} ${align === 'right' ? styles.nameAlignEnd : ''}`}>
        <Tooltip content={<><strong>{wrestler.shikonaEn}</strong><span>{wrestler.rank}</span></>}>
          <button type="button" className={styles.nameBtn} onClick={() => onWrestlerClick(wrestler)}>
            {wrestler.shikonaEn}
          </button>
        </Tooltip>
        <div className={`${styles.metaRow} ${align === 'right' ? styles.metaRowReverse : ''}`}>
          {heya && (
            <Tooltip content="Heya (Stable)">
              <span className={styles.stableBadge}>{heya}</span>
            </Tooltip>
          )}
          {FlagComponent && (
            <Tooltip content={details?.shusshin}>
              <FlagComponent className={styles.flag} />
            </Tooltip>
          )}
          {flagData?.code && <span className={styles.countryCode}>{flagData.code}</span>}
        </div>
      </div>
    </td>
  );
}

function WrestlerCompactGrid({ rankGroups, enrichForDay, searchQuery, sortOrder, onWrestlerClick, color, division, rikishiMap }) {
  const query = searchQuery.trim().toLowerCase();
  const rows = buildRows(rankGroups, enrichForDay)
    .filter(({ east, west }) => matchesSearch(east, query) || matchesSearch(west, query))
    .sort((a, b) => (sortOrder === 'rank-desc' ? b.rankValue - a.rankValue : a.rankValue - b.rankValue));

  if (rows.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No rikishi found</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} style={{ '--accent-color': `var(--color-${color})` }}>
        <colgroup>
          <col />
          <col />
          <col className={styles.colName} />
          <col className={styles.colName} />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            {/* Alignment mirrors each column's content: east-side columns
                read outward-in (record left, rank+name right, toward the
                centre), west-side columns mirror that back out to the right. */}
            <th className={`${styles.th} ${styles.thLeft}`}>Record</th>
            <th className={`${styles.th} ${styles.thRight}`}>Rank</th>
            <th className={`${styles.th} ${styles.thRight}`}>East</th>
            <th className={`${styles.th} ${styles.thLeft}`}>West</th>
            <th className={`${styles.th} ${styles.thLeft}`}>Rank</th>
            <th className={`${styles.th} ${styles.thRight}`}>Record</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, east, west }) => (
            <tr key={key} className={styles.row}>
              <RecordCell wrestler={east} division={division} />
              <td className={`${styles.td} ${styles.right}`}>
                {east && (
                  <RankBadge
                    rank={getRankTier(east.rank)}
                    side="East"
                    label={abbreviateRank(stripRankSide(east.rank))}
                    compact
                  />
                )}
              </td>
              <NameCell wrestler={east} rikishiMap={rikishiMap} onWrestlerClick={onWrestlerClick} align="right" />
              <NameCell wrestler={west} rikishiMap={rikishiMap} onWrestlerClick={onWrestlerClick} />
              <td className={styles.td}>
                {west && (
                  <RankBadge
                    rank={getRankTier(west.rank)}
                    side="West"
                    label={abbreviateRank(stripRankSide(west.rank))}
                    compact
                  />
                )}
              </td>
              <RecordCell wrestler={west} division={division} edge="right" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WrestlerCompactGrid;
