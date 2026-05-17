import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { getFlagData } from '../common/flags';
import styles from './RikishiDetailModal.module.css';

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
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function RikishiDetailModal({ isOpen, onClose, rikishiDetails, color }) {
  if (!rikishiDetails) return null;

  const { shikonaEn, shikonaJp, currentRank, heya, shusshin, height, weight, birthDate, debut } =
    rikishiDetails;

  const flagData = getFlagData(shusshin);
  const FlagComponent = flagData?.component;
  const countryCode = flagData?.code;
  const countryName = flagData?.name;
  const age = calculateAge(birthDate);
  const debutFormatted = formatDebut(debut);

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
                <div>
                  <Dialog.Title className={styles.modalTitle}>
                    {shikonaEn}
                    {shikonaJp && <span className={styles.shikonaJp}>{shikonaJp}</span>}
                  </Dialog.Title>
                  {currentRank && <p className={styles.modalSubtitle}>{currentRank}</p>}
                </div>
                <button onClick={onClose} className={styles.closeButton} aria-label="Close">
                  ✕
                </button>
              </div>

              <div className={styles.modalContent}>
                <dl className={styles.details}>
                  {(FlagComponent || shusshin) && (
                    <div className={styles.detailRow}>
                      <dt>Country</dt>
                      <dd className={styles.countryValue}>
                        {FlagComponent && <FlagComponent className={styles.flag} />}
                        {countryName && <span>{countryName}</span>}
                        {countryCode && <span className={styles.countryCode}>{countryCode}</span>}
                        {shusshin && <span className={styles.shusshin}>({shusshin})</span>}
                      </dd>
                    </div>
                  )}
                  {heya && (
                    <div className={styles.detailRow}>
                      <dt>Heya</dt>
                      <dd>{heya}</dd>
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
                </dl>
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

export default RikishiDetailModal;
