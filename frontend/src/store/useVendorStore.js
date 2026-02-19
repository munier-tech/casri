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
  isSearchingProducts: false,

  // Purchase History
  allPurchases: [],
  vendorPurchases: [],
  purchaseRecords: [],
  editingPurchase: null,
  selectedPurchase: null, // Added for view modal

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
  activeTab: 'vendors',
  showVendorModal: false,
  showPurchaseModal: false,
  showEditVendorModal: false,
  showEditPurchaseModal: false,
  showPayModal: false,
  showViewPurchaseModal: false, // Added for view modal

  // ========== TAB METHODS ==========

  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowVendorModal: (show) => set({ showVendorModal: show }),
  setShowPurchaseModal: (show) => set({ showPurchaseModal: show }),
  setShowEditVendorModal: (show) => set({ showEditVendorModal: show }),
  setShowEditPurchaseModal: (show) => set({ showEditPurchaseModal: show }),
  setShowPayModal: (show) => set({ showPayModal: show }),
  setShowViewPurchaseModal: (show) => set({ showViewPurchaseModal: show }), // Added

  // ========== EDIT/VIEW METHODS ==========

  setEditingVendor: (vendor) => set({ editingVendor: vendor }),
  setEditingPurchase: (purchase) => set({ editingPurchase: purchase }),
  setSelectedPurchase: (purchase) => set({ selectedPurchase: purchase }), // Added

  clearEditingVendor: () => set({ editingVendor: null }),
  clearEditingPurchase: () => set({ editingPurchase: null }),
  clearSelectedPurchase: () => set({ selectedPurchase: null }), // Added

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

  // Search products from API
  searchProducts: async (query) => {
    if (!query.trim()) {
      set({ productSearchResults: [], isSearchingProducts: false });
      return;
    }

    set({ isSearchingProducts: true });

    try {
      const response = await axiosInstance.get(`/products/search?q=${encodeURIComponent(query)}`);

      if (response.data.success) {
        set({ 
          productSearchResults: response.data.data || [],
          isSearchingProducts: false 
        });
      } else {
        set({ 
          productSearchResults: [],
          isSearchingProducts: false 
        });
      }
    } catch (error) {
      console.error('Error searching products:', error);
      set({ 
        productSearchResults: [],
        isSearchingProducts: false 
      });
    }
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
      purchaseData: {
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
          id: product.id,
          productId: product.id,
          name: product.name,
          quantity: 1,
          price: parseFloat(product.cost) || 0,
          unitPrice: parseFloat(product.cost) || 0,
          cost: parseFloat(product.cost) || 0
        }],
        productSearchResults: [],
      };
    });

    // Auto-update amount due when product is added
    setTimeout(() => {
      const total = get().calculatePurchaseTotal();
      get().updatePurchaseData({ amountDue: total });
    }, 0);
  },

  addCustomProductToPurchase: (productName, unitPrice, quantity = 1) => {
    const customProduct = {
      id: `custom_${Date.now()}`,
      productId: `custom_${Date.now()}`,
      name: productName,
      price: parseFloat(unitPrice),
      unitPrice: parseFloat(unitPrice),
      quantity: parseInt(quantity),
      isCustom: true,
      cost: parseFloat(unitPrice)
    };

    set((state) => ({
      purchaseProducts: [...state.purchaseProducts, customProduct],
      productSearchResults: [],
    }));

    // Auto-update amount due when product is added
    setTimeout(() => {
      const total = get().calculatePurchaseTotal();
      get().updatePurchaseData({ amountDue: total });
    }, 0);
  },

  removeProductFromPurchase: (productId) => {
    set((state) => ({
      purchaseProducts: state.purchaseProducts.filter(p => p.id !== productId),
    }));

    // Auto-update amount due when product is removed
    setTimeout(() => {
      const total = get().calculatePurchaseTotal();
      get().updatePurchaseData({ amountDue: total });
    }, 0);
  },

  updateProductQuantity: (productId, quantity) => {
    set((state) => ({
      purchaseProducts: state.purchaseProducts.map(p =>
        p.id === productId ? { ...p, quantity: Math.max(1, parseInt(quantity) || 1) } : p
      ),
    }));

    // Auto-update amount due when quantity changes
    setTimeout(() => {
      const total = get().calculatePurchaseTotal();
      get().updatePurchaseData({ amountDue: total });
    }, 0);
  },

  updateProductPrice: (productId, price) => {
    set((state) => ({
      purchaseProducts: state.purchaseProducts.map(p =>
        p.id === productId ? { ...p, price: Math.max(0, parseFloat(price) || 0), unitPrice: Math.max(0, parseFloat(price) || 0) } : p
      ),
    }));

    // Auto-update amount due when price changes
    setTimeout(() => {
      const total = get().calculatePurchaseTotal();
      get().updatePurchaseData({ amountDue: total });
    }, 0);
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
        productId: product.productId,
        name: product.productName,
        price: product.unitPrice,
        unitPrice: product.unitPrice,
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
      const price = parseFloat(product.price) || parseFloat(product.cost) || 0;
      const quantity = parseInt(product.quantity) || 1;
      return total + (price * quantity);
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

    if (currentPurchaseProducts.length === 0) {
      set({ error: 'Please add at least one product' });
      return { success: false, error: 'No products added' };
    }

    // Calculate total from products
    const calculatedTotal = state.calculatePurchaseTotal();

    set({ isLoading: true, error: null });

    try {
      const purchaseProductsData = currentPurchaseProducts.map(product => ({
        productId: product.isCustom ? null : product.id,
        productName: product.name,
        quantity: parseInt(product.quantity) || 1,
        unitPrice: parseFloat(product.price) || parseFloat(product.cost) || 0,
      }));

      const payload = {
        products: purchaseProductsData,
        amountDue: calculatedTotal,
        amountPaid: parseFloat(purchaseData.amountPaid) || 0,
        paymentMethod: purchaseData.paymentMethod || 'cash',
        notes: purchaseData.notes || '',
      };

      const response = await axiosInstance.post(
        `/vendors/${currentSelectedVendor.id}/purchases`,
        payload
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
              vendor.id === currentSelectedVendor.id
                ? {
                  ...vendor,
                  totalPurchases: (vendor.totalPurchases || 0) + 1,
                  totalAmount: (vendor.totalAmount || 0) + calculatedTotal,
                  balance: (vendor.balance || 0) + (calculatedTotal - (parseFloat(purchaseData.amountPaid) || 0)),
                }
                : vendor
            );
          }

          return {
            vendors: updatedVendors,
            purchaseProducts: [],
            productSearchResults: [],
            selectedVendor: null,
            purchaseData: {
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