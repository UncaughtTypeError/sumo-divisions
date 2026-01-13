import { RANK_GROUPS } from '../../utils/constants'
import styles from './PyramidLegend.module.css'

function PyramidLegend() {
  return (
    <div className={styles.legendContainer}>
      {RANK_GROUPS.map((group) => (
        <div
          key={group.name}
          className={styles.legendItem}
          style={{ borderLeftColor: group.color }}
        >
          <div className={styles.legendName}>{group.name}</div>
          <div className={styles.legendDescription}>({group.description})</div>
        </div>
      ))}
    </div>
  )
}

export default PyramidLegend
