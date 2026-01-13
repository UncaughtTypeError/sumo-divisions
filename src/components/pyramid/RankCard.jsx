import styles from './RankCard.module.css'

function RankCard({ rank, color, onClick }) {
  return (
    <button
      className={`${styles.rankCard} bg-${color}`}
      onClick={onClick}
      style={{ backgroundColor: `var(--color-${color})` }}
    >
      <span className={styles.rankText}>{rank}</span>
    </button>
  )
}

export default RankCard
