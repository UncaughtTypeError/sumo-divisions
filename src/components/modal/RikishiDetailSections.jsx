import { DIVISION_ORDER, SPECIAL_PRIZES, formatDebut } from '../../hooks/useRikishiOverviewData';
import styles from './RikishiDetailModal.module.css';

/**
 * Details / Career / History content shared by RikishiOverview (single-scroll
 * layout) and RikishiDetailModal (tabbed layout). Each parent supplies its own
 * section chrome (headers, tabs, empty-state copy) around these.
 */

export function RikishiDetailsFields({ data }) {
  const {
    FlagComponent, countryCode, countryName, shusshin, heya, careerHighRank,
    height, weight, age, debutFormatted, intaiFormatted,
  } = data;

  return (
    <dl className={styles.details}>
      {(FlagComponent || shusshin) && (
        <div className={styles.detailRow}>
          <dt>Country</dt>
          <dd className={styles.countryValue}>
            {FlagComponent && <FlagComponent className={styles.flag} />}
            {countryName  && <span>{countryName}</span>}
            {countryCode  && <span className={styles.countryCode}>{countryCode}</span>}
            {shusshin     && <span className={styles.shusshin}>({shusshin})</span>}
          </dd>
        </div>
      )}
      {heya && (
        <div className={styles.detailRow}>
          <dt>Heya</dt>
          <dd>{heya}</dd>
        </div>
      )}
      {careerHighRank && (
        <div className={styles.detailRow}>
          <dt>Career High</dt>
          <dd>{careerHighRank}</dd>
        </div>
      )}
      {height && (
        <div className={styles.detailRow}>
          <dt>Height</dt>
          <dd>{height} cm</dd>
        </div>
      )}
      {weight && (
        <div className={styles.detailRow}>
          <dt>Weight</dt>
          <dd>{weight} kg</dd>
        </div>
      )}
      {age !== null && (
        <div className={styles.detailRow}>
          <dt>Age</dt>
          <dd>{age}</dd>
        </div>
      )}
      {debutFormatted && (
        <div className={styles.detailRow}>
          <dt>Debut</dt>
          <dd>{debutFormatted}</dd>
        </div>
      )}
      {intaiFormatted && (
        <div className={styles.detailRow}>
          <dt>Retired</dt>
          <dd>{intaiFormatted}</dd>
        </div>
      )}
    </dl>
  );
}

export function RikishiCareerSection({ data }) {
  const { careerStats, yushoByDiv, totalYusho, totalPrizes, totalBouts, winPct, careerBashos } = data;
  if (!careerStats) return null;

  return (
    <>
      <div className={styles.statRow}>
        <div className={styles.statItem}>
          <span className={`${styles.statValue} ${styles.statWins}`}>
            {careerStats.totalWins}
          </span>
          <span className={styles.statLabel}>Wins</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={`${styles.statValue} ${styles.statLosses}`}>
            {careerStats.totalLosses}
          </span>
          <span className={styles.statLabel}>Losses</span>
        </div>
        {careerStats.totalAbsences > 0 && (
          <>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.statAbsences}`}>
                {careerStats.totalAbsences}
              </span>
              <span className={styles.statLabel}>Absences</span>
            </div>
          </>
        )}
      </div>
      {(winPct !== null || careerBashos > 0) && (
        <p className={styles.careerMeta}>
          {winPct !== null && <span className={styles.careerMetaWinPct}>{winPct}% win rate</span>}
          {winPct !== null && careerBashos > 0 && <span className={styles.careerMetaDot}>·</span>}
          {careerBashos > 0 && <span>{totalBouts.toLocaleString()} bouts</span>}
          {careerBashos > 0 && <span className={styles.careerMetaDot}>·</span>}
          {careerBashos > 0 && <span>{careerBashos} bashos</span>}
        </p>
      )}

      <p className={styles.sectionHeader}>Yusho ({totalYusho})</p>
      <div className={styles.yushoGrid}>
        {DIVISION_ORDER.map((d) => {
          const count = yushoByDiv[d] ?? 0;
          return (
            <div
              key={d}
              className={`${styles.yushoCell} ${styles.divisionAccent}`}
              style={{ borderLeftColor: `var(--color-${d.toLowerCase()})` }}
            >
              <span className={`${styles.yushoValue} ${count > 0 ? styles.yushoWon : styles.yushoZero}`}>
                {count}
              </span>
              <span className={styles.yushoLabel}>{d}</span>
            </div>
          );
        })}
      </div>

      <p className={styles.sectionHeader}>Special Prizes ({totalPrizes})</p>
      <div className={styles.prizesGrid}>
        {SPECIAL_PRIZES.map(({ key, label, translation }) => {
          const count = careerStats[key] ?? 0;
          return (
            <div key={key} className={styles.prizeCell}>
              <span className={`${styles.prizeValue} ${count > 0 ? styles.prizeWon : styles.prizeZero}`}>
                {count}
              </span>
              <span className={styles.prizeLabel}>{translation}</span>
              <span className={styles.prizeJapanese}>{label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function RikishiHistorySection({ data }) {
  const { careerStart, careerEnd, careerYears, divisionDebuts, divisionHistory, careerStats } = data;
  const hasSpan   = !!careerStart;
  const hasDebuts = DIVISION_ORDER.some((d) => divisionDebuts[d]);
  const hasDivisionHistory = !!careerStats;

  if (!hasSpan && !hasDebuts && !hasDivisionHistory) return null;

  return (
    <>
      {hasSpan && (
        <>
          <p className={styles.sectionHeader}>Career Span</p>
          <div className={styles.careerSpanRow}>
            <span className={styles.careerSpanRange}>
              {careerStart} – {careerEnd ?? 'present'}
            </span>
            {careerYears !== null && (
              <span className={styles.careerSpanYears}>
                {careerYears} year{careerYears !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </>
      )}

      {hasDebuts && (
        <>
          <p className={styles.sectionHeader}>Division Debuts</p>
          <div className={styles.divisionGrid}>
            {DIVISION_ORDER.filter((d) => divisionDebuts[d]).map((d) => (
              <div
                key={d}
                className={`${styles.divisionCell} ${styles.divisionAccent}`}
                style={{ borderLeftColor: `var(--color-${d.toLowerCase()})` }}
              >
                <span className={styles.divisionCellName}>{d}</span>
                <span className={styles.divisionCellValue}>{formatDebut(divisionDebuts[d])}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {hasDivisionHistory && (
        <>
          <p className={styles.sectionHeader}>Division History</p>
          <div className={styles.divisionGrid}>
            {divisionHistory.map(({ division, count }) => (
              <div
                key={division}
                className={`${styles.divisionCell} ${styles.divisionAccent}${count === 0 ? ` ${styles.dimmed}` : ''}`}
                style={{ borderLeftColor: `var(--color-${division.toLowerCase()})` }}
              >
                <span className={styles.divisionCellName}>{division}</span>
                <span className={styles.divisionCellValue}>
                  {count} {count === 1 ? 'basho' : 'bashos'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
