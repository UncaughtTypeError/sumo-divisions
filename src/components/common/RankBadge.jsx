import { RANK_ABBREVIATIONS, RANK_COLORS, RANK_INFO } from '../../utils/constants';
import Tooltip from './Tooltip';
import styles from './RankBadge.module.css';

/**
 * Coloured badge showing a rank abbreviation, with a tooltip showing the
 * full rank name and kanji. Used both aggregated (heya views: rank tier +
 * wrestler count) and per-wrestler (banzuke grid: rank tier + side).
 */
function RankBadge({ rank, count, side, label, hideIfZero = false, compact = false }) {
  if (hideIfZero && count === 0) return null;

  const abbr = label ?? RANK_ABBREVIATIONS[rank] ?? rank;
  const colorVar = RANK_COLORS[rank];
  const rankInfo = RANK_INFO[rank];
  const isActive = side ? true : count > 0;

  const tooltipContent = rankInfo ? (
    <>
      <strong>{rankInfo.nameEn}</strong>
      <span>{rankInfo.nameJp}</span>
      {side && <span>{side}</span>}
    </>
  ) : rank;

  return (
    <Tooltip content={tooltipContent}>
      <span
        className={`${styles.badge} ${isActive ? styles.active : styles.empty} ${compact ? styles.compact : ''}`}
        style={isActive && colorVar ? { backgroundColor: `var(--color-${colorVar})` } : undefined}
      >
        <span className={styles.abbr}>{abbr}</span>
        {side ? (
          <span className={styles.side}>{side === 'East' ? 'E' : 'W'}</span>
        ) : count !== undefined ? (
          <span className={styles.count}>{count}</span>
        ) : null}
      </span>
    </Tooltip>
  );
}

export default RankBadge;
