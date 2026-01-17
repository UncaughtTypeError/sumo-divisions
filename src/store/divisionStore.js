import { create } from 'zustand'
import { getCurrentBashoId } from '../utils/bashoId'

/**
 * Zustand store for managing app state
 */
const useDivisionStore = create((set) => ({
  // Current basho ID
  bashoId: getCurrentBashoId(),

  // Selected pyramid level/rank
  selectedRank: null,
  selectedDivision: null,
  selectedApiDivision: null,

  // Sidebar state
  isSidebarOpen: false,

  // Modal state
  isModalOpen: false,
  selectedWrestler: null,

  // Actions
  setBashoId: (bashoId) => set({ bashoId }),

  selectRank: (rank, division, apiDivision) =>
    set({
      selectedRank: rank,
      selectedDivision: division,
      selectedApiDivision: apiDivision,
      isSidebarOpen: true,
    }),

  closeSidebar: () =>
    set({
      isSidebarOpen: false,
      selectedRank: null,
      selectedDivision: null,
      selectedApiDivision: null,
    }),

  openModal: (wrestler) =>
    set({
      isModalOpen: true,
      selectedWrestler: wrestler,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
    }),

  clearSelectedWrestler: () =>
    set({
      selectedWrestler: null,
    }),

  reset: () =>
    set({
      selectedRank: null,
      selectedDivision: null,
      selectedApiDivision: null,
      isSidebarOpen: false,
      isModalOpen: false,
      selectedWrestler: null,
    }),
}))

export default useDivisionStore
