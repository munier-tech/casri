import { create } from "zustand";
import axios from "../lib/axios"; // your custom Axios instance

const useYearlyStore = create((set) => ({
  yearlyReport: null,
  loading: false,
  error: null,
  selectedYear: new Date().getFullYear(),

  // -------------------- SET SELECTED YEAR --------------------
  setSelectedYear: (year) => {
    set({ selectedYear: year });
  },

  // -------------------- FETCH YEARLY REPORT --------------------
  fetchYearlyReport: async (year) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/reports/YearlyReport/${year}`);
      // Backend returns: {
      //   message: "...",
      //   year: 2025,
      //   summary: { ... },
      //   monthlyBreakdown: [...],
      //   topProducts: [...],
      //   salesData: { ... }
      // }
      const reportData = res.data;
      set({ 
        yearlyReport: reportData, 
        loading: false 
      });
      return reportData;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch yearly report", 
        yearlyReport: null,
        loading: false 
      });
      throw err;
    }
  },

  // -------------------- REFRESH CURRENT YEAR REPORT --------------------
  refreshYearlyReport: async () => {
    const state = useYearlyStore.getState();
    return state.fetchYearlyReport(state.selectedYear);
  },

  // -------------------- CLEAR ERROR --------------------
  clearError: () => {
    set({ error: null });
  },

  // -------------------- CLEAR YEARLY REPORT --------------------
  clearYearlyReport: () => {
    set({ yearlyReport: null });
  },

  // -------------------- CLEAR ALL DATA --------------------
  clearAllData: () => {
    set({ 
      yearlyReport: null, 
      error: null 
    });
  }
}));

export default useYearlyStore;