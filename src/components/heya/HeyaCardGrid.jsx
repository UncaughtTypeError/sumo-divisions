import HeyaCard from './HeyaCard';
import styles from './HeyaCardGrid.module.css';

function HeyaCardGrid({ heyaList }) {
  if (heyaList.length === 0) {
    return <p className={styles.empty}>No heya match your search.</p>;
  }

  return (
    <div className={styles.grid}>
      {heyaList.map((heya) => (
        <HeyaCard key={heya.name} heya={heya} />
      ))}
    </div>
  );
}

export default HeyaCardGrid;
