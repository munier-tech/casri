import { create } from "zustand";
import axios from "../lib/axios"; // your custom Axios instance

const useReportStore = create((set) => ({
  // -------------------- STATE --------------------
  dailyReport: null,
  monthlyReport: null,
  yearlyReport: null,
  topProducts: [],
  loading: false,
  error: null,

  // Defaults: today's date
  selectedDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1,

  // -------------------- SET SELECTED DATE --------------------
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedYearMonth: (year, month) => set({ selectedYear: year, selectedMonth: month }),

  // -------------------- FETCH DAILY REPORT --------------------
  fetchDailyReport: async (date) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/reports/daily-report/${date}`);
      const reportData = res.data;
      set({ dailyReport: reportData, loading: false });
      return reportData;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch daily report",
        dailyReport: null,
        loading: false,
      });
      throw err;
    }
  },

  // -------------------- FETCH MONTHLY REPORT --------------------
  fetchMonthlyReport: async (year, month) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/reports/monthly-report/${year}/${month}`);
      const reportData = res.data;
      set({ monthlyReport: reportData, loading: false });
      return reportData;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch monthly report",
        monthlyReport: null,
        loading: false,
      });
      throw err;
    }
  },

  // -------------------- FETCH YEARLY REPORT --------------------
  fetchYearlyReport: async (year) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/reports/yearly-report/${year}`);
      const reportData = res.data;
      set({ yearlyReport: reportData, loading: false });
      return reportData;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch yearly report",
        yearlyReport: null,
        loading: false,
      });
      throw err;
    }
  },

  // -------------------- FETCH TOP PRODUCTS --------------------
  fetchTopProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/reports/best-selling");
      const topProductsData = res.data.data || res.data;
      set({
        topProducts: Array.isArray(topProductsData) ? topProductsData : [],
        loading: false,
      });
      return topProductsData;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch top products",
        topProducts: [],
        loading: false,
      });
      throw err;
    }
  },

  // -------------------- CLEARERS --------------------
  clearError: () => set({ error: null }),
  clearDailyReport: () => set({ dailyReport: null }),
  clearMonthlyReport: () => set({ monthlyReport: null }),
  clearYearlyReport: () => set({ yearlyReport: null }),
  clearAllData: () =>
    set({
      dailyReport: null,
      monthlyReport: null,
      yearlyReport: null,
      topProducts: [],
      error: null,
    }),
}));

export default useReportStore;
