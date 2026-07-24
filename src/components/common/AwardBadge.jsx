import { AWARD_INFO, AWARD_TYPES } from '../../utils/awards';
import Tooltip from './Tooltip';
import styles from './AwardBadge.module.css';

function AwardBadge({ type, count }) {
  const info = AWARD_INFO[type];
  if (!info) return null;

  const label = count != null ? `${info.abbrev} ${count}` : info.abbrev;

  return (
    <Tooltip
      position="top"
      content={
        <>
          <strong>{info.nameEn}</strong>
          <span>{info.nameJp}</span>
          <span>{info.description}</span>
        </>
      }
    >
      <span className={`${styles.badge} ${type === AWARD_TYPES.YUSHO ? styles.yusho : ''}`}>
        {info.icon}{label}
      </span>
    </Tooltip>
  );
}

export default AwardBadge;
