// src/store/usePurchaseStore.js
import { create } from "zustand";
import axios from "../lib/axios";

const usePurchaseStore = create((set, get) => ({
  purchases: [],
  dailyPurchases: [],
  loading: false,
  error: null,

  // ✅ Create purchase (includes substractingPrice)
  addPurchase: async (purchaseData) => {
    try {
      set({ loading: true, error: null });

      // Ensure substractingPrice defaults to 0 if not provided
      const data = {
        ...purchaseData,
        substractingPrice: purchaseData.substractingPrice || 0,
      };

      const res = await axios.post("/purchases", data);
      set((state) => ({
        purchases: [...state.purchases, res.data.purchase],
        loading: false,
      }));
      return res.data;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || err.message,
      });
    }
  },

  // ✅ Get all purchases
  getAllPurchases: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get("/purchases");
      set({ purchases: res.data.purchases, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || err.message,
      });
    }
  },

  // ✅ Get today’s purchases
  getDailyPurchases: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get("/purchases/daily");
      set({ dailyPurchases: res.data.purchases, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || err.message,
      });
    }
  },

  // ✅ Update purchase (includes substractingPrice)
  updatePurchase: async (id, updateData) => {
    try {
      console.log("Updating purchase:", id, updateData);
      set({ loading: true, error: null });

      // Default substractingPrice if missing
      const data = {
        ...updateData,
        substractingPrice:
          updateData.substractingPrice !== undefined
            ? updateData.substractingPrice
            : 0,
      };

      const res = await axios.put(`/purchases/${id}`, data);
      console.log("Update response:", res.data);

      set((state) => {
        const updatedPurchases = state.purchases.map((p) =>
          p.id === id ? res.data.purchase : p
        );
        return {
          purchases: updatedPurchases,
          loading: false,
        };
      });

      return res.data;
    } catch (err) {
      console.error("Update error:", err);
      set({
        loading: false,
        error: err.response?.data?.message || err.message,
      });
    }
  },

  // ✅ Delete purchase
  deletePurchase: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/purchases/${id}`);
      set((state) => ({
        purchases: state.purchases.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || err.message,
      });
    }
  },
}));

export default usePurchaseStore;
