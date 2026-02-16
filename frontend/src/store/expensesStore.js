import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import axiosInstance from '../lib/axios';

const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,
  summary: null,
  filters: {
    page: 1,
    limit: 10,
    expenseType: '',
    paymentMethod: '',
    status: '',
    clientName: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  },

  // Set filters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 }
    }));
    get().fetchExpenses();
  },

  // Set pagination
  setPage: (page) => {
    set((state) => ({
      filters: { ...state.filters, page }
    }));
    get().fetchExpenses();
  },

  // Fetch all expenses
  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();

      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axiosInstance.get(`/expenses?${queryParams}`);

      set({
        expenses: response.data.data,
        summary: response.data.summary,
        pagination: {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total
        },
        loading: false
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch expenses',
        loading: false
      });
      toast.error(error.response?.data?.error || 'Failed to fetch expenses');
    }
  },

  // Create expense
  createExpense: async (expenseData) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.post('/expenses', expenseData);

      set((state) => ({
        expenses: [response.data.data, ...state.expenses],
        loading: false
      }));

      toast.success('Expense created successfully');
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to create expense',
        loading: false
      });
      toast.error(error.response?.data?.error || 'Failed to create expense');
      throw error;
    }
  },

  // Update expense
  updateExpense: async (id, expenseData) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.put(`/expenses/${id}`, expenseData);

      set((state) => ({
        expenses: state.expenses.map(expense =>
          expense.id === id ? response.data.data : expense
        ),
        loading: false
      }));

      toast.success('Expense updated successfully');
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to update expense',
        loading: false
      });
      toast.error(error.response?.data?.error || 'Failed to update expense');
      throw error;
    }
  },

  // Delete expense
  deleteExpense: async (id) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/expenses/${id}`);

      set((state) => ({
        expenses: state.expenses.filter(expense => expense.id !== id),
        loading: false
      }));

      toast.success('Expense deleted successfully');
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to delete expense',
        loading: false
      });
      toast.error(error.response?.data?.error || 'Failed to delete expense');
      throw error;
    }
  },

  // Get expense by ID
  getExpenseById: async (id) => {
    try {
      const response = await axiosInstance.get(`/expenses/${id}`);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch expense');
      throw error;
    }
  },

  // Clear filters
  clearFilters: () => {
    set({
      filters: {
        page: 1,
        limit: 10,
        expenseType: '',
        paymentMethod: '',
        status: '',
        clientName: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        sortBy: 'date',
        sortOrder: 'desc'
      }
    });
    get().fetchExpenses();
  }
}));

export default useExpenseStore;