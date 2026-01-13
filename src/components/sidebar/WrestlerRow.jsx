import { calculateAndFormatRecord } from '../../utils/recordCalculator'
import styles from './WrestlerRow.module.css'

function WrestlerRow({ wrestler, onClick }) {
  const record = calculateAndFormatRecord(wrestler.record)

  return (
    <div className={styles.wrestlerRow} onClick={() => onClick(wrestler)}>
      <div className={styles.rank}>{wrestler.rank}</div>
      <div className={styles.name}>{wrestler.shikonaEn}</div>
      <div className={styles.record}>{record}</div>
    </div>
  )
}

export default WrestlerRow
