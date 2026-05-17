import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import useDivisionStore from '../../store/divisionStore';
import {
  AWARD_INFO,
  AWARD_TYPES,
  RECORD_STATUS_INFO,
  getRecordStatus,
  getKinboshiCount,
  isYokozuna,
} from '../../utils/awards';
import { useAllRikishi } from '../../hooks/useRikishi';
import { getFlagData } from '../common/flags';
import Tooltip from '../common/Tooltip';
import MatchGrid from './MatchGrid';
import RikishiDetailModal from './RikishiDetailModal';
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
    rankLookup,
  } = useDivisionStore();

  const { rikishiMap } = useAllRikishi();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  if (!selectedWrestler) {
    return null;
  }

  const {
    wins = 0,
    losses = 0,
    absences = 0,
    awards = [],
    rank,
    record: matchRecord = [],
  } = selectedWrestler;

  const rikishiDetails = rikishiMap?.get(selectedWrestler.rikishiID);
  const heya = rikishiDetails?.heya;
  const shusshin = rikishiDetails?.shusshin;
  const flagData = getFlagData(shusshin);
  const FlagComponent = flagData?.component;
  const countryCode = flagData?.code;
  const countryName = flagData?.name;
  const record = `${wins}W-${losses}L-${absences}A`;

  // Get record status (kachi-koshi or make-koshi)
  const recordStatus = getRecordStatus(
    wins,
    losses,
    selectedApiDivision,
    absences,
  );
  const recordStatusInfo = recordStatus
    ? RECORD_STATUS_INFO[recordStatus]
    : null;

  // Calculate kinboshi count (for both Maegashira and Yokozuna)
  const kinboshiCount = getKinboshiCount(rank, matchRecord, rankLookup);
  const isYokozunaWrestler = isYokozuna(rank);

  const hasAnyBadges = recordStatus || awards.length > 0 || kinboshiCount > 0;

  return (
    <>
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
                                  className={`${styles.awardBadge} ${
                                    award === AWARD_TYPES.YUSHO
                                      ? styles.yushoBadge
                                      : ''
                                  }`}
                                >
                                  {award === AWARD_TYPES.YUSHO && '🏆 '}
                                  {info.nameEn}
                                </span>
                              </Tooltip>
                            );
                          })}
                          {/* Kinboshi badge */}
                          {kinboshiCount > 0 && (
                            <Tooltip
                              content={
                                <>
                                  <strong>
                                    {isYokozunaWrestler
                                      ? 'Kinboshi Given'
                                      : 'Kinboshi'}
                                  </strong>
                                  <span>金星</span>
                                  <span>
                                    {isYokozunaWrestler
                                      ? 'Gold star given to Maegashira opponent'
                                      : 'Gold star for defeating a Yokozuna'}
                                  </span>
                                </>
                              }
                            >
                              <span
                                className={`${styles.awardBadge} ${
                                  isYokozunaWrestler
                                    ? styles.reverseKinboshiBadge
                                    : styles.kinboshiBadge
                                }`}
                              >
                                ★ {kinboshiCount}{' '}
                                {isYokozunaWrestler
                                  ? 'Kinboshi Given'
                                  : 'Kinboshi'}
                              </span>
                            </Tooltip>
                          )}
                        </span>
                      )}
                    </Dialog.Title>
                    <p className={styles.modalSubtitle}>
                      {selectedWrestler.rank} • <strong>{record}</strong>{' '}
                      <small className={styles.modalWinRate}>
                        ({getWinPercentage({ wins, losses })}% Win Rate)
                      </small>
                    </p>
                    {(FlagComponent || heya) && (
                      <div className={styles.modalMeta}>
                        {FlagComponent && (
                          <span className={styles.metaCountry}>
                            <Tooltip content={shusshin} position="right">
                              <FlagComponent className={styles.metaFlag} />
                            </Tooltip>
                            <Tooltip content={countryName} position="right">
                              <span className={styles.metaCountryCode}>
                                {countryCode}
                              </span>
                            </Tooltip>
                          </span>
                        )}
                        {heya && (
                          <Tooltip content="Heya (Stable)" position="right">
                            <span className={styles.metaHeya}>{heya}</span>
                          </Tooltip>
                        )}
                        {rikishiDetails && (
                          <Tooltip content="Rikishi Details" position="right">
                            <button
                              className={styles.infoButton}
                              onClick={() => setIsDetailOpen(true)}
                              aria-label="View rikishi details"
                            >
                              i
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    )}
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
                  <MatchGrid
                    matches={selectedWrestler.record}
                    color={selectedColor}
                    wrestlerRank={rank}
                    rikishiId={selectedWrestler.rikishiID}
                    rikishiName={selectedWrestler.shikonaEn}
                  />
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
      <RikishiDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        rikishiDetails={rikishiDetails}
        color={selectedColor}
      />
    </>
  );
}

export default MatchHistoryModal;
