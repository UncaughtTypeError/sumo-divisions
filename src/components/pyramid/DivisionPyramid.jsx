import { PYRAMID_LEVELS } from '../../utils/constants'
import useDivisionStore from '../../store/divisionStore'
import RankCard from './RankCard'
import PyramidLegend from './PyramidLegend'
import WrestlerSidebar from '../sidebar/WrestlerSidebar'
import styles from './DivisionPyramid.module.css'

function DivisionPyramid() {
  const selectRank = useDivisionStore((state) => state.selectRank)

  const handleRankClick = (level) => {
    selectRank(level.rank, level.division, level.apiDivision)
  }

  return (
    <div className={styles.pyramidWrapper}>
      <div className={styles.pyramidContainer}>
        {/* Pyramid Levels */}
        <div className={styles.pyramid}>
          {PYRAMID_LEVELS.map((level, index) => (
            <div
              key={level.id}
              className={styles.pyramidLevel}
              style={{
                '--level-width': `${100 - (index * 8)}%`,
              }}
            >
              <RankCard
                rank={level.rank}
                color={level.color}
                onClick={() => handleRankClick(level)}
              />
            </div>
          ))}
        </div>

        {/* Y-axis Legend */}
        <div className={styles.legendWrapper}>
          <PyramidLegend />
        </div>
      </div>

      {/* Sidebar */}
      <WrestlerSidebar />
    </div>
  )
}

export default DivisionPyramid
