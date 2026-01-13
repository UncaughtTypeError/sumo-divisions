import styles from './MatchGrid.module.css'

function MatchGrid({ matches }) {
  if (!matches || matches.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No match records available</p>
      </div>
    )
  }

  const getResultDisplay = (result) => {
    if (result === 'win') return 'Win'
    if (result === 'loss') return 'Loss'
    if (result === 'fusen loss' || result === '') return 'Forfeit'
    return result || 'Unknown'
  }

  const getResultClass = (result) => {
    if (result === 'win') return styles.resultWin
    if (result === 'loss') return styles.resultLoss
    return styles.resultForfeit
  }

  return (
    <div className={styles.matchGridContainer}>
      {/* Header */}
      <div className={styles.matchGridHeader}>
        <div className={styles.headerCell}>Result</div>
        <div className={styles.headerCell}>Opponent</div>
        <div className={styles.headerCell}>Kimarite</div>
      </div>

      {/* Matches */}
      <div className={styles.matchList}>
        {matches.map((match, index) => (
          <div key={index} className={styles.matchRow}>
            <div className={`${styles.cell} ${getResultClass(match.result)}`}>
              {getResultDisplay(match.result)}
            </div>
            <div className={styles.cell}>
              {match.opponentShikonaEn || 'Unknown'}
            </div>
            <div className={styles.cell}>
              {match.kimarite || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MatchGrid
