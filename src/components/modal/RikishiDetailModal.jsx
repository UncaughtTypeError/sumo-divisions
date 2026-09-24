import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRikishiOverviewData } from '../../hooks/useRikishiOverviewData';
import { RikishiDetailsFields, RikishiCareerSection, RikishiHistorySection } from './RikishiDetailSections';
import styles from './RikishiDetailModal.module.css';

function RikishiDetailModal({ isOpen, onClose, rikishiDetails, color }) {
  const data = useRikishiOverviewData(rikishiDetails);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    setActiveTab('details');
  }, [rikishiDetails?.id]);

  if (!data) return null;

  const { shikonaEn, shikonaJp, currentRank, isRetired, careerStats, hasHistory } = data;

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

              {/* ── Header ─────────────────────────────────────────────── */}
              <div
                className={styles.modalHeader}
                style={{ backgroundColor: color ? `var(--color-${color})` : undefined }}
              >
                <div>
                  <Dialog.Title className={styles.modalTitle}>
                    {shikonaEn}
                    {shikonaJp && <span className={styles.shikonaJp}>{shikonaJp}</span>}
                  </Dialog.Title>
                  {(currentRank || isRetired) && (
                    <p className={styles.modalSubtitle}>
                      {currentRank}
                      {isRetired && <span className={styles.retiredBadge}>Retired</span>}
                    </p>
                  )}
                </div>
                <button onClick={onClose} className={styles.closeButton} aria-label="Close">
                  ✕
                </button>
              </div>

              {/* ── Tabs ───────────────────────────────────────────────── */}
              <div className={styles.tabBar}>
                <button
                  className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'career' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('career')}
                >
                  Career
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  History
                </button>
              </div>

              {/* ── Content ────────────────────────────────────────────── */}
              <div className={styles.modalContent}>

                {activeTab === 'details' && <RikishiDetailsFields data={data} />}

                {activeTab === 'career' && (
                  careerStats
                    ? <RikishiCareerSection data={data} />
                    : <p className={styles.noCareerData}>No career data available yet.</p>
                )}

                {activeTab === 'history' && (
                  hasHistory
                    ? <RikishiHistorySection data={data} />
                    : <p className={styles.noCareerData}>No history available yet.</p>
                )}

              </div>

              {/* ── Footer ─────────────────────────────────────────────── */}
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

export default RikishiDetailModal;
