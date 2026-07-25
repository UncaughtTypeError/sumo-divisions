import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import RikishiRankHistory from './RikishiRankHistory';
import styles from './RankHistoryModal.module.css';

function RankHistoryModal({ isOpen, onClose, rikishiDetails, color }) {
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

              <div className={styles.modalContent}>
                <RikishiRankHistory rikishiDetails={rikishiDetails} />
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
