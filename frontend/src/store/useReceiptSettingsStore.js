import { create } from "zustand";
import axios from "../lib/axios";

const defaultSettings = {
  storeName: "CASRI INVENTORY",
  footerMessage: "Thank you for your business!",
  includeItemBarcode: true,
  barcodeWrapper: "*",
  barcodeFontSize: 36,
  showSaleBarcode: true,
};

const useReceiptSettingsStore = create((set) => ({
  settings: defaultSettings,
  loading: false,
  saving: false,
  error: null,

  fetchReceiptSettings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/settings/receipt");
      set({
        settings: { ...defaultSettings, ...(res.data?.settings || {}) },
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.error || "Failed to load receipt settings",
      });
    }
  },

  saveReceiptSettings: async (updates) => {
    set({ saving: true, error: null });
    try {
      const res = await axios.put("/settings/receipt", updates);
      set({
        settings: { ...defaultSettings, ...(res.data?.settings || {}) },
        saving: false,
      });
      return res.data?.settings;
    } catch (err) {
      const error = err.response?.data?.error || "Failed to save receipt settings";
      set({ saving: false, error });
      throw new Error(error);
    }
  },
}));

export default useReceiptSettingsStore;
