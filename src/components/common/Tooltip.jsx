import styles from './Tooltip.module.css';

function Tooltip({ children, content, position = 'top' }) {
  return (
    <span className={styles.tooltipWrapper}>
      {children}
      <span className={`${styles.tooltip} ${styles[position]}`}>{content}</span>
    </span>
  );
}

export default Tooltip;
