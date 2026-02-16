// Complete useVendorStore.js with edit/delete functionality
import { create } from 'zustand';
import axiosInstance from '../lib/axios';

const useVendorPurchaseStore = create((set, get) => ({
  // Vendors
  vendors: [],
  currentVendor: null,
  selectedVendor: null,
  editingVendor: null,

  // Products (for purchase and search)
  purchaseProducts: [],
  productSearchResults: [],
  allProducts: [],

  // Purchase History
  allPurchases: [],
  vendorPurchases: [],
  purchaseRecords: [],
  editingPurchase: null,

  // Purchase Form Data
  purchaseData: {
    amountDue: 0,
    amountPaid: 0,
    paymentMethod: 'cash',
    notes: ''
  },

  // UI State
  isLoading: false,
  isLoadingProducts: false,
  isLoadingPurchases: false,
  error: null,
  activeTab: 'vendors', // 'vendors', 'purchase', 'records'
  showVendorModal: false,
  showPurchaseModal: false,
  showEditVendorModal: false,
  showEditPurchaseModal: false,

  // ========== TAB METHODS ==========

  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowVendorModal: (show) => set({ showVendorModal: show }),
  setShowPurchaseModal: (show) => set({ showPurchaseModal: show }),
  setShowEditVendorModal: (show) => set({ showEditVendorModal: show }),
  setShowEditPurchaseModal: (show) => set({ showEditPurchaseModal: show }),

  // ========== EDIT/VIEW METHODS ==========

  setEditingVendor: (vendor) => set({ editingVendor: vendor }),
  setEditingPurchase: (purchase) => set({ editingPurchase: purchase }),

  clearEditingVendor: () => set({ editingVendor: null }),
  clearEditingPurchase: () => set({ editingPurchase: null }),

  // ========== PURCHASE DATA METHODS ==========

  updatePurchaseData: (updates) => {
    set((state) => ({
      purchaseData: {
        ...state.purchaseData,
        ...updates
      }
    }));
  },

  resetPurchaseData: () => {
    set({
      purchaseData: {
        amountDue: 0,
        amountPaid: 0,
        paymentMethod: 'cash',
        notes: ''
      }
    });
  },

  // ========== VENDOR METHODS ==========

  // Fetch all vendors
  fetchVendors: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/vendors');

      if (response.data.success) {
        set({
          vendors: response.data.data,
          isLoading: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch vendors');
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch vendors',
        isLoading: false,
      });
    }
  },

  // Create new vendor
  createVendor: async (vendorData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/vendors', vendorData);

      if (response.data.success) {
        set((state) => ({
          vendors: [response.data.data, ...state.vendors],
          selectedVendor: response.data.data,
          showVendorModal: false,
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to create vendor');
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create vendor',
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Update vendor
  updateVendor: async (vendorId, vendorData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`/vendors/${vendorId}`, vendorData);

      if (response.data.success) {
        set((state) => ({
          vendors: state.vendors.map(vendor =>
            vendor.id === vendorId ? response.data.data : vendor
          ),
          showEditVendorModal: false,
          editingVendor: null,
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to update vendor');
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update vendor',
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Delete vendor
  deleteVendor: async (vendorId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(`/vendors/${vendorId}`);

      if (response.data.success) {
        set((state) => ({
          vendors: state.vendors.filter(vendor => vendor.id !== vendorId),
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to delete vendor');
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete vendor',
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== PRODUCT METHODS ==========

  // Fetch all products for search
  fetchAllProducts: async () => {
    set({ isLoadingProducts: true });
    try {
      const response = await axiosInstance.get('/products');

      if (response.data.success) {
        const products = response.data.products || [];
        set({
          allProducts: products,
          isLoadingProducts: false,
        });
      } else {
        set({ isLoadingProducts: false });
      }
    } catch (error) {
      set({ isLoadingProducts: false });
    }
  },

  // Search products from fetched list
  searchProducts: (query) => {
    if (!query.trim()) {
      set({ productSearchResults: [] });
      return;
    }

    const { allProducts } = get();
    const lowerQuery = query.toLowerCase();

    const filtered = allProducts.filter(product =>
      product.name?.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);

    set({ productSearchResults: filtered });
  },

  clearProductSearchResults: () => {
    set({ productSearchResults: [] });
  },

  selectVendor: (vendor) => {
    set({ selectedVendor: vendor });
  },

  clearSelectedVendor: () => {
    set({
      selectedVendor: null,
      purchaseProducts: [],
      purchaseData: {  // Reset purchase data when vendor is cleared
        amountDue: 0,
        amountPaid: 0,
        paymentMethod: 'cash',
        notes: ''
      }
    });
  },

  // ========== PURCHASE PRODUCT METHODS ==========

  addProductToPurchase: (product) => {
    set((state) => {
      const existingProduct = state.purchaseProducts.find(p => p.id === product.id);
      if (existingProduct) {
        return {
          purchaseProducts: state.purchaseProducts.map(p =>
            p.id === product.id
              ? { ...p, quantity: p.quantity + 1 }
              : p
          ),
          productSearchResults: [],
        };
      }
      return {
        purchaseProducts: [...state.purchaseProducts, {
          ...product,
          quantity: 1,
          price: product.price || product.cost || 0
        }],
        productSearchResults: [],
      };
    });

    // Auto-update amount due when product is added
    const total = get().calculatePurchaseTotal();
    get().updatePurchaseData({ amountDue: total });
  },

  addCustomProductToPurchase: (productName, unitPrice, quantity = 1) => {
    const customProduct = {
      id: `custom_${Date.now()}`,
      name: productName,
      price: unitPrice,
      quantity: quantity,
      isCustom: true
    };

    set((state) => ({
      purchaseProducts: [...state.purchaseProducts, customProduct],
      productSearchResults: [],
    }));

    // Auto-update amount due when product is added
    const total = get().calculatePurchaseTotal();
    get().updatePurchaseData({ amountDue: total });
  },

  removeProductFromPurchase: (productId) => {
    set((state) => ({
      purchaseProducts: state.purchaseProducts.filter(p => p.id !== productId),
    }));

    // Auto-update amount due when product is removed
    const total = get().calculatePurchaseTotal();
    get().updatePurchaseData({ amountDue: total });
  },

  updateProductQuantity: (productId, quantity) => {
    set((state) => ({
      purchaseProducts: state.purchaseProducts.map(p =>
        p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      ),
    }));

    // Auto-update amount due when quantity changes
    const total = get().calculatePurchaseTotal();
    get().updatePurchaseData({ amountDue: total });
  },

  clearPurchaseProducts: () => {
    set({
      purchaseProducts: [],
      purchaseData: {
        amountDue: 0,
        amountPaid: 0,
        paymentMethod: 'cash',
        notes: ''
      }
    });
  },

  // ========== PURCHASE HISTORY/RECORDS METHODS ==========

  // Fetch all purchases across all vendors
  fetchAllPurchases: async () => {
    set({ isLoadingPurchases: true, error: null });
    try {
      // First get all vendors
      const vendorsResponse = await axiosInstance.get('/vendors');

      if (vendorsResponse.data.success) {
        const vendors = vendorsResponse.data.data;
        let allPurchases = [];

        // Fetch purchases for each vendor
        for (const vendor of vendors) {
          try {
            const purchasesResponse = await axiosInstance.get(`/vendors/${vendor.id}/purchases`);
            if (purchasesResponse.data.success) {
              const vendorPurchases = purchasesResponse.data.data.map(purchase => ({
                ...purchase,
                vendorName: vendor.name,
                vendorPhone: vendor.phoneNumber,
                vendorId: vendor.id
              }));
              allPurchases = [...allPurchases, ...vendorPurchases];
            }
          } catch (err) {
            console.error(`Error fetching purchases for vendor ${vendor.name}:`, err);
          }
        }

        // Sort by purchase date (newest first)
        allPurchases.sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt));

        set({
          allPurchases: allPurchases,
          purchaseRecords: allPurchases,
          isLoadingPurchases: false,
        });
      } else {
        throw new Error('Failed to fetch vendors for purchase history');
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch purchase history',
        isLoadingPurchases: false,
      });
    }
  },

  // Fetch purchases for a specific vendor
  fetchVendorPurchases: async (vendorId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/vendors/${vendorId}/purchases`);

      if (response.data.success) {
        set({
          vendorPurchases: response.data.data,
          isLoading: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch vendor purchases');
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch vendor purchases',
        isLoading: false,
      });
    }
  },

  // In useVendorStore.js - Add these methods to the store

  // Update purchase
  updatePurchase: async (vendorId, purchaseId, purchaseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `/vendors/${vendorId}/purchases/${purchaseId}`,
        purchaseData
      );

      if (response.data.success) {
        // Update local state
        set((state) => {
          const updatedVendor = response.data.data?.vendor;
          const updatedPurchase = response.data.data?.purchase;

          // Update vendors list
          const updatedVendors = updatedVendor
            ? state.vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v)
            : state.vendors;

          // Update purchase records
          const updatedPurchases = state.allPurchases.map(p =>
            p.vendorId === vendorId && p.id === purchaseId
              ? { ...p, ...updatedPurchase }
              : p
          );

          const updatedRecords = state.purchaseRecords.map(p =>
            p.vendorId === vendorId && p.id === purchaseId
              ? { ...p, ...updatedPurchase }
              : p
          );

          return {
            vendors: updatedVendors,
            allPurchases: updatedPurchases,
            purchaseRecords: updatedRecords,
            showEditPurchaseModal: false,
            editingPurchase: null,
            isLoading: false,
          };
        });

        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to update purchase');
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update purchase',
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Set purchase for editing
  setPurchaseForEditing: (purchase) => {
    set({
      editingPurchase: purchase,
      selectedVendor: null,
      purchaseProducts: purchase.products?.map(product => ({
        id: product.productId || `product_${Date.now()}`,
        name: product.productName,
        price: product.unitPrice,
        quantity: product.quantity,
        cost: product.unitPrice
      })) || [],
      purchaseData: {
        amountDue: purchase.amountDue || 0,
        amountPaid: purchase.amountPaid || 0,
        paymentMethod: purchase.paymentMethod || 'cash',
        notes: purchase.notes || ''
      }
    });
  },

  // Delete purchase
  deletePurchase: async (vendorId, purchaseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(
        `/vendors/${vendorId}/purchases/${purchaseId}`
      );

      if (response.data.success) {
        // Update local state
        set((state) => {
          const updatedVendor = response.data.data?.vendor;

          // Update vendors list
          const updatedVendors = updatedVendor
            ? state.vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v)
            : state.vendors;

          // Remove from purchase records
          const updatedPurchases = state.allPurchases.filter(
            p => !(p.vendorId === vendorId && p.id === purchaseId)
          );

          const updatedRecords = state.purchaseRecords.filter(
            p => !(p.vendorId === vendorId && p.id === purchaseId)
          );

          return {
            vendors: updatedVendors,
            allPurchases: updatedPurchases,
            purchaseRecords: updatedRecords,
            isLoading: false,
          };
        });

        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to delete purchase');
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete purchase',
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Search/filter purchase records
  filterPurchaseRecords: (filters) => {
    const { allPurchases } = get();
    let filtered = [...allPurchases];

    if (filters.vendorId) {
      filtered = filtered.filter(p => p.vendorId === filters.vendorId);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(p => new Date(p.purchaseDate || p.createdAt) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => new Date(p.purchaseDate || p.createdAt) <= end);
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(p => p.paymentMethod === filters.paymentMethod);
    }

    set({ purchaseRecords: filtered });
  },

  // Calculate purchase total
  calculatePurchaseTotal: () => {
    const { purchaseProducts } = get();
    return purchaseProducts.reduce((total, product) => {
      const price = product.price || product.cost || 0;
      return total + (price * product.quantity);
    }, 0);
  },

  // Create purchase
  createPurchase: async (purchaseData) => {
    const state = get();
    // Use store state
    const currentSelectedVendor = state.selectedVendor;
    const currentPurchaseProducts = state.purchaseProducts;

    if (!currentSelectedVendor) {
      set({ error: 'Please select a vendor first' });
      return { success: false, error: 'No vendor selected' };
    }

    // Use purchaseData from parameter, not from state
    if (!purchaseData || purchaseData.amountDue <= 0) {
      set({ error: 'Amount due must be greater than 0' });
      return { success: false, error: 'Invalid amount due' };
    }

    set({ isLoading: true, error: null });

    try {
      // If no products in store, and we have a manual amountDue, we might be creating a simple record
      // However, the backend requires at least one product name.
      // If purchaseProducts is empty, we'll create a dummy 'General Purchase' entry if amountDue > 0
      let purchaseProductsData = currentPurchaseProducts.map(product => ({
        productId: product.isCustom ? null : product.id,
        productName: product.name,
        quantity: product.quantity,
        unitPrice: product.price || product.cost || 0,
      }));

      if (purchaseProductsData.length === 0 && purchaseData.amountDue > 0) {
        purchaseProductsData = [{
          productName: 'General Purchase',
          quantity: 1,
          unitPrice: purchaseData.amountDue
        }];
      }

      const purchasePayload = {
        products: purchaseProductsData,
        amountDue: purchaseData.amountDue || 0,
        amountPaid: purchaseData.amountPaid || 0,
        paymentMethod: purchaseData.paymentMethod || 'cash',
        notes: purchaseData.notes || '',
      };

      const response = await axiosInstance.post(
        `/vendors/${currentSelectedVendor.id}/purchases`,
        purchasePayload
      );

      if (response.data.success) {
        // Update vendors list
        const updatedVendor = response.data.data?.vendor;

        set((state) => {
          let updatedVendors;
          if (updatedVendor) {
            updatedVendors = state.vendors.map(vendor =>
              vendor.id === updatedVendor.id ? updatedVendor : vendor
            );
          } else {
            updatedVendors = state.vendors.map(vendor =>
              vendor.id === selectedVendor.id
                ? {
                  ...vendor,
                  totalPurchases: (vendor.totalPurchases || 0) + 1,
                  totalAmount: (vendor.totalAmount || 0) + (purchaseData.amountDue || 0),
                  balance: (vendor.balance || 0) + ((purchaseData.amountDue || 0) - (purchaseData.amountPaid || 0)),
                }
                : vendor
            );
          }

          return {
            vendors: updatedVendors,
            purchaseProducts: [],
            productSearchResults: [],
            selectedVendor: null,
            purchaseData: {  // Reset purchase data
              amountDue: 0,
              amountPaid: 0,
              paymentMethod: 'cash',
              notes: ''
            },
            showPurchaseModal: false,
            isLoading: false,
            error: null
          };
        });

        // Refresh purchase history
        get().fetchAllPurchases();

        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Purchase creation failed');
      }

    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create purchase',
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useVendorPurchaseStore;