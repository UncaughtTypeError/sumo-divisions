import { useMemo } from 'react';
import {
  generateBashoIdList,
  formatBashoDate,
  formatBashoDateFull,
} from '../../utils/bashoId';
import styles from './BashoSelector.module.css';

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
        {bashoOptions.map((bashoId) => (
          <option key={bashoId} value={bashoId}>
            {formatBashoDate(bashoId)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default BashoSelector;
