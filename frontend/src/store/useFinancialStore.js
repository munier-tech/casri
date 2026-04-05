import { create } from 'zustand'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

const useFinancialStore = create((set) => ({
  financialLogs: [],
  loading: false,
  error: null,
  total: {
    adjustmentsTotal: 0,
    combinedTotal: 0,
    incomeTotal: 0,
    expensesTotal: 0,
    balance: 0,
  },

  fetchLogsByDate: async (date) => {
    try {
      set({ loading: true });
      const res = await axios.get(`/financial/get/${date}`);
      set({ financialLogs: res.data.data, loading: false, error: null });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Create new log
  createLog: async (logData) => {
    try {
      set({ loading: true });
      const res = await axios.post('financial/create', logData);
      set((state) => ({
        financialLogs: [...state.financialLogs, res.data.data],
        loading: false,
        error: null
      }));
      return { success: true, data: res.data.data };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },
  updateLog: async (id, updatedData) => {
    try {
      set({ isLoading: true });

      const res = await axios.patch(`/financial/update/${id}`, updatedData);

      set((state) => ({
        financialLogs: state.financialLogs.map((log) =>
          log.id === id ? res.data.data : log
        ),
        isLoading: false,
        error: null,
      }));

      toast.success("Financial log updated successfully.");
      return { success: true, data: res.data.data };

    } catch (err) {
      set({ isLoading: false, error: err.message });
      toast.error("Failed to update financial log.");
      return { success: false, error: err.message };
    }
  }
}));


export default useFinancialStore;
