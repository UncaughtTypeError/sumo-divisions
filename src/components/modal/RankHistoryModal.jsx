import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useMemo } from 'react';
import { computeHistoryRowIndicators, getBanzukePosition } from '../../utils/rankMovement';
import { RECORD_STATUS_INFO, RECORD_STATUS_TYPES } from '../../utils/records';
import { BASHO_NICKNAMES } from '../../utils/bashoId';
import Tooltip from '../common/Tooltip';
import { useRikishiAllMatches } from '../../hooks/useRikishi';
import styles from './RankHistoryModal.module.css';

const KK_INFO = RECORD_STATUS_INFO[RECORD_STATUS_TYPES.KACHI_KOSHI];
const MK_INFO = RECORD_STATUS_INFO[RECORD_STATUS_TYPES.MAKE_KOSHI];

function formatBashoId(bashoId) {
  if (!bashoId || bashoId.length !== 6) return bashoId;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const year  = bashoId.slice(0, 4);
  const month = parseInt(bashoId.slice(4, 6), 10);
  const nickname = BASHO_NICKNAMES[month];
  const dateStr = `${months[month - 1]} ${year}`;
  return nickname ? `${dateStr} · ${nickname.short}` : dateStr;
}

function RowIndicators({ movement, delta, debutType, isCareerHigh }) {
  const hasAny = movement === 'up' || movement === 'down' || debutType || isCareerHigh;
  if (!hasAny) return null;
  return (
    <span className={styles.indicators}>
      {movement === 'up' && (
        <Tooltip content={`Up ${delta.toFixed(1)} ranks`} position="top">
          <span className={styles.rankUp}>▲ {delta.toFixed(1)}</span>
        </Tooltip>
      )}
      {movement === 'down' && (
        <Tooltip content={`Down ${delta.toFixed(1)} ranks`} position="top">
          <span className={styles.rankDown}>▼ {delta.toFixed(1)}</span>
        </Tooltip>
      )}
      {/* Debut and High use position="left" so they don't clip against the modal's right edge */}
      {debutType === 'sanyaku-debut' && (
        <Tooltip content="First appearance at this rank" position="left">
          <span className={styles.rankDebut}>Debut</span>
        </Tooltip>
      )}
      {debutType === 'division-debut' && (
        <Tooltip content="Division debut" position="left">
          <span className={styles.rankDebut}>Debut</span>
        </Tooltip>
      )}
      {isCareerHigh && (
        <Tooltip content="New career highest rank" position="left">
          <span className={styles.careerHigh}>High</span>
        </Tooltip>
      )}
    </span>
  );
}

function RankHistoryModal({ isOpen, onClose, rikishiDetails, color }) {
  const rikishiId = rikishiDetails?.id;
  const rankHistory = rikishiDetails?.rankHistory ?? [];

  // Exclude pre-banzuke statuses (Mae-zumo, Banzuke-gai) with rankValue ≥ 2000
  const displayHistory = rankHistory.filter(h => h.rankValue != null && h.rankValue < 2000);

  // Pre-compute per-row indicators once so the summary and table share the same values
  const rowData = displayHistory.map((entry, index) => ({
    entry,
    indicators: computeHistoryRowIndicators(entry, index, displayHistory),
  }));

  // Summary stats
  const improved  = rowData.filter(r => r.indicators.movement === 'up').length;
  const dropped   = rowData.filter(r => r.indicators.movement === 'down').length;
  const careerBestEntry = displayHistory.length > 0
    ? displayHistory.reduce((best, h) => {
        const pos     = getBanzukePosition(h.rank);
        const bestPos = getBanzukePosition(best.rank);
        return pos !== null && (bestPos === null || pos < bestPos) ? h : best;
      })
    : null;

  const { data: allMatchesData, isLoading: matchesLoading } = useRikishiAllMatches(rikishiId, {
    enabled: isOpen && !!rikishiId && displayHistory.length > 0,
  });

  const recordByBasho = useMemo(() => {
    if (!allMatchesData?.records || !rikishiId) return {};
    const map = {};
    for (const match of allMatchesData.records) {
      const { bashoId, winnerId, division } = match;
      if (!map[bashoId]) {
        const upperDiv = division === 'Makuuchi' || division === 'Juryo';
        map[bashoId] = { wins: 0, losses: 0, expectedBouts: upperDiv ? 15 : 7 };
      }
      if (winnerId === rikishiId) map[bashoId].wins++;
      else map[bashoId].losses++;
    }
    for (const rec of Object.values(map)) {
      rec.absences = Math.max(0, rec.expectedBouts - rec.wins - rec.losses);
    }
    return map;
  }, [allMatchesData, rikishiId]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className={styles.dialog} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter={styles.backdropEnter}
          enterFrom={styles.backdropEnterFrom}
          enterTo={styles.backdropEnterTo}
          leave={styles.backdropLeave}
          leaveFrom={styles.backdropLeaveFrom}
          leaveTo={styles.backdropLeaveTo}
        >
          <div className={styles.backdrop} aria-hidden="true" />
        </Transition.Child>

        <div className={styles.modalContainer}>
          <Transition.Child
            as={Fragment}
            enter={styles.panelEnter}
            enterFrom={styles.panelEnterFrom}
            enterTo={styles.panelEnterTo}
            leave={styles.panelLeave}
            leaveFrom={styles.panelLeaveFrom}
            leaveTo={styles.panelLeaveTo}
          >
            <Dialog.Panel className={styles.modalPanel}>
              <div
                className={styles.modalHeader}
                style={{ backgroundColor: color ? `var(--color-${color})` : undefined }}
              >
                <Dialog.Title className={styles.modalTitle}>
                  {rikishiDetails?.shikonaEn} — Rank History
                </Dialog.Title>
                <button onClick={onClose} className={styles.closeButton} aria-label="Close rank history">
                  ✕
                </button>
              </div>

              {displayHistory.length > 0 && (
                <div className={styles.summary}>
                  {careerBestEntry && (
                    <span className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Career best</span>
                      <span className={styles.summaryValue}>{careerBestEntry.rank}</span>
                    </span>
                  )}
                  <span className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Bashos</span>
                    <span className={styles.summaryValue}>{displayHistory.length}</span>
                  </span>
                  <span className={styles.summaryItem}>
                    <span className={`${styles.summaryValue} ${styles.summaryUp}`}>
                      ▲ {improved}
                    </span>
                    <span className={styles.summaryLabel}> climbs</span>
                  </span>
                  <span className={styles.summaryItem}>
                    <span className={`${styles.summaryValue} ${styles.summaryDown}`}>
                      ▼ {dropped}
                    </span>
                    <span className={styles.summaryLabel}> drops</span>
                  </span>
                </div>
              )}

              <div className={styles.modalContent}>
                {displayHistory.length === 0 ? (
                  <p className={styles.empty}>No rank history available.</p>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Tournament</th>
                          <th className={styles.th}>Rank</th>
                          <th className={styles.th}>Record</th>
                          <th className={styles.th}>Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowData.map(({ entry, indicators }) => {
                          const record = recordByBasho[entry.bashoId];
                          const recordStr = matchesLoading
                            ? <span className={styles.recordLoading} aria-label="Loading record"><span /><span /><span /></span>
                            : record
                              ? `${record.wins}-${record.losses}${record.absences > 0 ? `-${record.absences}` : ''}`
                              : '—';
                          const badge = !matchesLoading && record && (
                            record.wins > record.losses ? (
                              <Tooltip position="top" content={<><strong>{KK_INFO.nameEn}</strong><span>{KK_INFO.nameJp}</span><span>{KK_INFO.description}</span></>}>
                                <span className={styles.kkBadge}>KK</span>
                              </Tooltip>
                            ) : record.losses > record.wins ? (
                              <Tooltip position="top" content={<><strong>{MK_INFO.nameEn}</strong><span>{MK_INFO.nameJp}</span><span>{MK_INFO.description}</span></>}>
                                <span className={styles.mkBadge}>MK</span>
                              </Tooltip>
                            ) : null
                          );
                          return (
                          <tr key={entry.id ?? entry.bashoId} className={styles.row}>
                            <td className={`${styles.td} ${styles.tdTournament}`}>{formatBashoId(entry.bashoId)}</td>
                            <td className={styles.td}>{entry.rank}</td>
                            <td className={`${styles.td} ${styles.tdRecord}`}>
                              <span className={styles.recordCell}>{badge}{recordStr}</span>
                            </td>
                            <td className={`${styles.td} ${styles.tdChange}`}>
                              <RowIndicators {...indicators} />
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  onClick={onClose}
                  className={styles.closeFooterButton}
                  style={{ backgroundColor: color ? `var(--color-${color})` : undefined }}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default RankHistoryModal;
