import { getFlagData } from '../common/flags';
import { useCareerStats } from '../../hooks/useCareerStats';
import styles from './RikishiDetailModal.module.css';

const DIVISION_ORDER = ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'];

const SPECIAL_PRIZES = [
  { key: 'shukunsho', label: 'Shukun-shō' },
  { key: 'kantosho',  label: 'Kantō-shō' },
  { key: 'ginosho',   label: 'Ginō-shō' },
];

const MAKUUCHI_TITLES = new Set(['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira']);

function divisionFromRank(rank) {
  if (!rank) return null;
  const title = rank.split(' ')[0];
  return MAKUUCHI_TITLES.has(title) ? 'Makuuchi' : title;
}

function getDivisionDebuts(rankHistory) {
  if (!rankHistory?.length) return {};
  const firsts = {};
  const sorted = [...rankHistory]
    .filter((h) => h.rankValue == null || h.rankValue < 2000)
    .sort((a, b) => a.bashoId.localeCompare(b.bashoId));
  for (const h of sorted) {
    const div = divisionFromRank(h.rank);
    if (div && !firsts[div]) firsts[div] = h.bashoId;
  }
  return firsts;
}

function formatDebut(debut) {
  if (!debut) return null;
  const year = debut.slice(0, 4);
  const month = parseInt(debut.slice(4, 6), 10);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[month - 1]} ${year}`;
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatIntai(intai) {
  if (!intai) return null;
  const d = new Date(intai);
  if (isNaN(d.getTime())) return null;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function RikishiOverview({ rikishiDetails }) {
  const careerStats = useCareerStats(rikishiDetails?.id ?? null);

  if (!rikishiDetails) return null;

  const {
    heya, shusshin, height, weight, birthDate, debut, intai, rankHistory,
  } = rikishiDetails;

  const validHistory = (rankHistory ?? []).filter((h) => h.rankValue != null && h.rankValue < 2000);
  const careerHighRank = validHistory.length > 0
    ? validHistory.reduce((best, h) => (h.rankValue < best.rankValue ? h : best)).rank
    : null;

  const flagData      = getFlagData(shusshin);
  const FlagComponent = flagData?.component;
  const countryCode   = flagData?.code;
  const countryName   = flagData?.name;
  const age            = calculateAge(birthDate);
  const debutFormatted = formatDebut(debut);
  const intaiFormatted = formatIntai(intai);

  const yushoByDiv = careerStats?.yushoByDivision ?? {};
  const divisionHistory = DIVISION_ORDER.map((d) => ({
    division: d,
    count: careerStats?.bashosByDivision?.[d] ?? 0,
  }));
  const totalBouts = (careerStats?.totalWins ?? 0) + (careerStats?.totalLosses ?? 0);
  const winPct = careerStats && totalBouts > 0
    ? ((careerStats.totalWins / totalBouts) * 100).toFixed(1)
    : null;
  const careerBashos = careerStats
    ? divisionHistory.reduce((sum, { count }) => sum + count, 0)
    : 0;

  const divisionDebuts = getDivisionDebuts(rankHistory);
  const careerStart    = debut ? parseInt(debut.slice(0, 4), 10) : null;
  const careerEnd      = intai ? new Date(intai).getUTCFullYear() : null;
  const careerYears    = careerStart !== null
    ? (careerEnd ?? new Date().getFullYear()) - careerStart
    : null;

  const hasHistory = careerStart || DIVISION_ORDER.some((d) => divisionDebuts[d]) || careerStats;

  return (
    <div>
      {/* ── Details ─────────────────────────────────────────────── */}
      <p className={styles.overviewSectionHeader} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        Details
      </p>
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

      {/* ── Career ──────────────────────────────────────────────── */}
      {careerStats && (
        <>
          <p className={styles.overviewSectionHeader}>Career</p>
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

          <p className={styles.sectionHeader}>Yusho</p>
          <div className={styles.yushoGrid}>
            {DIVISION_ORDER.map((d) => {
              const count = yushoByDiv[d] ?? 0;
              return (
                <div key={d} className={styles.yushoCell}>
                  <span className={`${styles.yushoValue} ${count > 0 ? styles.yushoWon : styles.yushoZero}`}>
                    {count}
                  </span>
                  <span className={styles.yushoLabel}>{d}</span>
                </div>
              );
            })}
          </div>

          <p className={styles.sectionHeader}>Special Prizes</p>
          <div className={styles.prizesGrid}>
            {SPECIAL_PRIZES.map(({ key, label }) => {
              const count = careerStats[key] ?? 0;
              return (
                <div key={key} className={styles.prizeCell}>
                  <span className={`${styles.prizeValue} ${count > 0 ? styles.prizeWon : styles.prizeZero}`}>
                    {count}
                  </span>
                  <span className={styles.prizeLabel}>{label}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── History ─────────────────────────────────────────────── */}
      {hasHistory && (
        <>
          <p className={styles.overviewSectionHeader}>History</p>

          {careerStart && (
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

          {DIVISION_ORDER.some((d) => divisionDebuts[d]) && (
            <>
              <p className={styles.sectionHeader}>Division Debuts</p>
              <div className={styles.divisionGrid}>
                {DIVISION_ORDER.filter((d) => divisionDebuts[d]).map((d) => (
                  <div key={d} className={styles.divisionCell}>
                    <span className={styles.divisionCellName}>{d}</span>
                    <span className={styles.divisionCellValue}>{formatDebut(divisionDebuts[d])}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {careerStats && (
            <>
              <p className={styles.sectionHeader}>Division History</p>
              <div className={styles.divisionGrid}>
                {divisionHistory.map(({ division, count }) => (
                  <div
                    key={division}
                    className={`${styles.divisionCell}${count === 0 ? ` ${styles.dimmed}` : ''}`}
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
      )}
    </div>
  );
}

export default RikishiOverview;
