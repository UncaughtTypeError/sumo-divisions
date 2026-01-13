import { useMemo } from 'react'
import useDivisionStore from '../../store/divisionStore'
import useBanzuke from '../../hooks/useBanzuke'
import WrestlerGrid from './WrestlerGrid'
import MatchHistoryModal from '../modal/MatchHistoryModal'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import styles from './WrestlerSidebar.module.css'

function WrestlerSidebar() {
  const {
    isSidebarOpen,
    bashoId,
    selectedRank,
    selectedApiDivision,
    closeSidebar,
    openModal,
  } = useDivisionStore()

  const { data, isLoading, error, refetch } = useBanzuke(
    bashoId,
    selectedApiDivision,
    {
      enabled: isSidebarOpen && !!selectedApiDivision,
    }
  )

  // Filter wrestlers by selected rank
  const { eastWrestlers, westWrestlers } = useMemo(() => {
    if (!data || !selectedRank) {
      return { eastWrestlers: [], westWrestlers: [] }
    }

    // Filter function: check if wrestler's rank starts with selected rank
    const filterByRank = (wrestler) => {
      return wrestler.rank.startsWith(selectedRank)
    }

    const east = data.east?.filter(filterByRank) || []
    const west = data.west?.filter(filterByRank) || []

    // Sort by rankValue (lower is better)
    const sortByRank = (a, b) => a.rankValue - b.rankValue

    return {
      eastWrestlers: east.sort(sortByRank),
      westWrestlers: west.sort(sortByRank),
    }
  }, [data, selectedRank])

  if (!isSidebarOpen) {
    return null
  }

  return (
    <>
      <div className={styles.sidebarOverlay} onClick={closeSidebar} />
      <div className={styles.sidebar}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div>
            <h2>{selectedRank}</h2>
            <p className={styles.bashoInfo}>Basho {bashoId}</p>
          </div>
          <button
            onClick={closeSidebar}
            className={styles.closeButton}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.sidebarContent}>
          {isLoading && <Loading message="Loading wrestlers..." />}

          {error && (
            <ErrorMessage error={error} onRetry={refetch} />
          )}

          {data && !isLoading && !error && (
            <div className={styles.gridContainer}>
              <WrestlerGrid
                wrestlers={eastWrestlers}
                side="East"
                onWrestlerClick={openModal}
              />
              <WrestlerGrid
                wrestlers={westWrestlers}
                side="West"
                onWrestlerClick={openModal}
              />
            </div>
          )}

          {data && !isLoading && !error &&
           eastWrestlers.length === 0 && westWrestlers.length === 0 && (
            <div className={styles.noData}>
              <p>No wrestlers found for {selectedRank}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <MatchHistoryModal />
    </>
  )
}

export default WrestlerSidebar
