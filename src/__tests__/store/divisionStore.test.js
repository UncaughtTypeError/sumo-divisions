import { describe, it, expect, beforeEach } from 'vitest'
import useDivisionStore from '../../store/divisionStore'

describe('divisionStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useDivisionStore.getState().reset()
  })

  describe('initial state', () => {
    it('should have null selectedRank', () => {
      expect(useDivisionStore.getState().selectedRank).toBeNull()
    })

    it('should have null selectedDivision', () => {
      expect(useDivisionStore.getState().selectedDivision).toBeNull()
    })

    it('should have null selectedApiDivision', () => {
      expect(useDivisionStore.getState().selectedApiDivision).toBeNull()
    })

    it('should have isSidebarOpen as false', () => {
      expect(useDivisionStore.getState().isSidebarOpen).toBe(false)
    })

    it('should have isModalOpen as false', () => {
      expect(useDivisionStore.getState().isModalOpen).toBe(false)
    })

    it('should have null selectedWrestler', () => {
      expect(useDivisionStore.getState().selectedWrestler).toBeNull()
    })
  })

  describe('selectRank', () => {
    it('should set selectedRank', () => {
      useDivisionStore.getState().selectRank('Yokozuna', 'Makuuchi', 'Makuuchi')
      expect(useDivisionStore.getState().selectedRank).toBe('Yokozuna')
    })

    it('should set selectedDivision', () => {
      useDivisionStore.getState().selectRank('Ozeki', 'Makuuchi', 'Makuuchi')
      expect(useDivisionStore.getState().selectedDivision).toBe('Makuuchi')
    })

    it('should set selectedApiDivision', () => {
      useDivisionStore.getState().selectRank('Juryo', 'Juryo', 'Juryo')
      expect(useDivisionStore.getState().selectedApiDivision).toBe('Juryo')
    })

    it('should open sidebar', () => {
      useDivisionStore.getState().selectRank('Yokozuna', 'Makuuchi', 'Makuuchi')
      expect(useDivisionStore.getState().isSidebarOpen).toBe(true)
    })
  })

  describe('closeSidebar', () => {
    beforeEach(() => {
      useDivisionStore.getState().selectRank('Yokozuna', 'Makuuchi', 'Makuuchi')
    })

    it('should close sidebar', () => {
      useDivisionStore.getState().closeSidebar()
      expect(useDivisionStore.getState().isSidebarOpen).toBe(false)
    })

    it('should reset selectedRank', () => {
      useDivisionStore.getState().closeSidebar()
      expect(useDivisionStore.getState().selectedRank).toBeNull()
    })

    it('should reset selectedDivision', () => {
      useDivisionStore.getState().closeSidebar()
      expect(useDivisionStore.getState().selectedDivision).toBeNull()
    })

    it('should reset selectedApiDivision', () => {
      useDivisionStore.getState().closeSidebar()
      expect(useDivisionStore.getState().selectedApiDivision).toBeNull()
    })
  })

  describe('openModal', () => {
    const mockWrestler = { rikishiID: 1, shikonaEn: 'Terunofuji' }

    it('should open modal', () => {
      useDivisionStore.getState().openModal(mockWrestler)
      expect(useDivisionStore.getState().isModalOpen).toBe(true)
    })

    it('should set selectedWrestler', () => {
      useDivisionStore.getState().openModal(mockWrestler)
      expect(useDivisionStore.getState().selectedWrestler).toEqual(mockWrestler)
    })
  })

  describe('closeModal', () => {
    beforeEach(() => {
      useDivisionStore
        .getState()
        .openModal({ rikishiID: 1, shikonaEn: 'Terunofuji' })
    })

    it('should close modal', () => {
      useDivisionStore.getState().closeModal()
      expect(useDivisionStore.getState().isModalOpen).toBe(false)
    })

    it('should not clear selectedWrestler immediately', () => {
      useDivisionStore.getState().closeModal()
      // selectedWrestler is cleared via clearSelectedWrestler (afterLeave transition)
      expect(useDivisionStore.getState().selectedWrestler).not.toBeNull()
    })
  })

  describe('clearSelectedWrestler', () => {
    beforeEach(() => {
      useDivisionStore
        .getState()
        .openModal({ rikishiID: 1, shikonaEn: 'Terunofuji' })
    })

    it('should clear selectedWrestler', () => {
      useDivisionStore.getState().clearSelectedWrestler()
      expect(useDivisionStore.getState().selectedWrestler).toBeNull()
    })
  })

  describe('reset', () => {
    beforeEach(() => {
      // Set up some state
      useDivisionStore.getState().selectRank('Yokozuna', 'Makuuchi', 'Makuuchi')
      useDivisionStore
        .getState()
        .openModal({ rikishiID: 1, shikonaEn: 'Terunofuji' })
    })

    it('should reset all state to initial values', () => {
      useDivisionStore.getState().reset()

      const state = useDivisionStore.getState()
      expect(state.selectedRank).toBeNull()
      expect(state.selectedDivision).toBeNull()
      expect(state.selectedApiDivision).toBeNull()
      expect(state.isSidebarOpen).toBe(false)
      expect(state.isModalOpen).toBe(false)
      expect(state.selectedWrestler).toBeNull()
    })
  })
})
