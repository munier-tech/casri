// store/categoryStore.js
import { create } from "zustand";
import axios from "../lib/axios"; // your custom Axios instance

const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,
  error: null,

  // -------------------- FETCH --------------------
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/categories");
      // Backend returns { success: true, count: X, categories: [...] }
      const categoriesData = res.data.categories || res.data;
      set({ categories: Array.isArray(categoriesData) ? categoriesData : [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch categories",
        categories: [], // safety
        loading: false
      });
    }
  },

  // -------------------- CREATE --------------------
  createCategory: async (categoryData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/categories", categoryData);
      const created = res.data?.category || res.data;
      set((state) => ({ categories: [...state.categories, created], loading: false }));
    } catch (err) {
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to create category", loading: false });
    }
  },

  // -------------------- UPDATE --------------------
  updateCategory: async (categoryId, updatedData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/categories/${categoryId}`, updatedData);
      const updatedCategory = res.data?.category || res.data;
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === categoryId ? updatedCategory : cat
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to update category", loading: false });
    }
  },

  // -------------------- DELETE --------------------
  deleteCategory: async (categoryId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/categories/${categoryId}`);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== categoryId),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || err.response?.data?.error || "Failed to delete category", loading: false });
    }
  },
}));

export default useCategoryStore;
