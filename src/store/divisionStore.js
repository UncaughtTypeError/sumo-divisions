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
  isDivisionView: false,

  // Modal state
  isModalOpen: false,
  selectedWrestler: null,

  // Rank lookup for kinboshi calculation (Map of rikishiID to rank)
  rankLookup: new Map(),

  // All wrestlers in current banzuke (for opponent lookups from MatchGrid)
  allWrestlers: [],

  // Actions
  selectRank: (rank, division, apiDivision, color) =>
    set({
      selectedRank: rank,
      selectedDivision: division,
      selectedApiDivision: apiDivision,
      selectedColor: color,
      isSidebarOpen: true,
      isDivisionView: false,
    }),

  selectDivision: (division, apiDivision, color) =>
    set({
      selectedRank: null,
      selectedDivision: division,
      selectedApiDivision: apiDivision,
      selectedColor: color,
      isSidebarOpen: true,
      isDivisionView: true,
    }),

  setRankLookup: (lookup) =>
    set({
      rankLookup: lookup,
    }),

  setAllWrestlers: (wrestlers) =>
    set({
      allWrestlers: wrestlers,
    }),

  closeSidebar: () =>
    set({
      isSidebarOpen: false,
      isDivisionView: false,
      selectedRank: null,
      selectedDivision: null,
      selectedApiDivision: null,
      selectedColor: null,
      allWrestlers: [],
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
      isDivisionView: false,
      isModalOpen: false,
      selectedWrestler: null,
      rankLookup: new Map(),
      allWrestlers: [],
    }),
}))

export default useDivisionStore
