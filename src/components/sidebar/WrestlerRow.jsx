import { AWARD_INFO, AWARD_TYPES } from '../../utils/awards';
import Tooltip from '../common/Tooltip';
import styles from './WrestlerRow.module.css';

function WrestlerRow({ wrestler, onClick }) {
  // Use the wins, losses, and absences from the API response
  const { wins = 0, losses = 0, absences = 0, awards = [] } = wrestler;
  const record = `${wins}-${losses}-${absences}`;

  return (
    <div className={styles.wrestlerRow} onClick={() => onClick(wrestler)}>
      <div className={styles.rankRow}>
        <span className={styles.rank}>{wrestler.rank}</span>
        {awards.length > 0 && (
          <span className={styles.awards}>
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
