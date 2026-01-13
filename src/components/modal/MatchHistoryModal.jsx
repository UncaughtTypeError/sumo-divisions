import { Dialog } from '@headlessui/react'
import useDivisionStore from '../../store/divisionStore'
import { calculateRecord } from '../../utils/recordCalculator'
import MatchGrid from './MatchGrid'
import styles from './MatchHistoryModal.module.css'

function MatchHistoryModal() {
  const { isModalOpen, selectedWrestler, closeModal } = useDivisionStore()

  if (!isModalOpen || !selectedWrestler) {
    return null
  }

  const record = calculateRecord(selectedWrestler.record)

  return (
    <Dialog open={isModalOpen} onClose={closeModal} className={styles.dialog}>
      {/* Backdrop */}
      <div className={styles.backdrop} aria-hidden="true" />

      {/* Modal container */}
      <div className={styles.modalContainer}>
        <Dialog.Panel className={styles.modalPanel}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div>
              <Dialog.Title className={styles.modalTitle}>
                {selectedWrestler.shikonaEn}
              </Dialog.Title>
              <p className={styles.modalSubtitle}>
                {selectedWrestler.rank} • {record.wins}W-{record.losses}L-
                {record.forfeits}F
              </p>
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
            <MatchGrid matches={selectedWrestler.record} />
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button onClick={closeModal} className={styles.closeFooterButton}>
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default MatchHistoryModal
