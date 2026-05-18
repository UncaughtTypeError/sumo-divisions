import { RANK_ABBREVIATIONS, RANK_COLORS, RANK_INFO } from '../../utils/constants';
import Tooltip from '../common/Tooltip';
import styles from './HeyaRankBadge.module.css';

/**
 * Coloured badge showing rank abbreviation and wrestler count,
 * with a tooltip showing the full rank name and kanji.
 */
function HeyaRankBadge({ rank, count, hideIfZero = false }) {
  if (hideIfZero && count === 0) return null;

  const abbr = RANK_ABBREVIATIONS[rank] ?? rank;
  const colorVar = RANK_COLORS[rank];
  const rankInfo = RANK_INFO[rank];

  const tooltipContent = rankInfo ? (
    <>
      <strong>{rankInfo.nameEn}</strong>
      <span>{rankInfo.nameJp}</span>
    </>
  ) : rank;

  return (
    <Tooltip content={tooltipContent}>
      <span
        className={`${styles.badge} ${count > 0 ? styles.active : styles.empty}`}
        style={count > 0 && colorVar ? { backgroundColor: `var(--color-${colorVar})` } : undefined}
      >
        <span className={styles.abbr}>{abbr}</span>
        <span className={styles.count}>{count}</span>
      </span>
    </Tooltip>
  );
}

export default HeyaRankBadge;
