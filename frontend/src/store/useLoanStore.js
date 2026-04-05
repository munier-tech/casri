// store/loanStore.js
import { create } from "zustand";
import axios from "../lib/axios";

const useLoanStore = create((set, get) => ({
  loans: [],
  stats: {
    totalLoans: 0,
    totalAmount: 0,
    unpaidLoans: 0,
    unpaidAmount: 0,
    paidLoans: 0,
    paidAmount: 0
  },
  loading: false,
  error: null,

  // -------------------- FETCH LOANS --------------------
  fetchLoans: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();

      if (filters.isPaid !== undefined) queryParams.append('isPaid', filters.isPaid);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.personName) queryParams.append('personName', filters.personName);

      const url = `/loans${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const res = await axios.get(url);

      // Backend returns { success: true, count: X, totals: {...}, loans: [...] }
      const loansData = res.data.loans || [];
      const totals = res.data.totals || {};

      set({
        loans: Array.isArray(loansData) ? loansData : [],
        stats: {
          totalLoans: res.data.count || 0,
          totalAmount: totals.total || 0,
          unpaidAmount: totals.unpaid || 0,
          paidAmount: totals.paid || 0,
          unpaidLoans: loansData.filter(loan => !loan.isPaid).length,
          paidLoans: loansData.filter(loan => loan.isPaid).length,
        },
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch loans",
        loans: [],
        loading: false
      });
    }
  },

  // -------------------- CREATE LOAN --------------------
  createLoan: async (loanData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/loans", loanData);
      // Backend returns { success: true, message: "...", loan: {...} }
      const newLoan = res.data.loan || res.data;

      set((state) => ({
        loans: [newLoan, ...state.loans],
        loading: false
      }));

      // Refresh stats
      get().fetchLoanStats();
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create loan",
        loading: false
      });
    }
  },

  // -------------------- UPDATE LOAN --------------------
  updateLoan: async (loanId, updatedData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/loans/${loanId}`, updatedData);
      // Backend returns { success: true, message: "...", loan: {...} }
      const updatedLoan = res.data.loan || res.data;

      set((state) => ({
        loans: state.loans.map((loan) =>
          loan.id === loanId ? updatedLoan : loan
        ),
        loading: false,
      }));

      // Refresh stats
      get().fetchLoanStats();
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update loan",
        loading: false
      });
    }
  },

  // -------------------- DELETE LOAN --------------------
  deleteLoan: async (loanId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/loans/${loanId}`);

      set((state) => ({
        loans: state.loans.filter((loan) => loan.id !== loanId),
        loading: false,
      }));

      // Refresh stats
      get().fetchLoanStats();
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete loan",
        loading: false
      });
    }
  },

  // -------------------- MARK LOAN AS PAID --------------------
  markLoanAsPaid: async (loanId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(`/loans/${loanId}/pay`);
      // Backend returns { success: true, message: "...", loan: {...} }
      const updatedLoan = res.data.loan || res.data;

      set((state) => ({
        loans: state.loans.map((loan) =>
          loan.id === loanId ? updatedLoan : loan
        ),
        loading: false,
      }));

      // Refresh stats
      get().fetchLoanStats();
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to mark loan as paid",
        loading: false
      });
    }
  },

  // -------------------- FETCH LOAN STATS --------------------
  fetchLoanStats: async () => {
    try {
      const res = await axios.get("/loans/stats");
      // Backend returns { success: true, stats: {...} }
      const statsData = res.data.stats || {};

      set({
        stats: {
          totalLoans: statsData.totalLoans || 0,
          totalAmount: statsData.totalAmount || 0,
          unpaidLoans: statsData.unpaidLoans || 0,
          unpaidAmount: statsData.unpaidAmount || 0,
          paidLoans: statsData.paidLoans || 0,
          paidAmount: statsData.paidAmount || 0,
        }
      });
    } catch (err) {
      console.error("Failed to fetch loan stats:", err);
    }
  },

  // -------------------- CLEAR ERROR --------------------
  clearError: () => set({ error: null }),
}));

export default useLoanStore;