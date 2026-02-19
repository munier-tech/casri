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
  RefreshCw,
  Eye,
  CheckCircle,
  Receipt,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../lib/axios';

// ... (keep all the modal components: CreateVendorModal, EditVendorModal, ProductRow, CreatePurchaseModal, PayVendorModal, PaymentMethodDashboard exactly as they are) ...

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
    setSelectedPurchase(purchase);
    setShowPayModal(true);
  };

  const handleViewPurchase = (purchase) => {
    setSelectedPurchaseForView(purchase);
    setSelectedPurchase(purchase);
    setShowViewPurchaseModal(true);
  };

  const handleDownloadReceipt = (purchase) => {
    // Generate receipt content
    const receiptContent = `
      PURCHASE RECEIPT
      ================
      Date: ${new Date(purchase.purchaseDate || purchase.createdAt).toLocaleString()}
      Receipt #: ${purchase.id}
      
      Vendor: ${purchase.vendorName}
      Phone: ${purchase.vendorPhone || 'N/A'}
      
      Product: ${purchase.productName}
      Quantity: ${purchase.quantity}
      Unit Price: $${purchase.unitPrice?.toFixed(2)}
      
      Total Amount: $${purchase.amountDue?.toFixed(2)}
      Amount Paid: $${purchase.amountPaid?.toFixed(2)}
      Balance: $${((purchase.amountDue || 0) - (purchase.amountPaid || 0)).toFixed(2)}
      
      Payment Method: ${purchase.paymentMethod || 'Cash'}
      Status: ${(purchase.amountDue - purchase.amountPaid) > 0 ? 'PARTIALLY PAID' : 'PAID IN FULL'}
      
      Thank you for your business!
    `;

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-${purchase.id.slice(-8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded');
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
              onClick={() => setShowVendorModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Vendor
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/20 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              New Purchase
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                fetchVendors();
                fetchAllPurchases();
                toast.success('Data refreshed');
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 shadow-lg transition-all"
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
              className={`px-6 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
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
                        onClick={() => {
                          setEditingVendor(vendor);
                          setShowEditVendorModal(true);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
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
                      const isFullyPaid = balance <= 0;
                      
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
                                  onClick={() => handlePayVendor(purchase)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md"
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
                                onClick={() => handleViewPurchase(purchase)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDownloadReceipt(purchase)}
                                className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Download Receipt"
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
      </AnimatePresence>
    </div>
  );
};

export default Vendor;