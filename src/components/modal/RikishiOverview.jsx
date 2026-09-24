import { useRikishiOverviewData } from '../../hooks/useRikishiOverviewData';
import { RikishiDetailsFields, RikishiCareerSection, RikishiHistorySection } from './RikishiDetailSections';
import styles from './RikishiDetailModal.module.css';

function RikishiOverview({ rikishiDetails }) {
  const data = useRikishiOverviewData(rikishiDetails);
  if (!data) return null;

  return (
    <div>
      {/* ── Details ─────────────────────────────────────────────── */}
      <p className={styles.overviewSectionHeader} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        Details
      </p>
      <RikishiDetailsFields data={data} />

      {/* ── Career ──────────────────────────────────────────────── */}
      {data.careerStats && (
        <>
          <p className={styles.overviewSectionHeader}>Career</p>
          <RikishiCareerSection data={data} />
        </>
      )}

      {/* ── History ─────────────────────────────────────────────── */}
      {data.hasHistory && (
        <>
          <p className={styles.overviewSectionHeader}>History</p>
          <RikishiHistorySection data={data} />
        </>
      )}
    </div>
  );
}

export default RikishiOverview;
