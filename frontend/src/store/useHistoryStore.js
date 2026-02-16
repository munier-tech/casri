import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import dayjs from "dayjs";

export const useHistoryStore = create((set) => ({
  date: null,
  products: [],
  liability: [],
  history: [],
  isLoading: false,

  // Optional: Add timestamps if you want to track freshness
  lastFetchedDaily: null,
  lastFetchedHistory: null,
  lastFetchedLiability: null,

  getMyDailySales: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get("/history/MyDailySales", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: { ts: Date.now() },
      });

      set({
        date: dayjs(data.date).format("DD-MM-YYYY"),
        products: data.products,
        lastFetchedDaily: Date.now(),
        isLoading: false,
      });

      toast.success("Daily sales fetched successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "No sales found for today");
      set({ isLoading: false, products: [] });
    }
  },

  getAllHistory: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get("/history/myHistory", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: { ts: Date.now() },
      });

      set({
        history: response.data.history,
        lastFetchedHistory: Date.now(),
        isLoading: false,
      });

      toast.success("History fetched successfully");
    } catch (error) {
      toast.error("Error fetching history");
      set({ isLoading: false });
    }
  },

  getProductsSoldByDate: async (date) => {
    try {
      set({ isLoading: true });

      const { data } = await axios.get(`/history/product-date/${date}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: { ts: Date.now() },
      });

      set({
        products: data.data,
        date: dayjs(date).format("DD-MM-YYYY"),
        isLoading: false,
      });

      toast.success(`Products sold on ${dayjs(date).format("DD-MM-YYYY")} fetched successfully`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "No products sold on this date");
      set({ isLoading: false, products: [] });
    }
  },

getLiabilityByDate: async (date) => {
  try {
    set({ isLoading: true });

    const { data } = await axios.get(`/history/Liability-date/${date}`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      params: { ts: Date.now() },
    });

    set({
      liability: data.data, // ✅ Add this
      user: data.user,
      date: dayjs(date).format("DD-MM-YYYY"),
      lastFetchedLiability: Date.now(),
      isLoading: false,
    });

    toast.success("Liability date fetched successfully");
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to fetch liability on specific date");
    set({ isLoading: false, liability: [] });
  }
}

}));
