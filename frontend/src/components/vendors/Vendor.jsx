import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useVendorPurchaseStore from '../../store/useVendorStore';
import {
  Plus,
  Trash2,
  Users,
  ShoppingCart,
  DollarSign,
  X,
  Edit,
  Phone,
  MapPin,
  AlertCircle,
  Search,
  Loader2,
  CreditCard,
  Coins,
  Smartphone,
  Package,
  Minus,
  RefreshCw,
  Eye,
  CheckCircle,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../lib/axios';

// ========== MODAL COMPONENTS ==========

const CreateVendorModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmitting(true);
    try {
      const result = await onCreate(formData);
      if (result?.success) {
        setFormData({ name: '', phoneNumber: '', location: '' });
        onClose();
        toast.success('Vendor created successfully');
      } else {
        toast.error(result?.error || 'Failed to create vendor');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Create New Vendor</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new vendor to your system</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+252 61 234 5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Vendor'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const EditVendorModal = ({ isOpen, onClose, vendor, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        phoneNumber: vendor.phoneNumber || '',
        location: vendor.location || ''
      });
    }
  }, [vendor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmitting(true);
    try {
      const result = await onUpdate(vendor.id, formData);
      if (result?.success) {
        onClose();
        toast.success('Vendor updated successfully');
      } else {
        toast.error(result?.error || 'Failed to update vendor');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    onClose();
  };

  if (!isOpen || !vendor) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Vendor</h3>
            <p className="text-sm text-gray-600 mt-1">Update vendor information</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+252 61 234 5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 px-4 rounded-xl hover:from-green-700 hover:to-green-800 font-medium shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Vendor'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ProductRow = React.memo(({ product, onQuantityChange, onPriceChange, onRemove }) => {
  const total = useMemo(() => {
    const price = parseFloat(product.price) || parseFloat(product.cost) || 0;
    const quantity = parseInt(product.quantity) || 1;
    return price * quantity;
  }, [product.price, product.cost, product.quantity]);

  const handleQuantityDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuantityChange(product.id, (parseInt(product.quantity) || 1) - 1);
  };

  const handleQuantityIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuantityChange(product.id, (parseInt(product.quantity) || 1) + 1);
  };

  const handleQuantityInput = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuantityChange(product.id, parseInt(e.target.value) || 1);
  };

  const handlePriceInput = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPriceChange(product.id, parseFloat(e.target.value) || 0);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(product.id);
  };

  return (
    <div className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-800">{product.name}</span>
          {product.isCustom && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
              Custom
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500">Quantity</label>
          <div className="flex items-center mt-1">
            <button
              type="button"
              onClick={handleQuantityDecrease}
              className="p-1 border border-gray-300 rounded-l-lg hover:bg-gray-100"
              disabled={(parseInt(product.quantity) || 1) <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              value={product.quantity}
              onChange={handleQuantityInput}
              onClick={(e) => e.stopPropagation()}
              className="w-16 text-center border-t border-b border-gray-300 py-1 text-sm focus:outline-none"
              min="1"
            />
            <button
              type="button"
              onClick={handleQuantityIncrease}
              className="p-1 border border-gray-300 rounded-r-lg hover:bg-gray-100"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div>
          <label className="text-xs text-gray-500">Unit Price ($)</label>
          <input
            type="number"
            value={product.price || product.cost || 0}
            onChange={handlePriceInput}
            onClick={(e) => e.stopPropagation()}
            className="w-full mt-1 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-500">Total</label>
          <p className="mt-1 font-semibold text-blue-600">${total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
});

const CreatePurchaseModal = ({ isOpen, onClose, vendors, onCreate, onSelectVendor }) => {
  const {
    purchaseProducts,
    addProductToPurchase,
    addCustomProductToPurchase,
    removeProductFromPurchase,
    updateProductQuantity,
    updateProductPrice,
    purchaseData,
    updatePurchaseData,
    clearPurchaseProducts
  } = useVendorPurchaseStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: '', price: '', quantity: 1 });
  const [manualTotal, setManualTotal] = useState('');

  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const calculatedTotal = useMemo(() => {
    return purchaseProducts.reduce((sum, product) => {
      const price = parseFloat(product.price) || parseFloat(product.cost) || 0;
      const quantity = parseInt(product.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
  }, [purchaseProducts]);

  const total = manualTotal !== '' ? parseFloat(manualTotal) || 0 : calculatedTotal;

  useEffect(() => {
    updatePurchaseData({ amountDue: total });
  }, [total, updatePurchaseData]);

  useEffect(() => {
    if (isOpen) {
      clearPurchaseProducts();
      setSearchTerm("");
      setSelectedVendorId('');
      setShowCustomForm(false);
      setCustomProduct({ name: '', price: '', quantity: 1 });
      setSearchResults([]);
      setShowSearchResults(false);
      setManualTotal('');
      updatePurchaseData({ amountDue: 0, amountPaid: 0, paymentMethod: 'cash', notes: '' });
      
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, clearPurchaseProducts, updatePurchaseData]);

  useEffect(() => {
    const searchProductsAPI = async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axiosInstance.get(`/products/search?q=${encodeURIComponent(query)}`);
        if (response.data.success) {
          setSearchResults(response.data.data || []);
          setShowSearchResults(true);
        } else {
          setSearchResults(response.data.products || []);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        try {
          const fallbackResponse = await axiosInstance.get(`/products?search=${encodeURIComponent(query)}`);
          setSearchResults(fallbackResponse.data.data || fallbackResponse.data.products || []);
          setShowSearchResults(true);
        } catch (fallbackError) {
          console.error('Fallback search also failed:', fallbackError);
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    };

    if (searchTerm.trim()) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        searchProductsAPI(searchTerm);
      }, 300);
      
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVendorChange = (e) => {
    e.stopPropagation();
    const vendorId = e.target.value;
    setSelectedVendorId(vendorId);
    const vendor = vendors.find(v => v.id === vendorId);
    onSelectVendor(vendor);
  };

  const handleProductSelect = (product) => {
    addProductToPurchase(product);
    setSearchTerm("");
    setShowSearchResults(false);
    setManualTotal('');
    toast.success(`${product.name} added to purchase`);
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleAddCustomProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!customProduct.name || !customProduct.price) {
      toast.error('Please enter product name and price');
      return;
    }
    addCustomProductToPurchase(
      customProduct.name,
      parseFloat(customProduct.price),
      parseInt(customProduct.quantity) || 1
    );
    setCustomProduct({ name: '', price: '', quantity: 1 });
    setShowCustomForm(false);
    setManualTotal('');
    toast.success('Custom product added');
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVendorId) {
      toast.error('Please select a vendor');
      return;
    }

    if (purchaseProducts.length === 0 && total <= 0) {
      toast.error('Please add at least one product or enter a total amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onCreate({
        vendorId: selectedVendorId,
        products: purchaseProducts,
        amountDue: total,
        amountPaid: parseFloat(purchaseData.amountPaid) || 0,
        paymentMethod: purchaseData.paymentMethod,
        notes: purchaseData.notes
      });
      
      if (result && result.success) {
        onClose();
        toast.success('Purchase created successfully');
      } else {
        toast.error(result?.error || 'Failed to create purchase');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    onClose();
  };

  const getStockStatusColor = (stock, threshold = 5) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock <= threshold) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div>
            <h3 className="text-xl font-bold">Create New Purchase</h3>
            <p className="text-blue-100 text-sm mt-1">Search products and complete the purchase</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vendor <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedVendorId}
                onChange={handleVendorChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Choose a vendor...</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.phoneNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative" ref={searchResultsRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Search products by name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                  {isSearching && (
                    <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                  )}
                </div>

                <AnimatePresence>
                  {showSearchResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Package className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-500">Cost: ${parseFloat(product.cost || product.price || 0).toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {product.stock !== undefined && (
                                <span className={`text-xs px-2 py-1 rounded-full ${getStockStatusColor(product.stock, product.lowStockThreshold)}`}>
                                  Stock: {product.stock}
                                </span>
                              )}
                              <Plus className="w-4 h-4 text-blue-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCustomForm(!showCustomForm);
                }}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {showCustomForm ? 'Hide custom product form' : 'Add custom product'}
              </button>

              <AnimatePresence>
                {showCustomForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <h4 className="font-medium text-gray-800 mb-3">Add Custom Product</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Product name"
                        value={customProduct.name}
                        onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={customProduct.price}
                        onChange={(e) => setCustomProduct({ ...customProduct, price: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={customProduct.quantity}
                        onChange={(e) => setCustomProduct({ ...customProduct, quantity: parseInt(e.target.value) || 1 })}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomProduct}
                      className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      Add Custom Product
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {purchaseProducts.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800">Selected Products</h4>
                </div>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {purchaseProducts.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onQuantityChange={updateProductQuantity}
                      onPriceChange={updateProductPrice}
                      onRemove={removeProductFromPurchase}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Payment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount <span className="text-gray-400 text-xs">(editable)</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={manualTotal !== '' ? manualTotal : total.toFixed(2)}
                      onChange={(e) => {
                        setManualTotal(e.target.value);
                        updatePurchaseData({ amountDue: parseFloat(e.target.value) || 0 });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  {purchaseProducts.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Calculated from products: ${calculatedTotal.toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Paid <span className="text-gray-400 text-xs">(editable)</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={purchaseData.amountPaid}
                      onChange={(e) => updatePurchaseData({ amountPaid: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={purchaseData.paymentMethod}
                    onChange={(e) => updatePurchaseData({ paymentMethod: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="zaad">Zaad</option>
                    <option value="edahab">Edahab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balance
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={(total - (parseFloat(purchaseData.amountPaid) || 0)).toFixed(2)}
                      readOnly
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl font-bold ${
                        (total - (parseFloat(purchaseData.amountPaid) || 0)) > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={purchaseData.notes}
                  onChange={(e) => updatePurchaseData({ notes: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this purchase..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || (!selectedVendorId) || (purchaseProducts.length === 0 && total <= 0)}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 px-4 rounded-xl hover:from-green-700 hover:to-green-800 font-medium shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Create Purchase (${total.toFixed(2)})
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const PayVendorModal = ({ purchase, onClose, onSuccess }) => {
  const { updatePurchase } = useVendorPurchaseStore();
  const [formData, setFormData] = useState({
    amountPaid: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (purchase) {
      setFormData({
        amountPaid: '',
        paymentMethod: purchase.paymentMethod || 'cash',
        notes: ''
      });
    }
  }, [purchase]);

  const amountOwed = purchase ? Math.max(0, (purchase.amountDue || 0) - (purchase.amountPaid || 0)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(formData.amountPaid) > amountOwed) {
      toast.error('Amount paid cannot exceed amount owed');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePurchase(purchase.vendorId, purchase.id, {
        amountPaid: (purchase.amountPaid || 0) + parseFloat(formData.amountPaid),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });

      if (result.success) {
        onSuccess();
        onClose();
        toast.success('Payment recorded successfully');
      } else {
        toast.error(result.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    onClose();
  };

  if (!purchase) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
          <button 
            type="button"
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-gray-600">Vendor: <span className="font-bold">{purchase.vendorName}</span></p>
          <p className="text-sm text-gray-600 mt-1">Total Due: <span className="font-bold">${purchase.amountDue?.toFixed(2)}</span></p>
          <p className="text-sm text-gray-600 mt-1">Already Paid: <span className="font-bold text-green-600">${purchase.amountPaid?.toFixed(2)}</span></p>
          <p className="text-lg font-bold text-blue-600 mt-3">Remaining: ${amountOwed.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Pay <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                min="0.01"
                max={amountOwed}
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="zaad">Zaad</option>
              <option value="edahab">Edahab</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add notes about this payment..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 px-4 rounded-xl hover:from-green-700 hover:to-green-800 font-medium shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ========== PAYMENT DASHBOARD COMPONENT ==========
const PaymentMethodDashboard = ({ purchaseRecords }) => {
  const calculatePaymentStats = (purchases) => {
    const stats = {
      cash: { total: 0, count: 0, label: 'Cash', icon: Coins, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
      zaad: { total: 0, count: 0, label: 'Zaad', icon: Smartphone, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
      edahab: { total: 0, count: 0, label: 'Edahab', icon: CreditCard, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' }
    };

    purchases.forEach(purchase => {
      const method = purchase.paymentMethod || 'cash';
      const amountPaid = purchase.amountPaid || 0;
      if (stats[method]) {
        stats[method].total += amountPaid;
        stats[method].count += 1;
      }
    });
    return stats;
  };

  const paymentStats = calculatePaymentStats(purchaseRecords);
  const totalPaid = purchaseRecords.reduce((sum, purchase) => sum + (purchase.amountPaid || 0), 0);

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Payment Summary</h3>
          <p className="text-gray-600 mt-2">
            Total Paid: <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(paymentStats).map(([method, data]) => {
          const Icon = data.icon;
          return (
            <div key={method} className={`p-6 rounded-xl border-2 ${data.borderColor} ${data.bgColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${data.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right text-gray-900 font-bold">{data.count} payments</div>
              </div>
              <h4 className="text-lg font-bold text-gray-900">{data.label}</h4>
              <div className="text-2xl font-bold mt-2">{formatCurrency(data.total)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========== VIEW PURCHASE MODAL ==========
const ViewPurchaseModal = ({ isOpen, onClose, purchase }) => {
  const handleClose = (e) => {
    e?.stopPropagation();
    onClose();
  };

  if (!isOpen || !purchase) return null;

  const balance = (purchase.amountDue || 0) - (purchase.amountPaid || 0);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div>
            <h3 className="text-xl font-bold">Purchase Details</h3>
            <p className="text-blue-100 text-sm mt-1">View complete purchase information</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="space-y-6">
            {/* Vendor Information */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Vendor Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{purchase.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{purchase.vendorPhone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Purchase Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Purchase ID</p>
                  <p className="font-medium text-gray-900">#{purchase.id?.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-medium text-gray-900">{purchase.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-900">{purchase.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="font-medium text-gray-900">${purchase.unitPrice?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium text-gray-900">${purchase.amountDue?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Payment Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-gray-900">${purchase.amountDue?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-bold text-green-600">${purchase.amountPaid?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${balance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{purchase.paymentMethod || 'Cash'}</p>
                </div>
              </div>
              {purchase.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700 mt-1">{purchase.notes}</p>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                balance > 0 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {balance > 0 ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Partially Paid - ${balance.toFixed(2)} remaining
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Paid in Full
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ========== MAIN VENDOR COMPONENT ==========
const Vendor = () => {
  const {
    vendors,
    purchaseRecords,
    isLoading,
    error,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    createPurchase,
    fetchAllPurchases,
    setActiveTab,
    activeTab,
    showVendorModal,
    showPurchaseModal,
    showEditVendorModal,
    showPayModal,
    showViewPurchaseModal,
    setShowVendorModal,
    setShowPurchaseModal,
    setShowEditVendorModal,
    setShowPayModal,
    setShowViewPurchaseModal,
    setEditingVendor,
    editingVendor,
    setSelectedPurchase
  } = useVendorPurchaseStore();

  // Local state for modals if store doesn't have them
  const [localShowViewModal, setLocalShowViewModal] = useState(false);
  const [localSelectedPurchase, setLocalSelectedPurchase] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchaseForPay, setSelectedPurchaseForPay] = useState(null);
  const [selectedPurchaseForView, setSelectedPurchaseForView] = useState(null);

  useEffect(() => {
    fetchVendors();
    fetchAllPurchases();
  }, [fetchVendors, fetchAllPurchases]);

  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phoneNumber?.includes(searchTerm)
  );

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  const handleDeleteVendor = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor? This will also delete all associated purchase records.')) {
      const result = await deleteVendor(id);
      if (result.success) {
        toast.success('Vendor deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete vendor');
      }
    }
  };

  const handlePayVendor = (purchase, e) => {
    e?.stopPropagation();
    setSelectedPurchaseForPay(purchase);
    setSelectedPurchase(purchase);
    if (setShowPayModal) {
      setShowPayModal(true);
    }
  };

  const handleViewPurchase = (purchase, e) => {
    e?.stopPropagation();
    setSelectedPurchaseForView(purchase);
    setSelectedPurchase(purchase);
    
    // Check if store has the view modal state, otherwise use local state
    if (setShowViewPurchaseModal) {
      setShowViewPurchaseModal(true);
    } else {
      setLocalShowViewModal(true);
      setLocalSelectedPurchase(purchase);
    }
  };

  const handleDownloadReceipt = (purchase, e) => {
    e?.stopPropagation();
    // Generate receipt content
    const receiptContent = `
      =================================
                PURCHASE RECEIPT
      =================================
      
      Receipt #: ${purchase.id?.slice(-8)}
      Date: ${new Date(purchase.purchaseDate || purchase.createdAt).toLocaleString()}
      
      VENDOR INFORMATION
      ------------------
      Name: ${purchase.vendorName}
      Phone: ${purchase.vendorPhone || 'N/A'}
      
      PRODUCT INFORMATION
      -------------------
      Product: ${purchase.productName}
      Quantity: ${purchase.quantity}
      Unit Price: $${purchase.unitPrice?.toFixed(2)}
      
      PAYMENT INFORMATION
      -------------------
      Total Amount: $${purchase.amountDue?.toFixed(2)}
      Amount Paid: $${purchase.amountPaid?.toFixed(2)}
      Balance: $${((purchase.amountDue || 0) - (purchase.amountPaid || 0)).toFixed(2)}
      Payment Method: ${purchase.paymentMethod || 'Cash'}
      
      Status: ${(purchase.amountDue - purchase.amountPaid) > 0 ? 'PARTIALLY PAID' : 'PAID IN FULL'}
      
      =================================
          Thank you for your business!
      =================================
    `;

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-${purchase.id?.slice(-8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded');
  };

  const handleAddVendor = (e) => {
    e?.stopPropagation();
    setShowVendorModal(true);
  };

  const handleNewPurchase = (e) => {
    e?.stopPropagation();
    setShowPurchaseModal(true);
  };

  const handleRefresh = (e) => {
    e?.stopPropagation();
    fetchVendors();
    fetchAllPurchases();
    toast.success('Data refreshed');
  };

  // Function to close view modal
  const handleCloseViewModal = () => {
    if (setShowViewPurchaseModal) {
      setShowViewPurchaseModal(false);
    } else {
      setLocalShowViewModal(false);
      setLocalSelectedPurchase(null);
    }
    setSelectedPurchaseForView(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Vendor Management
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Manage vendors and track purchases
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddVendor}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              type="button"
            >
              <Plus className="w-5 h-5" />
              Add Vendor
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewPurchase}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/20 transition-all cursor-pointer"
              type="button"
            >
              <ShoppingCart className="w-5 h-5" />
              New Purchase
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 shadow-lg transition-all cursor-pointer"
              type="button"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Vendors', value: vendors.length, icon: Users, color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
            { label: 'Total Purchases', value: purchaseRecords.length, icon: ShoppingCart, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50', textColor: 'text-green-600' },
            { label: 'Total Amount', value: formatCurrency(purchaseRecords.reduce((sum, p) => sum + (p.amountDue || 0), 0)), icon: DollarSign, color: 'from-purple-500 to-pink-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
            { label: 'Outstanding Balance', value: formatCurrency(purchaseRecords.reduce((sum, p) => sum + ((p.amountDue || 0) - (p.amountPaid || 0)), 0)), icon: AlertCircle, color: 'from-red-500 to-orange-600', bgColor: 'bg-red-50', textColor: 'text-red-600' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl border border-gray-200/60 w-fit">
          {['vendors', 'records'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              type="button"
            >
              {tab === 'vendors' ? 'Vendors List' : 'Purchase Records'}
            </button>
          ))}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        )}

        {activeTab === 'vendors' ? (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vendors by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-xl transition-all hover:border-blue-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingVendor(vendor);
                          setShowEditVendorModal(true);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors cursor-pointer"
                        type="button"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVendor(vendor.id);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors cursor-pointer"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{vendor.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600 flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {vendor.phoneNumber}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {vendor.location}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Purchases:</span>
                      <span className="font-semibold text-gray-900">{vendor.totalPurchases || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Amount:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(vendor.totalAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Balance:</span>
                      <span className={`font-semibold ${(vendor.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(vendor.balance || 0)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredVendors.length === 0 && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-16 text-center"
                >
                  <div className="bg-white rounded-2xl p-12 border-2 border-dashed border-gray-200">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No vendors found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search or add a new vendor</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Dashboard */}
            <PaymentMethodDashboard purchaseRecords={purchaseRecords} />
            
            {/* Purchase Records Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Paid</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchaseRecords.map((purchase, index) => {
                      const balance = (purchase.amountDue || 0) - (purchase.amountPaid || 0);
                      
                      return (
                        <motion.tr 
                          key={purchase.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{purchase.vendorName}</div>
                              <div className="text-xs text-gray-500 mt-1">ID: #{purchase.id?.slice(-8)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">{purchase.productName}</span>
                              <div className="text-xs text-gray-500 mt-1">
                                Qty: {purchase.quantity} × ${purchase.unitPrice?.toFixed(2)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900">
                              ${purchase.amountDue?.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-green-600 font-medium">
                              ${purchase.amountPaid?.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              balance > 0 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              ${balance.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm capitalize">
                              {purchase.paymentMethod === 'zaad' && <Smartphone className="w-3.5 h-3.5" />}
                              {purchase.paymentMethod === 'edahab' && <CreditCard className="w-3.5 h-3.5" />}
                              {purchase.paymentMethod === 'cash' && <Coins className="w-3.5 h-3.5" />}
                              {purchase.paymentMethod || 'Cash'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {balance > 0 ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => handlePayVendor(purchase, e)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                  type="button"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  Pay ${balance.toFixed(2)}
                                </motion.button>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Paid
                                </span>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleViewPurchase(purchase, e)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="View Details"
                                type="button"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleDownloadReceipt(purchase, e)}
                                className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                title="Download Receipt"
                                type="button"
                              >
                                <Download className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {purchaseRecords.length === 0 && !isLoading && (
                <div className="py-16 text-center">
                  <div className="bg-white rounded-2xl p-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No purchase records found</p>
                    <p className="text-gray-400 text-sm mt-2">Create a new purchase to get started</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showVendorModal && (
          <CreateVendorModal
            isOpen={showVendorModal}
            onClose={() => setShowVendorModal(false)}
            onCreate={createVendor}
          />
        )}

        {showEditVendorModal && editingVendor && (
          <EditVendorModal
            isOpen={showEditVendorModal}
            onClose={() => {
              setShowEditVendorModal(false);
              setEditingVendor(null);
            }}
            vendor={editingVendor}
            onUpdate={updateVendor}
          />
        )}

        {showPurchaseModal && (
          <CreatePurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            vendors={vendors}
            onCreate={createPurchase}
            onSelectVendor={(vendor) => useVendorPurchaseStore.setState({ selectedVendor: vendor })}
          />
        )}

        {showPayModal && selectedPurchaseForPay && (
          <PayVendorModal
            purchase={selectedPurchaseForPay}
            onClose={() => {
              setShowPayModal(false);
              setSelectedPurchaseForPay(null);
            }}
            onSuccess={() => {
              fetchVendors();
              fetchAllPurchases();
            }}
          />
        )}

        {/* Use either store state or local state for view modal */}
        {(showViewPurchaseModal || localShowViewModal) && (selectedPurchaseForView || localSelectedPurchase) && (
          <ViewPurchaseModal
            isOpen={true}
            onClose={handleCloseViewModal}
            purchase={selectedPurchaseForView || localSelectedPurchase}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vendor;