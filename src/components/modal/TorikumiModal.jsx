import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SIDEBAR_VIEWS } from '../../utils/constants';
import { getCurrentBashoId, BASHO_NICKNAMES } from '../../utils/bashoId';
import TorikumiTab from '../sidebar/TorikumiTab';
import styles from './TorikumiModal.module.css';

function TorikumiModal({
  isOpen,
  onClose,
  torikumiData,
  isLoading,
  isFetching,
  error,
  refetch,
  torikumiMaxDay,
  maxDay,
  day,
  onDayChange,
  activeView,
  onDivisionChange,
  currentApiDivision,
  currentColor,
  currentIsDivisionView,
  currentRank,
  wrestlerById,
  openModal,
}) {
  const _bashoId = getCurrentBashoId();
  const _month   = _bashoId ? parseInt(_bashoId.slice(4, 6), 10) : null;
  const _nick    = _month ? BASHO_NICKNAMES[_month] : null;
  const _abbr    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const bashoTitle = _month
    ? `${_abbr[_month - 1]} ${_bashoId.slice(0, 4)}${_nick ? ` · ${_nick.short}` : ''}`
    : '';

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
                style={{ backgroundColor: `var(--color-${currentColor})` }}
              >
                <Dialog.Title as="div" className={styles.headerLeft}>
                  <span className={styles.bashoTitle}>{bashoTitle}</span>
                  <select
                    className={styles.divisionSelect}
                    value={activeView?.value ?? ''}
                    onChange={(e) => onDivisionChange(e.target.value)}
                    aria-label="Select division or rank"
                  >
                    {SIDEBAR_VIEWS.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}  {v.nameJp}
                      </option>
                    ))}
                  </select>
                </Dialog.Title>
                <button onClick={onClose} className={styles.closeButton} aria-label="Close">
                  ✕
                </button>
              </div>
              <div className={styles.modalContent}>
                <TorikumiTab
                  torikumiData={torikumiData}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  error={error}
                  refetch={refetch}
                  torikumiMaxDay={torikumiMaxDay}
                  maxDay={maxDay}
                  day={day}
                  onDayChange={onDayChange}
                  currentApiDivision={currentApiDivision}
                  currentColor={currentColor}
                  currentIsDivisionView={currentIsDivisionView}
                  currentRank={currentRank}
                  wrestlerById={wrestlerById}
                  openModal={openModal}
                />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default TorikumiModal;
