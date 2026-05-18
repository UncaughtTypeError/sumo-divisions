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

  // Heya sidebar state
  selectedHeya: null,
  isHeyaSidebarOpen: false,

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

  selectHeya: (heyaName) =>
    set({
      selectedHeya: heyaName,
      isHeyaSidebarOpen: true,
    }),

  closeHeyaSidebar: () =>
    set({
      selectedHeya: null,
      isHeyaSidebarOpen: false,
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

  // color and division are optional — callers that know the context (e.g.
  // HeyaSidebar) supply them so the modal header renders with the right colour.
  openModal: (wrestler, color = null, division = null) =>
    set((state) => ({
      isModalOpen: true,
      selectedWrestler: wrestler,
      selectedColor: color !== null ? color : state.selectedColor,
      selectedApiDivision: division !== null ? division : state.selectedApiDivision,
    })),

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
      selectedHeya: null,
      isHeyaSidebarOpen: false,
      isModalOpen: false,
      selectedWrestler: null,
      rankLookup: new Map(),
      allWrestlers: [],
    }),
}))

export default useDivisionStore
