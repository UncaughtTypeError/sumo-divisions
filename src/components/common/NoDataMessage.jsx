import styles from './NoDataMessage.module.css';

const REPO_ISSUES_URL =
  'https://github.com/UncaughtTypeError/sumo-divisions/issues/new';

function NoDataMessage({ bashoId }) {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h3 className={styles.title}>No Data Available</h3>
        <p className={styles.message}>
          No banzuke data available for this basho
        </p>
        <p className={styles.hint}>
          If you believe this is an error, please{' '}
          <a
            href={`${REPO_ISSUES_URL}?title=Missing+banzuke+data+for+${bashoId || 'basho'}&labels=bug`}
            target="_blank"
            rel="noopener"
            className={styles.link}
          >
            report an issue
          </a>
        </p>
      </div>
    </div>
  );
}

export default NoDataMessage;
