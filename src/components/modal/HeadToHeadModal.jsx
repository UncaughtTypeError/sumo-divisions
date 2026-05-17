import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useRikishiMatches } from '../../hooks/useRikishi';
import styles from './HeadToHeadModal.module.css';

function formatBasho(bashoId) {
  if (!bashoId) return '—';
  const s = String(bashoId);
  const year = s.slice(0, 4);
  const month = parseInt(s.slice(4, 6), 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${year}`;
}

function HeadToHeadModal({ isOpen, onClose, rikishiId, opponentId, rikishiName, opponentName }) {
  const { data, isLoading, isError } = useRikishiMatches(rikishiId, opponentId, {
    enabled: isOpen,
  });

  const matches = data?.matches ?? [];
  const wins = data?.rikishiWins ?? 0;
  const losses = data?.opponentWins ?? 0;
  const total = data?.total ?? 0;

  const isMatchWin = (match) => Number(match.winnerId) === Number(rikishiId);
  const isFusen = (match) => match.kimarite === 'fusen';

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
              <div className={styles.modalHeader}>
                <div>
                  <Dialog.Title className={styles.modalTitle}>
                    {rikishiName}{' '}
                    <span className={styles.vs}>vs</span>{' '}
                    {opponentName}
                  </Dialog.Title>
                  {total > 0 && (
                    <p className={styles.modalSubtitle}>
                      {total} match{total !== 1 ? 'es' : ''}{' '}
                      &bull; <span className={styles.wins}>{wins}W</span>{' '}
                      &ndash; <span className={styles.losses}>{losses}L</span>
                    </p>
                  )}
                </div>
                <button onClick={onClose} className={styles.closeButton} aria-label="Close">
                  ✕
                </button>
              </div>

              <div className={styles.modalContent}>
                {isLoading && (
                  <p className={styles.statusMessage}>Loading match history…</p>
                )}
                {isError && (
                  <p className={styles.statusMessage}>Failed to load match history.</p>
                )}
                {!isLoading && !isError && total === 0 && (
                  <p className={styles.statusMessage}>No head-to-head records found.</p>
                )}
                {!isLoading && !isError && matches.length > 0 && (
                  <div className={styles.matchList}>
                    <div className={styles.matchHeader}>
                      <span>Basho</span>
                      <span>Day</span>
                      <span>Result</span>
                      <span>Kimarite</span>
                    </div>
                    {matches.map((match, i) => {
                      const won = isMatchWin(match);
                      const fusen = isFusen(match);
                      return (
                        <div key={i} className={styles.matchRow}>
                          <span>
                            {formatBasho(match.bashoId)}
                            {match.division && (
                              <span className={styles.division}>{match.division}</span>
                            )}
                          </span>
                          <span>{match.day != null ? `Day ${match.day}` : '—'}</span>
                          <span className={won ? styles.win : styles.loss}>
                            {won ? 'Win' : 'Loss'}
                            {fusen && <span className={styles.fusenBadge}>fusen</span>}
                          </span>
                          <span>{match.kimarite !== 'fusen' ? (match.kimarite || '—') : '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default HeadToHeadModal;
