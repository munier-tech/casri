import { create } from 'zustand';
import axiosInstance from '../lib/axios';

const useAccountsReceivableStore = create((set) => ({
  // State - Just 3 things!
  receivables: [],
  loading: false,
  error: null,
  
  // ONE FUNCTION - That's it!
// In useAccountStore.js
fetchReceivables: async () => {
  try {
    set({ loading: true, error: null });
    
    console.log("Fetching receivables...");
    const response = await axiosInstance.get('/sales/receivables');
    
    console.log("Response:", response.data);
    
    if (response.data.success) {
      set({
        receivables: response.data.data,
        loading: false,
        error: null
      });
      return response.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch receivables');
    }
  } catch (error) {
    console.error("Fetch error details:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    set({ 
      error: error.response?.data?.details || error.message,
      loading: false 
    });
    throw error;
  }
}
}));

export default useAccountsReceivableStore;