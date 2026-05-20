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
import { useRikishi } from '../../hooks/useRikishi';
import { getFlagData } from '../common/flags';
import Tooltip from '../common/Tooltip';
import MatchGrid from './MatchGrid';
import RikishiDetailModal from './RikishiDetailModal';
import RankHistoryModal from './RankHistoryModal';
import styles from './MatchHistoryModal.module.css';

function RankHistoryIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden="true">
      <rect x="0"  y="6" width="2" height="5" rx="0.5" />
      <rect x="3"  y="3" width="2" height="8" rx="0.5" />
      <rect x="6"  y="1" width="2" height="10" rx="0.5" />
      <rect x="9"  y="4" width="2" height="7" rx="0.5" />
    </svg>
  );
}

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

  // Fetch the single wrestler's details — cache hit if the sidebar already loaded it
  const { data: rikishiDetails } = useRikishi(selectedWrestler?.rikishiID);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRankHistoryOpen, setIsRankHistoryOpen] = useState(false);

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
    rankMovement = null,
    rankDelta = 0,
    isCareerHigh = false,
    debutType = null,
  } = selectedWrestler;

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
                      <span className={styles.rankWithIndicators}>
                        {selectedWrestler.rank}
                        {rankMovement === 'up' && (
                          <Tooltip content={`Up ${rankDelta.toFixed(1)} ranks`}>
                            <span className={styles.rankUp}>▲ {rankDelta.toFixed(1)}</span>
                          </Tooltip>
                        )}
                        {rankMovement === 'down' && (
                          <Tooltip content={`Down ${rankDelta.toFixed(1)} ranks`}>
                            <span className={styles.rankDown}>▼ {rankDelta.toFixed(1)}</span>
                          </Tooltip>
                        )}
                        {debutType === 'sanyaku-debut' && (
                          <Tooltip content={`First appearance at ${rank?.split(' ')[0] ?? 'this rank'}`}>
                            <span className={styles.rankDebut}>Debut</span>
                          </Tooltip>
                        )}
                        {debutType === 'division-debut' && (
                          <Tooltip content="Division debut">
                            <span className={styles.rankDebut}>Debut</span>
                          </Tooltip>
                        )}
                        {isCareerHigh && (
                          <Tooltip content="New career highest rank">
                            <span className={styles.careerHigh}>High</span>
                          </Tooltip>
                        )}
                      </span>
                      {' '}• <strong>{record}</strong>{' '}
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
                        {rikishiDetails?.rankHistory?.length > 0 && (
                          <Tooltip content="Rank history" position="right">
                            <button
                              className={styles.infoButton}
                              onClick={() => setIsRankHistoryOpen(true)}
                              aria-label="View rank history"
                            >
                              <RankHistoryIcon />
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
      <RankHistoryModal
        isOpen={isRankHistoryOpen}
        onClose={() => setIsRankHistoryOpen(false)}
        rikishiDetails={rikishiDetails}
        color={selectedColor}
      />
    </>
  );
}

export default MatchHistoryModal;
