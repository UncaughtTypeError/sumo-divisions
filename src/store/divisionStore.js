import { create } from 'zustand'

/**
 * Zustand store for managing app state
 */
const useDivisionStore = create((set) => ({
  // Selected pyramid level/rank
  selectedRank: null,
  selectedDivision: null,
  selectedApiDivision: null,
  selectedColor: null,

  // Sidebar state
  isSidebarOpen: false,

  // Modal state
  isModalOpen: false,
  selectedWrestler: null,

  // Rank lookup for kinboshi calculation (Map of rikishiID to rank)
  rankLookup: new Map(),

  // Actions
  selectRank: (rank, division, apiDivision, color) =>
    set({
      selectedRank: rank,
      selectedDivision: division,
      selectedApiDivision: apiDivision,
      selectedColor: color,
      isSidebarOpen: true,
    }),

  setRankLookup: (lookup) =>
    set({
      rankLookup: lookup,
    }),

  closeSidebar: () =>
    set({
      isSidebarOpen: false,
      selectedRank: null,
      selectedDivision: null,
      selectedApiDivision: null,
      selectedColor: null,
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
      selectedColor: null,
      isSidebarOpen: false,
      isModalOpen: false,
      selectedWrestler: null,
      rankLookup: new Map(),
    }),
}))

export default useDivisionStore
