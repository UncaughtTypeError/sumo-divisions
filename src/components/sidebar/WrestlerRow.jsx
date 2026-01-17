import styles from './WrestlerRow.module.css'

function WrestlerRow({ wrestler, onClick }) {
  // Use the wins, losses, and absences from the API response
  const { wins = 0, losses = 0, absences = 0 } = wrestler
  const record = `${wins}-${losses}-${absences}`

  return (
    <div className={styles.wrestlerRow} onClick={() => onClick(wrestler)}>
      <div className={styles.rank}>{wrestler.rank}</div>
      <div className={styles.name}>{wrestler.shikonaEn}</div>
      <div className={styles.record}>{record}</div>
    </div>
  )
}

export default WrestlerRow
