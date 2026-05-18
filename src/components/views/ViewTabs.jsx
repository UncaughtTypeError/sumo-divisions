import styles from './ViewTabs.module.css';

function PyramidIcon() {
  // Same 4-level polygon pyramid as the favicon, without the circle
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="16,5 18,9 14,9" />
      <polygon points="13.5,10.5 18.5,10.5 20.5,14.5 11.5,14.5" />
      <polygon points="11,16 21,16 23.5,20.5 8.5,20.5" />
      <polygon points="8,22 24,22 27,27 5,27" />
    </svg>
  );
}

function HeyaIcon() {
  // Traditional Japanese building silhouette: curved-tip eaves, triangular roof, walled body
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Ridge ornament at apex */}
      <rect x="13" y="1" width="6" height="2" rx="1" />
      {/* Roof body */}
      <polygon points="16,3 29,13 3,13" />
      {/* Eave with characteristic upswept corners */}
      <path d="M1,13 Q3,10 5,13 L27,13 Q29,10 31,13 L30,15 L2,15 Z" />
      {/* Walls */}
      <rect x="5" y="15" width="22" height="14" />
      {/* Door opening */}
      <rect x="13" y="20" width="6" height="9" fill="white" />
      {/* Transom window above door */}
      <rect x="13" y="17" width="6" height="2" fill="white" />
    </svg>
  );
}

function ViewTabs({ activeView, onViewChange }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="View selection">
      <button
        role="tab"
        aria-selected={activeView === 'rankings'}
        className={`${styles.tab} ${activeView === 'rankings' ? styles.active : ''}`}
        onClick={() => onViewChange('rankings')}
      >
        <PyramidIcon />
        Rankings
      </button>
      <button
        role="tab"
        aria-selected={activeView === 'heya'}
        className={`${styles.tab} ${activeView === 'heya' ? styles.active : ''}`}
        onClick={() => onViewChange('heya')}
      >
        <HeyaIcon />
        Heya
      </button>
    </div>
  );
}

export default ViewTabs;
