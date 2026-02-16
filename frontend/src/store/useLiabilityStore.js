import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export const useLiabilityStore = create((set) => ({
  date: null,
  liabilities: [],
  isLoading: false,

  setLiabilities: (updateFn) => {
    set((state) => ({
      liabilities: updateFn(state.liabilities),
    }));
  },

  addLiablity: async (liabilityData) => {
    try {
      set({ isLoading: true });
      const { data } = await axios.post("/Liability/addLiability", liabilityData);
      set((state) => ({
        liabilities: [...state.liabilities, data],
        isLoading: false,
      }));
      toast.success("Liability added successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error adding liability");
      set({ isLoading: false });
    }
  },

  getLiabilities: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get("/Liability/getAll");
      set({ liabilities: response.data.liabilities || [], isLoading: false });
      toast.success("Liabilities fetched successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching liabilities");
      set({ isLoading: false });
    }
  },

  getDialyLiabilities: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get("/Liability/daily");
      set({
        date: dayjs().format("DD-MM-YYYY"),
        liabilities: data.liabilities || [],
        isLoading: false,
      });
      toast.success("Daily liabilities fetched successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching daily liabilities");
      set({ isLoading: false, liabilities: [] });
    }
  },

  deleteLiability: async (id) => {
    try {
      set({ isLoading: true });
      await axios.delete(`/Liability/delete/${id}`);
      set((state) => ({
        liabilities: state.liabilities.filter((liability) => liability.id !== id),
        isLoading: false,
      }));
      toast.success("Liability returned successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error deleting liability");
      set({ isLoading: false });
    }
  },

  handleMarkAsPaid: async (id) => {
    try {
      set({ isLoading: true });
      await axios.patch(`/Liability/paid/${id}`);
      toast.success("Marked as paid");

      // Update UI
      set((state) => ({
        liabilities: state.liabilities.filter((item) => item.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to mark as paid");
      set({ isLoading: false });
    }
  }
}));

