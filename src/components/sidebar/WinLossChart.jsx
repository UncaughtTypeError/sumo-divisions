import { useState } from 'react';
import { abbreviateRank } from '../../utils/constants';
import { getTotalBouts } from '../../utils/arasoi';
import { SEKITORI_DIVISIONS, getRecordStatus, RECORD_STATUS_TYPES } from '../../utils/records';
import Tooltip from '../common/Tooltip';
import styles from './WinLossChart.module.css';

const HALF_HEIGHT_PX = 90; // fixed chart height per half (win/loss), regardless of division scale

// Kachi-koshi (winning record) is clinched at this many wins; the same count
// of losses is make-koshi. 8 of 15 for sekitori, 4 of 7 for lower divisions.
function getKkThreshold(division) {
  return SEKITORI_DIVISIONS.includes(division) ? 8 : 4;
}

// Sekitori: step every half-threshold (4) so the axis reads 12/8/4/0/...,
// landing evenly on the kk/mk threshold (8) instead of the cramped 15/10/5/0
// spacing. Lower divisions keep the simpler [max, threshold, 0, ...] spread.
function getTicks(maxScale, kkThreshold) {
  if (maxScale >= 15) return [12, 8, 4, 0, -4, -8, -12];
  return [maxScale, kkThreshold, 0, -kkThreshold, -maxScale];
}

// Makuuchi-only zones: sanyaku (Yokozuna–Komusubi), joi (Maegashira 1–5), the rest.
function makuuchiZone(rank) {
  const title = rank?.split(' ')[0];
  if (title !== 'Maegashira') return 'sanyaku';
  return parseInt(rank.split(' ')[1], 10) <= 5 ? 'joi' : 'rest';
}

const ZONE_LABELS = { sanyaku: 'Sanyaku', joi: 'Joi', rest: 'Maegashira' };

// Contiguous zone spans (as fractions of the row) plus their labels.
function getZones(sortedWrestlers, division) {
  if (division !== 'Makuuchi' || !sortedWrestlers.length) return [];
  const zones = [];
  let start = 0;
  const total = sortedWrestlers.length;
  for (let i = 1; i <= total; i++) {
    const group = makuuchiZone(sortedWrestlers[i - 1].rank);
    const nextGroup = i < total ? makuuchiZone(sortedWrestlers[i].rank) : null;
    if (group !== nextGroup) {
      zones.push({ group, label: ZONE_LABELS[group], startFraction: start / total, endFraction: i / total });
      start = i;
    }
  }
  return zones;
}

function WinLossChart({ wrestlers, division, onWrestlerClick }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!wrestlers?.length) return null;

  const maxScale = getTotalBouts(division);
  const unitPx = HALF_HEIGHT_PX / maxScale;
  const kkThreshold = getKkThreshold(division);
  const ticks = getTicks(maxScale, kkThreshold);
  const tickOffset = (tick) => HALF_HEIGHT_PX - tick * unitPx;

  const sorted = [...wrestlers].sort((a, b) => a.rankValue - b.rankValue);
  const zones = getZones(sorted, division);
  const zoneDividers = zones.slice(0, -1).map((z) => z.endFraction);

  const header = (
    <button
      type="button"
      className={`${styles.header} ${isOpen ? '' : styles.headerCollapsed}`}
      onClick={() => setIsOpen((o) => !o)}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Collapse Win/Loss Chart' : 'Expand Win/Loss Chart'}
    >
      <span className={styles.headerJp}>勝敗表</span>
      <span className={styles.headerEn}>Win/Loss Chart</span>
      <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
    </button>
  );

  return (
    <div className={styles.container}>
      {header}
      <div className={`${styles.body} ${isOpen ? styles.bodyOpen : styles.bodyCollapsed}`}>
        <div className={styles.bodyInner}>
          <div className={styles.legend}>
            <div className={styles.legendSpacer} />
            <div className={styles.zoneLegend}>
              {zones.filter((z) => z.group !== 'rest').map((z) => (
                <span
                  key={z.group}
                  className={styles.zoneLegendItem}
                  style={{
                    left: `${z.startFraction * 100}%`,
                    width: `${(z.endFraction - z.startFraction) * 100}%`,
                  }}
                >
                  {z.label}
                </span>
              ))}
            </div>
            <div className={styles.winLossLegend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendWin}`} />
                Wins
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendLoss}`} />
                Losses
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.legendAbsence}`} />
                Kyujo
              </span>
            </div>
          </div>

          <div className={styles.chartRow}>
            <div className={styles.yAxis} style={{ height: HALF_HEIGHT_PX * 2 }}>
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className={`${styles.yAxisLabel} ${
                    tick === kkThreshold ? styles.yAxisLabelKk : tick === -kkThreshold ? styles.yAxisLabelMk : ''
                  }`}
                  style={{ top: tickOffset(tick) }}
                >
                  {tick}
                </span>
              ))}
            </div>

            <div className={styles.scrollArea}>
              <div className={styles.plotWrapper}>
                <div className={styles.columns}>
                  <div className={styles.gridlines} style={{ height: HALF_HEIGHT_PX * 2 }}>
                    {ticks.map((tick) => (
                      <span
                        key={tick}
                        className={`${styles.gridline} ${
                          tick === 0
                            ? styles.gridlineZero
                            : tick === kkThreshold
                              ? styles.gridlineKk
                              : tick === -kkThreshold
                                ? styles.gridlineMk
                                : ''
                        }`}
                        style={{ top: tickOffset(tick) }}
                      />
                    ))}
                    {zoneDividers.map((fraction) => (
                      <span
                        key={fraction}
                        className={styles.vGridline}
                        style={{ left: `${fraction * 100}%` }}
                      />
                    ))}
                  </div>

                  {sorted.map((w) => {
                    const winPx = Math.min(w.wins ?? 0, maxScale) * unitPx;
                    const lossOnly = Math.min(w.losses ?? 0, maxScale);
                    const absenceOnly = Math.min(w.absences ?? 0, maxScale - lossOnly);
                    const lossPx = lossOnly * unitPx;
                    const absencePx = absenceOnly * unitPx;
                    const abbr = abbreviateRank(w.rank);
                    const record = `${w.wins ?? 0}-${w.losses ?? 0}${w.absences ? `-${w.absences}` : ''}`;
                    const status = getRecordStatus(w.wins ?? 0, w.losses ?? 0, division, w.absences ?? 0);

                    return (
                      <Tooltip
                        key={w.rikishiID}
                        content={
                          <>
                            <strong>{w.shikonaEn}</strong>
                            <span>{w.rank}</span>
                            <span>{record}</span>
                          </>
                        }
                      >
                        <button
                          type="button"
                          className={styles.column}
                          onClick={() => onWrestlerClick?.(w)}
                          aria-label={`${w.shikonaEn}: ${record}`}
                        >
                          <div className={styles.barsWrap} style={{ height: HALF_HEIGHT_PX * 2 }}>
                            <div className={styles.topHalf} style={{ height: HALF_HEIGHT_PX }}>
                              <div className={styles.winBar} style={{ height: winPx }} />
                              {status === RECORD_STATUS_TYPES.KACHI_KOSHI && (
                                <span
                                  className={`${styles.statusIcon} ${styles.statusIconKk}`}
                                  style={{ bottom: winPx + 2 }}
                                  aria-hidden="true"
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className={styles.bottomHalf} style={{ height: HALF_HEIGHT_PX }}>
                              {lossPx > 0 && (
                                <div
                                  className={`${styles.lossBar} ${absencePx === 0 ? styles.barEnd : ''}`}
                                  style={{ height: lossPx }}
                                />
                              )}
                              {absencePx > 0 && (
                                <div className={`${styles.absenceBar} ${styles.barEnd}`} style={{ height: absencePx }} />
                              )}
                              {status === RECORD_STATUS_TYPES.MAKE_KOSHI && (
                                <span
                                  className={`${styles.statusIcon} ${styles.statusIconMk}`}
                                  style={{ top: lossPx + absencePx + 2 }}
                                  aria-hidden="true"
                                >
                                  ✕
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={styles.xLabel}>{abbr}</span>
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WinLossChart;
