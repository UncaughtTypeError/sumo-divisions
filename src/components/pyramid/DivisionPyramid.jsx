import { PYRAMID_LEVELS, RANKS } from '../../utils/constants';
import useDivisionStore from '../../store/divisionStore';
import RankCard from './RankCard';
import DivisionLegend from './DivisionLegend';
import RankGroupLegend from './RankGroupLegend';
import WrestlerSidebar from '../sidebar/WrestlerSidebar';
import styles from './DivisionPyramid.module.css';

function DivisionPyramid() {
  const selectRank = useDivisionStore((state) => state.selectRank);

  const handleRankClick = (level) => {
    selectRank(level.rank, level.division, level.apiDivision);
  };

  return (
    <div className={styles.pyramidWrapper}>
      <div className={styles.pyramidContainer}>
        {/* Rank Group Legend (Left) */}
        <RankGroupLegend />

        {/* Pyramid Levels */}
        <div className={styles.pyramid}>
          {PYRAMID_LEVELS.map((level, index) => (
            <div
              key={level.id}
              className={`${styles.pyramidLevel} ${
                level.rank === RANKS.YOKOZUNA ? styles.pyramidApex : ''
              }`}
              style={{
                '--level-width': `${15 + index * 8}%`,
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

        {/* Division Legend (Right) */}
        <div className={styles.legendWrapper}>
          <DivisionLegend />
        </div>
      </div>

      {/* Sidebar */}
      <WrestlerSidebar />
    </div>
  );
}

export default DivisionPyramid;
