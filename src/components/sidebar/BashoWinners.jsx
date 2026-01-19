import styles from './BashoWinners.module.css';

// Abbreviate rank to first letter + number + cardinal point (e.g., "Maegashira 17 East" -> "M17e")
function abbreviateRank(rank) {
  if (!rank) return null;
  const match = rank.match(/^(\w)\w*\s*(\d*)\s*(East|West)?$/i);
  if (!match) return rank;
  const [, firstLetter, number, side] = match;
  const sideAbbrev = side ? side[0].toLowerCase() : '';
  return `${firstLetter}${number}${sideAbbrev}`;
}

// Special prize translations
const SPECIAL_PRIZE_INFO = {
  'Shukun-sho': {
    nameJp: '殊勲賞',
    nameEn: 'Shukun-shō',
    description: 'Outstanding Performance',
  },
  'Kanto-sho': {
    nameJp: '敢闘賞',
    nameEn: 'Kanto-shō',
    description: 'Fighting Spirit',
  },
  'Gino-sho': {
    nameJp: '技能賞',
    nameEn: 'Gino-shō',
    description: 'Technique',
  },
};

function BashoWinners({ bashoResults, selectedRank, selectedApiDivision, allWrestlers, onWrestlerClick }) {
  if (!bashoResults) {
    return null;
  }

  const { yusho = [], specialPrizes = [] } = bashoResults;

  // Find the yusho winner for this division
  const divisionYusho = yusho.find((y) => y.type === selectedApiDivision);

  // Helper to find full wrestler data by rikishiId
  const findWrestler = (rikishiId) => {
    return allWrestlers?.find((w) => w.rikishiID === rikishiId);
  };

  // Handle wrestler click - look up full data and trigger modal
  const handleWrestlerClick = (rikishiId) => {
    const wrestler = findWrestler(rikishiId);
    if (wrestler && onWrestlerClick) {
      onWrestlerClick(wrestler);
    }
  };

  // For Makuuchi division, also show special prizes
  const isMakuuchi = selectedApiDivision === 'Makuuchi';

  // Group special prizes by type
  const prizesByType = specialPrizes.reduce((acc, prize) => {
    if (!acc[prize.type]) {
      acc[prize.type] = [];
    }
    acc[prize.type].push(prize);
    return acc;
  }, {});

  if (!divisionYusho && (!isMakuuchi || specialPrizes.length === 0)) {
    return null;
  }

  return (
    <div className={styles.winnersContainer}>
      {/* Yusho Winner */}
      {divisionYusho && (
        <div className={styles.yushoBox}>
          <div className={styles.yushoHeader}>
            <span className={styles.trophyIcon}>🏆</span>
            <span className={styles.yushoTitle}>Yusho Winner</span>
          </div>
          <div className={styles.winnerInfo}>
            <button
              type="button"
              className={styles.winnerNameButton}
              onClick={() => handleWrestlerClick(divisionYusho.rikishiId)}
            >
              {divisionYusho.shikonaEn}
            </button>
            <span className={styles.winnerNameJp}>
              {divisionYusho.shikonaJp}
            </span>
            {divisionYusho.rank && (
              <span className={styles.winnerRank}>{divisionYusho.rank}</span>
            )}
          </div>
        </div>
      )}

      {/* Special Prizes (Makuuchi only) */}
      {isMakuuchi && specialPrizes.length > 0 && (
        <div className={styles.specialPrizesBox}>
          <div className={styles.specialPrizesHeader}>Special Prizes</div>
          <div className={styles.prizesList}>
            {Object.entries(SPECIAL_PRIZE_INFO).map(([prizeType, info]) => {
              const winners = prizesByType[prizeType] || [];
              if (winners.length === 0) return null;

              return (
                <div key={prizeType} className={styles.prizeRow}>
                  <div className={styles.prizeName}>
                    <span className={styles.prizeJapanese}>{info.nameJp}</span>
                    <span className={styles.prizeEnglish}>
                      ({info.nameEn}) - {info.description}
                    </span>
                  </div>
                  <div className={styles.prizeWinners}>
                    {winners.map((winner, index) => (
                      <span
                        key={winner.rikishiId}
                        className={styles.prizeWinner}
                      >
                        <button
                          type="button"
                          className={styles.prizeWinnerButton}
                          onClick={() => handleWrestlerClick(winner.rikishiId)}
                        >
                          {winner.shikonaEn}
                        </button>
                        {winner.rank && (
                          <span className={styles.prizeWinnerRank}>
                            {abbreviateRank(winner.rank)}
                          </span>
                        )}
                        {index < winners.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BashoWinners;
