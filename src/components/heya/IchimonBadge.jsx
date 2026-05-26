import { getIchimon } from '../../utils/ichimon';
import styles from './IchimonBadge.module.css';

function IchimonBadge({ heyaName }) {
  const ichimon = getIchimon(heyaName);
  if (!ichimon) return null;

  return (
    <span
      className={styles.badge}
      style={{
        backgroundColor: `var(--color-ichimon-${ichimon.color}-bg)`,
        color: `var(--color-ichimon-${ichimon.color}-text)`,
      }}
    >
      {ichimon.name}
    </span>
  );
}

export default IchimonBadge;
