import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import useDivisionStore from '../../store/divisionStore';
import {
  AWARD_INFO,
  AWARD_TYPES,
  RECORD_STATUS_INFO,
  getRecordStatus,
} from '../../utils/awards';
import Tooltip from '../common/Tooltip';
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
  const {
    isModalOpen,
    selectedWrestler,
    selectedColor,
    selectedApiDivision,
    closeModal,
    clearSelectedWrestler,
  } = useDivisionStore();

  if (!selectedWrestler) {
    return null;
  }

  const { wins = 0, losses = 0, absences = 0, awards = [] } = selectedWrestler;
  const record = `${wins}W-${losses}L-${absences}A`;

  // Get record status (kachi-koshi or make-koshi)
  const recordStatus = getRecordStatus(wins, losses, selectedApiDivision, absences);
  const recordStatusInfo = recordStatus ? RECORD_STATUS_INFO[recordStatus] : null;

  const hasAnyBadges = recordStatus || awards.length > 0;

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
              <div
                className={styles.modalHeader}
                style={{ backgroundColor: `var(--color-${selectedColor})` }}
              >
                <div>
                  <Dialog.Title className={styles.modalTitle}>
                    {selectedWrestler.shikonaEn}
                    {hasAnyBadges && (
                      <span className={styles.awardsInline}>
                        {/* Record status badge (KK/MK) comes first */}
                        {recordStatusInfo && (
                          <Tooltip
                            content={
                              <>
                                <strong>{recordStatusInfo.nameEn}</strong>
                                <span>{recordStatusInfo.nameJp}</span>
                                <span>{recordStatusInfo.description}</span>
                              </>
                            }
                          >
                            <span
                              className={`${styles.awardBadge} ${
                                recordStatusInfo.color === 'green'
                                  ? styles.kachiKoshiBadge
                                  : styles.makeKoshiBadge
                              }`}
                            >
                              {recordStatusInfo.nameEn}
                            </span>
                          </Tooltip>
                        )}
                        {/* Award badges */}
                        {awards.map((award) => {
                          const info = AWARD_INFO[award];
                          if (!info) return null;
                          return (
                            <Tooltip
                              key={award}
                              content={
                                <>
                                  <strong>{info.nameEn}</strong>
                                  <span>{info.nameJp}</span>
                                  <span>{info.description}</span>
                                </>
                              }
                            >
                              <span
                                className={`${styles.awardBadge} ${award === AWARD_TYPES.YUSHO ? styles.yushoBadge : ''}`}
                              >
                                {award === AWARD_TYPES.YUSHO && '🏆 '}
                                {info.nameEn}
                              </span>
                            </Tooltip>
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
                <MatchGrid matches={selectedWrestler.record} color={selectedColor} />
              </div>

              {/* Footer */}
              <div className={styles.modalFooter}>
                <button
                  onClick={closeModal}
                  className={styles.closeFooterButton}
                  style={{ backgroundColor: `var(--color-${selectedColor})` }}
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
