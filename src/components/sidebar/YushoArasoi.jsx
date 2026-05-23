import { useState } from 'react';
import { computeYushoContenders, isYushoDecided } from '../../utils/arasoi';
import styles from './YushoArasoi.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function abbreviateRank(rank) {
  if (!rank) return null;
  const match = rank.match(/^(\w)\w*\s*(\d*)\s*(\S+)?$/i);
  if (!match) return rank;
  const [, first, num, suffix] = match;
  if (!suffix) return `${first}${num}`;
  if (suffix.toLowerCase() === 'east') return `${first}${num}e`;
  if (suffix.toLowerCase() === 'west') return `${first}${num}w`;
  return `${first}${num}${suffix}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const RESULT_CLASS = {
  win:         'shiroboshi',
  loss:        'kuroboshi',
  'fusen win': 'fusenshoSquare',
  'fusen loss':'fusenpaiSquare',
};

function RecordSymbols({ record }) {
  const bouts = (record ?? []).filter((r) => r.result in RESULT_CLASS);
  return (
    <span className={styles.recordSymbols}>
      {bouts.map((r, i) => (
        <span key={i} className={styles[RESULT_CLASS[r.result]]} />
      ))}
    </span>
  );
}

function WrestlerBtn({ wrestler, compact, onWrestlerClick }) {
  const handle = () => onWrestlerClick?.(wrestler);
  const abbr = abbreviateRank(wrestler.rank);

  if (compact) {
    return (
      <div className={styles.compactWrestler}>
        <button type="button" className={styles.nameBtn} onClick={handle}>
          {wrestler.shikonaEn}
          {abbr && <span className={styles.rankAbbr}> {abbr}</span>}
        </button>
        <RecordSymbols record={wrestler.record} />
      </div>
    );
  }

  return (
    <div className={styles.leaderWrestler}>
      <RecordSymbols record={wrestler.record} />
      <button type="button" className={styles.nameBtn} onClick={handle}>
        {wrestler.shikonaEn}
        {abbr && <span className={styles.rankAbbr}> {abbr}</span>}
      </button>
    </div>
  );
}

function WinLabel({ wins }) {
  return <span className={styles.winLabel}>{wins} Wins</span>;
}

// ─── Main component ───────────────────────────────────────────────────────────

function YushoArasoi({ wrestlers, maxDay, division, bashoResults, onWrestlerClick }) {
  const [isOpen, setIsOpen] = useState(true);

  const officialYusho = bashoResults?.yusho?.find((y) => y.type === division);
  if (officialYusho || !maxDay || !wrestlers?.length) return null;

  const groups = computeYushoContenders(wrestlers, maxDay, division);
  if (!groups.length) return null;

  const { decided, winner } = isYushoDecided(wrestlers, maxDay, division);
  const [leaderGroup, ...challengerGroups] = groups;
  const visibleChallengers = challengerGroups.slice(0, 4);

  // Playoff when leaders are tied and none have bouts left (can't change their record).
  const isPlayoff = !decided &&
    leaderGroup?.wrestlers.length > 1 &&
    leaderGroup.wrestlers.every((w) => w.remainingBouts === 0);

  const header = (
    <button
      type="button"
      className={`${styles.header} ${isOpen ? '' : styles.headerCollapsed}`}
      onClick={() => setIsOpen((o) => !o)}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Collapse Yusho Arasoi' : 'Expand Yusho Arasoi'}
    >
      <span className={styles.headerJp}>優勝争い</span>
      <span className={styles.headerEn}>Yusho Arasoi</span>
      <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
    </button>
  );

  if (decided && winner) {
    return (
      <div className={styles.container}>
        {header}
        <div className={`${styles.body} ${isOpen ? styles.bodyOpen : styles.bodyCollapsed}`}>
          <div className={styles.bodyInner}>
            <div className={styles.clinched}>
              <div className={styles.clinchedHeader}>
                <span className={styles.trophyIcon}>🏆</span>
                <span className={styles.clinchedLabel}>Yusho — Clinched</span>
              </div>
              <div className={styles.clinchedWrestler}>
                <button
                  type="button"
                  className={styles.clinchedNameBtn}
                  onClick={() => onWrestlerClick?.(winner)}
                >
                  {winner.shikonaEn}
                </button>
                <RecordSymbols record={winner.record} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {header}

      <div className={`${styles.body} ${isOpen ? styles.bodyOpen : styles.bodyCollapsed}`}>
        <div className={styles.bodyInner}>
          {/* Leader group — full width */}
          <div className={styles.leaderGroup}>
            <WinLabel wins={leaderGroup.wins} />
            <div className={styles.leaderList}>
              {leaderGroup.wrestlers.map((w) => (
                <WrestlerBtn
                  key={w.rikishiID}
                  wrestler={w}
                  compact={false}
                  onWrestlerClick={onWrestlerClick}
                />
              ))}
            </div>
            {isPlayoff && (
              <div className={styles.playoffBadge}>
                <span className={styles.playoffIcon}>⚔</span>
                <span>決定戦 · Ketteisen (Playoff)</span>
              </div>
            )}
          </div>

          {/* Challenger groups — 2-column grid; lone last item spans full width */}
          {visibleChallengers.length > 0 && (
            <div className={styles.challengerGrid}>
              {visibleChallengers.map((group) => (
                <div key={group.wins} className={styles.challengerGroup}>
                  <WinLabel wins={group.wins} />
                  {group.wrestlers.map((w) => (
                    <WrestlerBtn
                      key={w.rikishiID}
                      wrestler={w}
                      compact
                      onWrestlerClick={onWrestlerClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default YushoArasoi;
