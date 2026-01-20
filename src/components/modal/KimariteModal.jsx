import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import styles from './KimariteModal.module.css';

function KimariteModal({ isOpen, onClose, kimarite, kimariteInfo }) {
  if (!kimariteInfo) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className={styles.dialog} onClose={onClose}>
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
                    {kimarite}
                  </Dialog.Title>
                  <p className={styles.modalSubtitle}>
                    {kimariteInfo.japanese} • {kimariteInfo.shortDescription}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className={styles.closeButton}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className={styles.modalContent}>
                <p className={styles.description}>{kimariteInfo.description}</p>
                <span className={styles.categoryBadge}>
                  {kimariteInfo.category}
                </span>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default KimariteModal;
