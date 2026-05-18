import useDivisionStore from '../../store/divisionStore';
import { SEKITORI_RANK_ORDER, APPRENTICE_RANK_ORDER } from '../../utils/constants';
import HeyaRankBadge from './HeyaRankBadge';
import styles from './HeyaCard.module.css';

function HeyaCard({ heya }) {
  const { selectHeya } = useDivisionStore();

  const handleSelect = () => selectHeya(heya.name);

  return (
    <div
      className={styles.card}
      onClick={handleSelect}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
      role="button"
      tabIndex={0}
      aria-label={`${heya.name}, ${heya.total} rikishi`}
    >
      <div className={styles.header}>
        <h3 className={styles.name}>{heya.name}</h3>
        <span className={styles.total} aria-label="Total rikishi">{heya.total}</span>
      </div>

      <div className={styles.badgeRow} aria-label="Sekitori ranks">
        {SEKITORI_RANK_ORDER.map((rank) => (
          <HeyaRankBadge
            key={rank}
            rank={rank}
            count={heya.byRank[rank]?.length ?? 0}
          />
        ))}
      </div>

      <div className={styles.badgeRow} aria-label="Apprentice ranks">
        {APPRENTICE_RANK_ORDER.map((rank) => (
          <HeyaRankBadge
            key={rank}
            rank={rank}
            count={heya.byRank[rank]?.length ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

export default HeyaCard;
