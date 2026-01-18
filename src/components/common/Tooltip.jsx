import styles from './Tooltip.module.css';

function Tooltip({ children, content }) {
  return (
    <span className={styles.tooltipWrapper}>
      {children}
      <span className={styles.tooltip}>{content}</span>
    </span>
  );
}

export default Tooltip;
