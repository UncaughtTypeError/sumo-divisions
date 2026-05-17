import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useMemo } from 'react';
import { useRikishiMatches } from '../../hooks/useRikishi';
import KimariteModal from './KimariteModal';
import { getKimariteInfo } from '../../utils/kimarite';
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

  const [sortKey, setSortKey] = useState('bashoId');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedKimarite, setSelectedKimarite] = useState(null);
  const [selectedKimariteInfo, setSelectedKimariteInfo] = useState(null);

  const matches = data?.matches ?? [];
  const wins = data?.rikishiWins ?? 0;
  const losses = data?.opponentWins ?? 0;
  const total = data?.total ?? 0;
  const winPct = total > 0 ? (((wins - losses) / total) * 100).toFixed(1) : null;
  const winPctPositive = wins > losses;
  const winPctNegative = wins < losses;

  const isMatchWin = (match) => Number(match.winnerId) === Number(rikishiId);
  const isFusen = (match) => match.kimarite === 'fusen';

  const handleKimariteClick = (kimarite) => {
    const info = getKimariteInfo(kimarite);
    if (info) {
      setSelectedKimarite(kimarite);
      setSelectedKimariteInfo(info);
    }
  };

  const renderKimarite = (kimarite) => {
    if (!kimarite || kimarite === 'fusen') return '—';
    const info = getKimariteInfo(kimarite);
    if (!info) return kimarite;
    return (
      <button
        type="button"
        className={styles.kimariteBtn}
        onClick={() => handleKimariteClick(kimarite)}
        aria-label={`View details for ${kimarite}`}
      >
        {kimarite}
      </button>
    );
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedMatches = useMemo(() => {
    if (!matches.length) return matches;
    return [...matches].sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case 'bashoId':
          aVal = Number(a.bashoId || 0); bVal = Number(b.bashoId || 0); break;
        case 'day':
          aVal = a.day ?? 0; bVal = b.day ?? 0; break;
        case 'result':
          aVal = Number(a.winnerId) === Number(rikishiId) ? 1 : 0;
          bVal = Number(b.winnerId) === Number(rikishiId) ? 1 : 0;
          break;
        case 'kimarite':
          aVal = a.kimarite && a.kimarite !== 'fusen' ? a.kimarite : '';
          bVal = b.kimarite && b.kimarite !== 'fusen' ? b.kimarite : '';
          break;
        default: return 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [matches, sortKey, sortDir, rikishiId]);

  return (
    <>
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
                      &ndash; <span className={styles.losses}>{losses}L</span>{' '}
                      &bull; <span className={`${styles.winPct} ${winPctPositive ? styles.winPctPositive : winPctNegative ? styles.winPctNegative : ''}`}>{winPct}%</span>
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
                      {[
                        { key: 'bashoId', label: 'Basho' },
                        { key: 'day', label: 'Day' },
                        { key: 'result', label: 'Result' },
                        { key: 'kimarite', label: 'Kimarite' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          className={`${styles.sortBtn} ${sortKey === key ? styles.sortBtnActive : ''}`}
                          onClick={() => handleSort(key)}
                        >
                          {label}
                          <span className={styles.sortIndicator}>
                            {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                    {sortedMatches.map((match, i) => {
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
                          <span>{renderKimarite(match.kimarite)}</span>
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
    <KimariteModal
      isOpen={selectedKimarite !== null}
      onClose={() => { setSelectedKimarite(null); setSelectedKimariteInfo(null); }}
      kimarite={selectedKimarite}
      kimariteInfo={selectedKimariteInfo}
    />
    </>
  );
}

export default HeadToHeadModal;
