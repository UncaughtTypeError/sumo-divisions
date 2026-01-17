import { useMemo } from 'react';
import { generateBashoIdList, formatBashoDate } from '../../utils/bashoId';
import styles from './BashoSelector.module.css';

function BashoSelector({ selectedBashoId, onBashoChange }) {
  const bashoOptions = useMemo(() => {
    return generateBashoIdList();
  }, []);

  return (
    <div className={styles.bashoSelector}>
      <select
        value={selectedBashoId}
        onChange={(e) => onBashoChange(e.target.value)}
        className={styles.select}
        aria-label="Select basho tournament"
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
