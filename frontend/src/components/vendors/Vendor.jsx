import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../lib/axios';

const CreateVendorModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await onCreate(formData);
    setIsSubmitting(false);
    if (result.success) {
      setFormData({ name: '', phoneNumber: '', location: '' });
      onClose();
      toast.success('Vendor created successfully');
    } else {
      toast.error(result.error || 'Failed to create vendor');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Create New Vendor</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new vendor to your system</p>
          </div>
          <button
            onClick={onClose}
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
              onClick={onClose}
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
    setIsSubmitting(true);
    const result = await onUpdate(vendor.id, formData);
    setIsSubmitting(false);
    if (result.success) {
      onClose();
      toast.success('Vendor updated successfully');
    } else {
      toast.error(result.error || 'Failed to update vendor');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Vendor</h3>
            <p className="text-sm text-gray-600 mt-1">Update vendor information</p>
          </div>
          <button
            onClick={onClose}
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
              onClick={onClose}
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
          onClick={() => onRemove(product.id)}
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
              onClick={() => onQuantityChange(product.id, (parseInt(product.quantity) || 1) - 1)}
              className="p-1 border border-gray-300 rounded-l-lg hover:bg-gray-100"
              disabled={(parseInt(product.quantity) || 1) <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              value={product.quantity}
              onChange={(e) => onQuantityChange(product.id, parseInt(e.target.value) || 1)}
              className="w-16 text-center border-t border-b border-gray-300 py-1 text-sm focus:outline-none"
              min="1"
            />
            <button
              onClick={() => onQuantityChange(product.id, (parseInt(product.quantity) || 1) + 1)}
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
            onChange={(e) => onPriceChange(product.id, parseFloat(e.target.value) || 0)}
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

  const handleAddCustomProduct = () => {
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

  const getStockStatusColor = (stock, threshold = 5) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock <= threshold) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div>
            <h3 className="text-xl font-bold">Create New Purchase</h3>
            <p className="text-blue-100 text-sm mt-1">Search products and complete the purchase</p>
          </div>
          <button
            onClick={onClose}
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
                onClick={() => setShowCustomForm(!showCustomForm)}
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={customProduct.price}
                        onChange={(e) => setCustomProduct({ ...customProduct, price: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={customProduct.quantity}
                        onChange={(e) => setCustomProduct({ ...customProduct, quantity: parseInt(e.target.value) || 1 })}
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
                onClick={onClose}
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

  if (!purchase) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
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
              onClick={onClose}
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

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Payment Summary</h3>
          <p className="text-gray-600 mt-2">Total Paid: <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span></p>
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
    setShowVendorModal,
    setShowPurchaseModal,
    setShowEditVendorModal,
    setShowPayModal,
    setEditingVendor,
    editingVendor
  } = useVendorPurchaseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchaseForPay, setSelectedPurchaseForPay] = useState(null);

  useEffect(() => {
    fetchVendors();
    fetchAllPurchases();
  }, [fetchVendors, fetchAllPurchases]);

  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phoneNumber?.includes(searchTerm)
  );

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

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

  const handlePayVendor = (purchase) => {
    setSelectedPurchaseForPay(purchase);
    setShowPayModal(true);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600 mt-1">Manage vendors and track purchases</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowVendorModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              Add Vendor
            </button>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/20"
            >
              <ShoppingCart className="w-5 h-5" />
              New Purchase
            </button>
            <button
              onClick={() => {
                fetchVendors();
                fetchAllPurchases();
                toast.success('Data refreshed');
              }}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{vendors.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{purchaseRecords.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(purchaseRecords.reduce((sum, p) => sum + (p.amountDue || 0), 0))}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(purchaseRecords.reduce((sum, p) => sum + ((p.amountDue || 0) - (p.amountPaid || 0)), 0))}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`pb-4 px-2 font-medium transition ${activeTab === 'vendors' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Vendors List
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-4 px-2 font-medium transition ${activeTab === 'records' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Purchase Records
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {activeTab === 'vendors' ? (
          <div className="space-y-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map(vendor => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditingVendor(vendor);
                          setShowEditVendorModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{vendor.name}</h3>
                  <p className="text-gray-600 flex items-center gap-2 text-sm mb-2">
                    <Phone className="w-4 h-4" /> {vendor.phoneNumber}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2 text-sm mb-4">
                    <MapPin className="w-4 h-4" /> {vendor.location}
                  </p>
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Purchases:</span>
                      <span className="font-bold">{vendor.totalPurchases || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Amount:</span>
                      <span className="font-bold text-green-600">{formatCurrency(vendor.totalAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Balance:</span>
                      <span className={`font-bold ${(vendor.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(vendor.balance || 0)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredVendors.length === 0 && !isLoading && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  No vendors found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <PaymentMethodDashboard purchaseRecords={purchaseRecords} />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Products</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Paid</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Balance</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Method</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchaseRecords.map(purchase => (
                      <tr key={purchase.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{purchase.vendorName}</div>
                          <div className="text-xs text-gray-500">ID: #{purchase.id?.slice(-8)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <span className="font-medium">{purchase.productName}</span>
                            <span className="text-gray-500 text-xs block">
                              Qty: {purchase.quantity} × ${purchase.unitPrice?.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">${purchase.amountDue?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-green-600 font-medium">${purchase.amountPaid?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${(purchase.amountDue - purchase.amountPaid) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            ${((purchase.amountDue || 0) - (purchase.amountPaid || 0)).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize text-sm">{purchase.paymentMethod}</span>
                        </td>
                        <td className="px-6 py-4">
                          {(purchase.amountDue - purchase.amountPaid) > 0 && (
                            <button
                              onClick={() => handlePayVendor(purchase)}
                              className="text-blue-600 hover:text-blue-800 font-bold text-sm underline flex items-center gap-1"
                            >
                              <DollarSign className="w-4 h-4" />
                              Collect Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {purchaseRecords.length === 0 && !isLoading && (
                <div className="py-12 text-center text-gray-500">No purchase records found</div>
              )}
            </div>
          </div>
        )}
      </div>

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
      </AnimatePresence>
    </div>
  );
};

export default Vendor;