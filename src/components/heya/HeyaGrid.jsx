import useDivisionStore from '../../store/divisionStore';
import { RANK_ORDER, RANK_ABBREVIATIONS, RANK_INFO } from '../../utils/constants';
import Tooltip from '../common/Tooltip';
import HeyaRankBadge from './HeyaRankBadge';
import styles from './HeyaGrid.module.css';

function SortableHeader({ label, rankInfo, sortKey, currentSortKey, sortDir, onSort }) {
  const isActive = sortKey === currentSortKey;
  const arrow = isActive ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const inner = (
    <th
      className={`${styles.th} ${isActive ? styles.thActive : ''}`}
      onClick={() => onSort(sortKey)}
      aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {rankInfo ? (
        <Tooltip
          content={
            <>
              <strong>{rankInfo.nameEn}</strong>
              <span>{rankInfo.nameJp}</span>
            </>
          }
          position="bottom"
        >
          <span className={styles.thLabel}>{label}{arrow}</span>
        </Tooltip>
      ) : (
        <span className={styles.thLabel}>{label}{arrow}</span>
      )}
    </th>
  );

  return inner;
}

function HeyaGridRow({ heya }) {
  const { selectHeya } = useDivisionStore();

  return (
    <tr
      className={styles.row}
      onClick={() => selectHeya(heya.name)}
      onKeyDown={(e) => e.key === 'Enter' && selectHeya(heya.name)}
      tabIndex={0}
      aria-label={`${heya.name}, ${heya.total} total`}
    >
      <td className={styles.tdName}>{heya.name}</td>
      {RANK_ORDER.map((rank) => {
        const count = heya.byRank[rank]?.length ?? 0;
        return (
          <td key={rank} className={styles.td} data-testid={`rank-cell-${rank}`}>
            {count > 0 ? (
              <HeyaRankBadge rank={rank} count={count} />
            ) : (
              <span className={styles.zero}>–</span>
            )}
          </td>
        );
      })}
      <td className={`${styles.td} ${styles.tdTotal}`}>{heya.total}</td>
    </tr>
  );
}

function HeyaGrid({ heyaList, sortKey, sortDir, onSort }) {
  if (heyaList.length === 0) {
    return <p className={styles.empty}>No heya match your search.</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortableHeader
              label="Heya"
              rankInfo={null}
              sortKey="name"
              currentSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            {RANK_ORDER.map((rank) => (
              <SortableHeader
                key={rank}
                label={RANK_ABBREVIATIONS[rank]}
                rankInfo={RANK_INFO[rank]}
                sortKey={rank}
                currentSortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
            ))}
            <SortableHeader
              label="Total"
              rankInfo={null}
              sortKey="total"
              currentSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {heyaList.map((heya) => (
            <HeyaGridRow key={heya.name} heya={heya} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { HeyaGridRow };
export default HeyaGrid;
