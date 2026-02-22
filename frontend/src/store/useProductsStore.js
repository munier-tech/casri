// src/store/productsStore.js
import { create } from "zustand";
import axios from "../lib/axios"; // ✅ your custom axios instance

const useProductsStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  // ✅ Fetch all products
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/products");
      // Backend returns { success: true, count: X, products: [...] }
      const productsData = res.data.products || res.data;
      set({ products: Array.isArray(productsData) ? productsData : [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch products",
        loading: false
      });
    }
  },

  // ✅ Fetch products summary by specific date (from sales)
  getProductsByDate: async (date) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/sales/date/${date}`);
      // Backend returns sales list; map to { price: sellingCost, quantity }
      const sales = Array.isArray(res.data) ? res.data : (res.data.sales || []);
      const summarized = sales.map((sale) => ({
        price: sale.sellingCost || (sale.totalAmount && sale.quantity ? sale.totalAmount / sale.quantity : 0),
        quantity: sale.quantity || 0,
      }));
      set({ products: summarized, loading: false });
    } catch (err) {
      // If 404 (no sales), treat as empty
      set({ products: [], loading: false, error: err.response?.status === 404 ? null : (err.response?.data?.message || "Failed to fetch sales by date") });
    }
  },

  // ✅ Create product
  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/products", productData);
      const newProduct = res.data?.product;

      if (newProduct && newProduct.id) {
        set((state) => ({ products: [newProduct, ...state.products], loading: false }));
      } else {
        await get().fetchProducts();
        set({ loading: false });
      }

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || err.response?.data?.message || "Failed to create product",
        loading: false
      });
      throw err;
    }
  },

  // ✅ Update product
  updateProduct: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/products/${id}`, updatedData);
      // Backend returns { success: true, message: "...", product: {...} }
      const updatedProduct = res.data.product || res.data;
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? updatedProduct : product
        ),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.error || err.response?.data?.message || "Failed to update product",
        loading: false
      });
    }
  },

  // ✅ Delete product
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/products/${id}`);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.error || err.response?.data?.message || "Failed to delete product",
        loading: false
      });
    }
  },
}));

export default useProductsStore;
