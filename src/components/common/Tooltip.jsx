import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

const OFFSET = 8;

function computeStyle(rect, position) {
  switch (position) {
    case 'bottom':
      return {
        top: rect.bottom + OFFSET,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - OFFSET,
        transform: 'translate(-100%, -50%)',
      };
    case 'right':
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + OFFSET,
        transform: 'translateY(-50%)',
      };
    default: // top
      return {
        top: rect.top - OFFSET,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)',
      };
  }
}

function Tooltip({ children, content, position = 'top' }) {
  const wrapperRef = useRef(null);
  const [tooltipStyle, setTooltipStyle] = useState(null);

  const show = useCallback(() => {
    if (!wrapperRef.current) return;
    setTooltipStyle(computeStyle(wrapperRef.current.getBoundingClientRect(), position));
  }, [position]);

  const hide = useCallback(() => setTooltipStyle(null), []);

  return (
    <span
      ref={wrapperRef}
      className={styles.tooltipWrapper}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {tooltipStyle &&
        createPortal(
          <span
            className={`${styles.tooltip} ${styles[position]}`}
            style={{ position: 'fixed', ...tooltipStyle }}
          >
            {content}
          </span>,
          document.body
        )}
    </span>
  );
}

export default Tooltip;
