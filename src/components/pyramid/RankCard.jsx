import { RANKS, RANK_INFO } from '../../utils/constants';
import styles from './RankCard.module.css';

function RankCard({ rank, color, onClick }) {
  const rankInfo = RANK_INFO[rank];

  return (
    <button
      className={`${styles.rankCard} bg-${color} ${
        rank === RANKS.YOKOZUNA ? styles.rankCardApex : ''
      }`}
      onClick={onClick}
      style={{ backgroundColor: `var(--color-${color})` }}
    >
      <span className={styles.rankText}>
        {rank}
        {rankInfo && (
          <span className={styles.rankKanji}>{rankInfo.nameJp}</span>
        )}
      </span>
    </button>
  );
}

export default RankCard;
