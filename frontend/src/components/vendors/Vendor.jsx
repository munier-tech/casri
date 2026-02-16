import { useState, useEffect } from 'react';
import useVendorPurchaseStore from '../../store/useVendorStore';
import {
  Plus,
  Trash2,
  Users,
  ShoppingCart,
  DollarSign,
  CreditCard,
  X,
  Edit,
  Store,
  AlertCircle,
  RefreshCw,
  Search,
  Loader2,
  Calendar,
  FileText,
  Eye,
  BarChart3,
  CreditCard as Card,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  User,
  Lock,
  Download,
  Coins,
  Smartphone as PhoneIcon,
  CreditCard as CardIcon
} from 'lucide-react';

// ========== MODALS ==========

// Create Vendor Modal
const CreateVendorModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    location: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onCreate(formData);
    if (result.success) {
      setFormData({ name: '', phoneNumber: '', location: '' });
      onClose();
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+252 61 234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter location"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/20"
            >
              Create Vendor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Vendor Modal
const EditVendorModal = ({ isOpen, onClose, vendor, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    location: ''
  });

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
    const result = await onUpdate(vendor.id, formData);
    if (result.success) {
      onClose();
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+252 61 234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter location"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-lg shadow-green-500/20"
            >
              Update Vendor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Purchase Modal
const CreatePurchaseModal = ({ isOpen, onClose, vendors, onCreate, onSelectVendor }) => {
  const [formData, setFormData] = useState({
    vendorId: '',
    amountDue: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        vendorId: '',
        amountDue: '',
        paymentMethod: 'cash',
        notes: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amountDue || parseFloat(formData.amountDue) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const purchaseData = {
        amountDue: parseFloat(formData.amountDue),
        amountPaid: 0,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      const result = await onCreate(purchaseData);
      if (result.success) {
        onClose();
      } else if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Create purchase error:', error);
      alert('Failed to create purchase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'vendorId') {
      const vendor = vendors.find(v => v.id === value);
      onSelectVendor(vendor);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Create New Purchase</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new purchase record</p>
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
                Select Vendor <span className="text-red-500">*</span>
              </label>
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a vendor...</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.phoneNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Due <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="amountDue"
                  value={formData.amountDue}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="zaad">Zaad</option>
                <option value="edahab">Edahab</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about this purchase..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 px-4 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all font-medium shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Create Purchase
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Payment Dashboard Internal Component
const PaymentMethodDashboard = ({ purchaseRecords }) => {
  const calculatePaymentStats = (purchases) => {
    const stats = {
      cash: { total: 0, count: 0, label: 'Cash', icon: Coins, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
      zaad: { total: 0, count: 0, label: 'Zaad', icon: PhoneIcon, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
      edahab: { total: 0, count: 0, label: 'Edahab', icon: CardIcon, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' }
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
                <div className="text-right text-gray-900 font-bold">{data.count}</div>
              </div>
              <h4 className="text-lg font-bold text-gray-900">{data.label}</h4>
              <div className="text-2xl font-bold">{formatCurrency(data.total)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Pay Vendor Modal
const PayVendorModal = ({ purchase, onClose, onSuccess }) => {
  const { updatePurchase } = useVendorPurchaseStore();
  const [formData, setFormData] = useState({
    amountPaidToday: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountOwed = purchase ? Math.max(0, (purchase.amountDue || 0) - (purchase.amountPaid || 0)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amountPaidToday || parseFloat(formData.amountPaidToday) <= 0) return;

    setIsSubmitting(true);
    try {
      const result = await updatePurchase(purchase.vendorId, purchase.id, {
        ...purchase,
        amountPaid: (purchase.amountPaid || 0) + parseFloat(formData.amountPaidToday),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });
      if (result.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!purchase) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4">Pay Vendor</h3>
        <p className="text-gray-600 mb-4">Vendor: {purchase.vendorName}</p>
        <p className="text-lg font-bold text-blue-600 mb-6 underline">Due: ${amountOwed.toFixed(2)}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={formData.amountPaidToday}
            onChange={(e) => setFormData({ ...formData, amountPaidToday: e.target.value })}
            placeholder="Amount to pay"
            className="w-full p-3 border rounded-xl"
            max={amountOwed}
            required
          />
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="w-full p-3 border rounded-xl"
          >
            <option value="cash">Cash</option>
            <option value="zaad">Zaad</option>
            <option value="edahab">Edahab</option>
          </select>
          <div className="flex gap-2">
            <button disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">
              {isSubmitting ? "Processing..." : "Confirm Payment"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 border rounded-xl">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========== MAIN VENDOR COMPONENT ==========

const Vendor = () => {
  const {
    vendors,
    isLoading,
    error,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    createPurchase,
    fetchAllPurchases,
    purchaseRecords
  } = useVendorPurchaseStore();

  const [activeTab, setActiveTab] = useState('vendors');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState(null);
  const [selectedPurchaseForPay, setSelectedPurchaseForPay] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVendors();
    fetchAllPurchases();
  }, []);

  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phoneNumber?.includes(searchTerm)
  );

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600">Total Vendors: {vendors.length}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              Add Vendor
            </button>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/20"
            >
              <ShoppingCart className="w-5 h-5" />
              New Purchase
            </button>
          </div>
        </div>

        {/* Tabs */}
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

        {activeTab === 'vendors' ? (
          <div className="space-y-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map(vendor => (
                <div key={vendor.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => { setSelectedVendorForEdit(vendor); setShowEditModal(true); }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete vendor?')) deleteVendor(vendor.id) }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{vendor.name}</h3>
                  <p className="text-gray-600 flex items-center gap-2 text-sm mb-4">
                    <PhoneIcon className="w-4 h-4" /> {vendor.phoneNumber}
                  </p>
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Purchase:</span>
                      <span className="font-bold">{formatCurrency(vendor.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Balance Owed:</span>
                      <span className="font-bold text-red-600">{formatCurrency(vendor.balance)}</span>
                    </div>
                  </div>
                </div>
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
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Total Amount</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Paid</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Balance</th>
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
                      <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(purchase.amountDue)}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(purchase.amountPaid)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${(purchase.amountDue - purchase.amountPaid) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {formatCurrency(purchase.amountDue - purchase.amountPaid)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(purchase.amountDue - purchase.amountPaid) > 0 && (
                          <button
                            onClick={() => { setSelectedPurchaseForPay(purchase); setShowPayModal(true); }}
                            className="text-blue-600 hover:text-blue-800 font-bold text-sm underline"
                          >
                            Collect Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {purchaseRecords.length === 0 && !isLoading && (
                <div className="py-12 text-center text-gray-500">No purchase records found</div>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateVendorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createVendor}
      />
      <EditVendorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        vendor={selectedVendorForEdit}
        onUpdate={updateVendor}
      />
      <CreatePurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        vendors={vendors}
        onCreate={createPurchase}
        onSelectVendor={(vendor) => useVendorPurchaseStore.setState({ selectedVendor: vendor })}
      />
      <PayVendorModal
        purchase={selectedPurchaseForPay}
        onClose={() => { setShowPayModal(false); setSelectedPurchaseForPay(null); }}
        onSuccess={() => { fetchVendors(); fetchAllPurchases(); setSelectedPurchaseForPay(null); setShowPayModal(false); }}
      />
    </div>
  );
};

export default Vendor;