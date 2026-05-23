import { create } from 'zustand'
import { RANK_COLORS, RANK_TO_API_DIVISION } from '../utils/constants'

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
  selectedHeyaRikishiIds: [], // IDs of wrestlers in the selected heya (from heya card click)

  // Modal state — modalColor/modalApiDivision are independent of sidebar navigation state
  isModalOpen: false,
  selectedWrestler: null,
  modalColor: null,
  modalApiDivision: null,

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

  selectHeya: (heyaName, rikishiIds = []) =>
    set({
      selectedHeya: heyaName,
      isHeyaSidebarOpen: true,
      selectedHeyaRikishiIds: rikishiIds,
    }),

  closeHeyaSidebar: () =>
    set({
      selectedHeya: null,
      isHeyaSidebarOpen: false,
      selectedHeyaRikishiIds: [],
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

  openModal: (wrestler, color = null, division = null) =>
    set((state) => {
      const rankBase = wrestler?.rank?.split(' ')[0];
      return {
        isModalOpen: true,
        selectedWrestler: wrestler,
        modalColor: color ?? RANK_COLORS[rankBase] ?? state.modalColor,
        modalApiDivision: division ?? RANK_TO_API_DIVISION[rankBase] ?? state.modalApiDivision,
      };
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
      selectedHeya: null,
      isHeyaSidebarOpen: false,
      selectedHeyaRikishiIds: [],
      isModalOpen: false,
      selectedWrestler: null,
      modalColor: null,
      modalApiDivision: null,
      rankLookup: new Map(),
      allWrestlers: [],
    }),
}))

export default useDivisionStore
