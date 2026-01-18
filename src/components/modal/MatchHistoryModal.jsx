import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import useDivisionStore from '../../store/divisionStore';
import { AWARD_INFO, AWARD_TYPES } from '../../utils/awards';
import MatchGrid from './MatchGrid';
import styles from './MatchHistoryModal.module.css';

function getWinPercentage(record) {
  const totalDecidedMatches = record.wins + record.losses;

  if (totalDecidedMatches === 0) {
    return 0;
  }

  return ((record.wins / totalDecidedMatches) * 100).toFixed(2);
}

function MatchHistoryModal() {
  const { isModalOpen, selectedWrestler, closeModal, clearSelectedWrestler } =
    useDivisionStore();

  if (!selectedWrestler) {
    return null;
  }

  const { wins = 0, losses = 0, absences = 0, awards = [] } = selectedWrestler;
  const record = `${wins}W-${losses}L-${absences}A`;

  return (
    <Transition
      appear
      show={isModalOpen}
      as={Fragment}
      afterLeave={clearSelectedWrestler}
    >
      <Dialog as="div" className={styles.dialog} onClose={closeModal}>
        {/* Backdrop with fade transition */}
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

        {/* Modal container */}
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
              {/* Header */}
              <div className={styles.modalHeader}>
                <div>
                  <Dialog.Title className={styles.modalTitle}>
                    {selectedWrestler.shikonaEn}
                    {awards.length > 0 && (
                      <span className={styles.awardsInline}>
                        {awards.map((award) => {
                          const info = AWARD_INFO[award];
                          if (!info) return null;
                          return (
                            <span
                              key={award}
                              className={`${styles.awardBadge} ${award === AWARD_TYPES.YUSHO ? styles.yushoBadge : ''}`}
                            >
                              {award === AWARD_TYPES.YUSHO && '🏆 '}
                              {info.nameEn}
                            </span>
                          );
                        })}
                      </span>
                    )}
                  </Dialog.Title>
                  <p className={styles.modalSubtitle}>
                    {selectedWrestler.rank} • <strong>{record}</strong>{' '}
                    <small style={{ opacity: '0.8' }}>
                      ({getWinPercentage({ wins, losses })}% Win Rate)
                    </small>
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className={styles.closeButton}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Match History Content */}
              <div className={styles.modalContent}>
                <h3 className={styles.sectionTitle}>Match History</h3>
                <MatchGrid matches={selectedWrestler.record} />
              </div>

              {/* Footer */}
              <div className={styles.modalFooter}>
                <button
                  onClick={closeModal}
                  className={styles.closeFooterButton}
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

export default MatchHistoryModal;
