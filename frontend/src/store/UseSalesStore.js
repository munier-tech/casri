import { create } from "zustand";
import axios from "../lib/axios";

const useSalesStore = create((set, get) => ({
  // State
  sales: [],
  selectedProducts: [],
  searchResults: [],
  loading: false,
  fetchingSales: false,
  fetchingSummary: false,
  creatingSale: false,
  error: null,
  currentSale: null,
  dailySummary: null,
  salesByDate: [],
  paymentMethodsStats: null,
  paymentMethodTransactions: [],
  selectedPaymentMethod: 'all',

  // -------------------- PRODUCT SEARCH --------------------
  searchProducts: async (searchTerm) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/sales/products/search?search=${encodeURIComponent(searchTerm)}`);
      set({
        searchResults: res.data.products || [],
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to search products",
        searchResults: [],
        loading: false,
      });
    }
  },

  fetchPaymentMethodsStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/sales/payment-methods/stats");
      set({
        paymentMethodsStats: res.data.data,
        loading: false
      });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch payment methods statistics",
        loading: false,
      });
    }
  },

  // Fetch transactions for specific payment method
  fetchPaymentMethodTransactions: async (method, period = 'today') => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/sales/payment-methods/${method}/transactions/${period}`);
      set({
        paymentMethodTransactions: res.data.data.transactions || [],
        selectedPaymentMethod: method,
        loading: false
      });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch payment method transactions",
        loading: false,
      });
    }
  },

  // -------------------- SELECTED PRODUCTS MANAGEMENT --------------------
  addProductToSale: (product, quantity = 1, sellingPrice = null) => {
    const existingProduct = get().selectedProducts.find(p => p.id === product.id);

    if (existingProduct) {
      // Update existing product quantity
      set(state => ({
        selectedProducts: state.selectedProducts.map(p =>
          p.id === product.id
            ? {
              ...p,
              quantity: p.quantity + quantity,
              total: (p.quantity + quantity) * (sellingPrice || p.sellingPrice || p.price),
              expected: (p.quantity + quantity) * (sellingPrice || p.sellingPrice || p.price)
            }
            : p
        )
      }));
    } else {
      // Add new product
      const price = sellingPrice || product.price || product.cost;
      const newProduct = {
        ...product,
        quantity,
        sellingPrice: price,
        discount: 0,
        total: quantity * price,
        expected: quantity * price
      };

      set(state => ({
        selectedProducts: [...state.selectedProducts, newProduct]
      }));
    }
  },

  updateProductQuantity: (productId, quantity) => {
    set(state => ({
      selectedProducts: state.selectedProducts.map(p => {
        if (p.id === productId) {
          const newQuantity = Math.max(1, quantity);
          const total = newQuantity * p.sellingPrice;
          const expected = total - (total * (p.discount / 100));
          return {
            ...p,
            quantity: newQuantity,
            total,
            expected
          };
        }
        return p;
      })
    }));
  },

  updateProductPrice: (productId, sellingPrice) => {
    set(state => ({
      selectedProducts: state.selectedProducts.map(p => {
        if (p.id === productId) {
          const total = p.quantity * sellingPrice;
          const expected = total - (total * (p.discount / 100));
          return {
            ...p,
            sellingPrice,
            total,
            expected
          };
        }
        return p;
      })
    }));
  },

  updateProductDiscount: (productId, discount) => {
    set(state => ({
      selectedProducts: state.selectedProducts.map(p => {
        if (p.id === productId) {
          const validDiscount = Math.min(100, Math.max(0, discount));
          const expected = p.total - (p.total * (validDiscount / 100));
          return {
            ...p,
            discount: validDiscount,
            expected
          };
        }
        return p;
      })
    }));
  },

  removeProductFromSale: (productId) => {
    set(state => ({
      selectedProducts: state.selectedProducts.filter(p => p.id !== productId)
    }));
  },

  clearSelectedProducts: () => {
    set({ selectedProducts: [] });
  },

  // -------------------- SALE CALCULATIONS --------------------
  getSaleCalculations: () => {
    const selectedProducts = get().selectedProducts;

    const subtotal = selectedProducts.reduce((sum, p) => sum + p.total, 0);
    const totalDiscount = selectedProducts.reduce((sum, p) => sum + (p.total * (p.discount / 100)), 0);
    const totalExpected = selectedProducts.reduce((sum, p) => sum + p.expected, 0);
    const totalQuantity = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      totalExpected: parseFloat(totalExpected.toFixed(2)),
      totalQuantity,
      itemCount: selectedProducts.length,
      grandTotal: parseFloat((subtotal - totalDiscount).toFixed(2))
    };
  },

  // -------------------- CREATE SALE --------------------
  createSale: async (saleData) => {
    set({ loading: true, error: null });
    try {
      // Include amountDue (grand total) in the sale data
      const dataToSend = {
        ...saleData,
        amountDue: saleData.grandTotal || saleData.amountDue
      };

      const res = await axios.post("/sales", dataToSend);
      set({
        currentSale: res.data.data,
        selectedProducts: [],
        loading: false
      });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to create sale",
        loading: false,
      });
      throw err;
    }
  },

  // -------------------- CREATE SALE BY DATE --------------------
  createSaleByDate: async (saleData) => {
    set({ loading: true, error: null });
    try {
      // Include amountDue (grand total) in the sale data
      const dataToSend = {
        ...saleData,
        amountDue: saleData.grandTotal || saleData.amountDue
      };

      const res = await axios.post("/sales/by-date", dataToSend);
      set({
        currentSale: res.data.data,
        selectedProducts: [],
        loading: false
      });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to create sale by date",
        loading: false,
      });
      throw err;
    }
  },

  // -------------------- ADD PAYMENT TO SALE --------------------
  addPaymentToSale: async (saleId, paymentData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`/sales/${saleId}/payment`, paymentData);

      // Update the sale in the sales list
      set(state => ({
        sales: state.sales.map(sale =>
          sale.id === saleId ? res.data.data : sale
        ),
        loading: false
      }));

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to add payment",
        loading: false,
      });
      throw err;
    }
  },

  // -------------------- FETCH SALES --------------------
  fetchSales: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams(params).toString();
      const res = await axios.get(`/sales?${queryParams}`);
      set({
        sales: res.data.data || [],
        loading: false
      });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch sales",
        loading: false,
      });
    }
  },

  fetchDailySales: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/sales/daily/today");
      set({
        salesByDate: res.data.sales || [],
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch daily sales",
        fetchingSales: false,
      });
    }
  },

  fetchSalesByDate: async (date) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/sales/date/${date}`);
      set({
        salesByDate: res.data.sales || [],
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch sales by date",
        loading: false,
      });
    }
  },

  fetchDailySummary: async () => {
    set({ fetchingSummary: true, error: null });
    try {
      const res = await axios.get("/sales/daily/summary");
      set({
        dailySummary: res.data.data,
        fetchingSummary: false
      });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch daily summary",
        fetchingSummary: false,
      });
    }
  },

  fetchSaleById: async (saleId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/sales/${saleId}`);
      set({
        currentSale: res.data.data,
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch sale",
        loading: false,
      });
    }
  },

  // -------------------- UPDATE & DELETE --------------------
  updateSale: async (saleId, updatedData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/sales/${saleId}`, updatedData);
      set((state) => ({
        sales: state.sales.map((sale) =>
          sale.id === saleId ? res.data.data : sale
        ),
        loading: false,
      }));
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to update sale",
        loading: false,
      });
      throw err;
    }
  },

  deleteSale: async (saleId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/sales/${saleId}`);
      set((state) => ({
        sales: state.sales.filter((sale) => sale.id !== saleId),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to delete sale",
        loading: false,
      });
      throw err;
    }
  },

  // -------------------- CLEAR STATE --------------------
  clearError: () => set({ error: null }),
  clearCurrentSale: () => set({ currentSale: null }),
  clearSearchResults: () => set({ searchResults: [] }),
}));

export default useSalesStore;