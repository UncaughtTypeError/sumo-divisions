import { useMemo } from 'react';
import {
  generateBashoIdList,
  formatBashoDate,
  formatBashoDateFull,
} from '../../utils/bashoId';
import styles from './BashoSelector.module.css';

// Cancelled tournaments that should be disabled in the selector
const CANCELLED_BASHO = {
  '201103': 'Cancelled - match-fixing investigation',
  '202005': 'Cancelled - COVID-19',
};

function BashoSelector({ selectedBashoId, onBashoChange, color, bashoResults }) {
  const bashoOptions = useMemo(() => {
    return generateBashoIdList();
  }, []);

  // Format the currently selected basho with full info if bashoResults available
  const selectedBashoDisplay = useMemo(() => {
    if (bashoResults?.startDate && bashoResults?.endDate) {
      return formatBashoDateFull(
        selectedBashoId,
        bashoResults.startDate,
        bashoResults.endDate
      );
    }
    return formatBashoDate(selectedBashoId);
  }, [selectedBashoId, bashoResults]);

  return (
    <div className={styles.bashoSelector}>
      <div className={styles.selectedBasho}>{selectedBashoDisplay}</div>
      <select
        value={selectedBashoId}
        onChange={(e) => onBashoChange(e.target.value)}
        className={styles.select}
        aria-label="Select basho tournament"
        style={{ '--select-color': `var(--color-${color})` }}
      >
        {bashoOptions.map((bashoId) => {
          const isCancelled = bashoId in CANCELLED_BASHO;
          const label = isCancelled
            ? `${formatBashoDate(bashoId)} — ${CANCELLED_BASHO[bashoId]}`
            : formatBashoDate(bashoId);
          return (
            <option
              key={bashoId}
              value={bashoId}
              disabled={isCancelled}
              className={isCancelled ? styles.cancelledOption : undefined}
            >
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default BashoSelector;
