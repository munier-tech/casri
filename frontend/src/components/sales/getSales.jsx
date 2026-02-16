import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Search,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  RefreshCw,
  Printer,
  Download,
  Edit,
  Trash2,
  Eye,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import useSalesStore from '../../store/UseSalesStore';

const GetSales = () => {
  const {
    salesByDate,
    dailySummary,
    currentSale,
    loading,
    fetchingSales,
    fetchingSummary,
    error,
    fetchDailySales,
    fetchSalesByDate,
    fetchDailySummary,
    fetchSaleById,
    updateSale,
    deleteSale,
    clearError,
    clearCurrentSale
  } = useSalesStore();

  // State
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState('today'); // 'today', 'custom', 'details'
  const [dateInput, setDateInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSale, setEditingSale] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [saleDetails, setSaleDetails] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editForm, setEditForm] = useState({
    discountPercentage: 0,
    discountAmount: 0,
    paymentMethod: 'cash',
    amountPaid: 0,
    notes: '',
    status: 'completed'
  });
  const [deletingSaleId, setDeletingSaleId] = useState(null);

  // Initialize with today's sales
  useEffect(() => {
    loadTodaySales();
  }, []);

  // Filter and paginate sales
  const filteredSales = useMemo(() => {
    if (!salesByDate || salesByDate.length === 0) return [];

    let filtered = [...salesByDate];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.saleNumber?.toLowerCase().includes(query) ||
        sale.customerName?.toLowerCase().includes(query) ||
        sale.products?.some(p =>
          p.name?.toLowerCase().includes(query) ||
          p.product?.name?.toLowerCase().includes(query)
        )
      );
    }

    // Filter by payment method - FIXED FOR ZAAD & EDAHAB
    if (selectedPaymentMethod !== 'all') {
      filtered = filtered.filter(sale =>
        sale.paymentMethod === selectedPaymentMethod
      );
    }

    return filtered;
  }, [salesByDate, searchQuery, selectedPaymentMethod]);

  // Pagination
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSales, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  // Load today's sales
  const loadTodaySales = async () => {
    clearError();
    await fetchDailySales();
    await fetchDailySummary();
    setViewMode('today');
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setCurrentPage(1);
    clearCurrentSale();
  };

  // Load sales by specific date
  const loadSalesByDate = async (date) => {
    if (!date) return;

    clearError();
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    setViewMode('custom');

    await fetchSalesByDate(formattedDate);
    setCurrentPage(1);
    clearCurrentSale();
  };

  // Handle date search
  const handleDateSearch = (e) => {
    e.preventDefault();
    if (dateInput) {
      loadSalesByDate(dateInput);
    }
  };

  // Quick date navigation
  const navigateDate = (direction) => {
    const current = new Date(selectedDate);
    const newDate = new Date(current);

    if (direction === 'prev') {
      newDate.setDate(current.getDate() - 1);
    } else {
      newDate.setDate(current.getDate() + 1);
    }

    const formattedDate = format(newDate, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    loadSalesByDate(formattedDate);
  };

  // View sale details
  const handleViewSale = async (saleId) => {
    clearError();
    setSelectedSaleId(saleId);
    setViewMode('details');

    try {
      await fetchSaleById(saleId);
      setSaleDetails(currentSale);
    } catch (err) {
      console.error('Failed to fetch sale details:', err);
    }
  };

  // Start editing sale
  const handleEditSale = (sale) => {
    setEditingSale(sale);
    setEditForm({
      discountPercentage: sale.discountPercentage || 0,
      discountAmount: sale.discountAmount || 0,
      paymentMethod: sale.paymentMethod || 'cash',
      amountPaid: sale.amountPaid || 0,
      notes: sale.notes || '',
      status: sale.status || 'completed'
    });
  };

  // Update sale
  const handleUpdateSale = async () => {
    if (!editingSale) return;

    try {
      await updateSale(editingSale.id, editForm);
      setEditingSale(null);

      // Refresh the sales list
      if (viewMode === 'today') {
        await loadTodaySales();
      } else {
        await loadSalesByDate(selectedDate);
      }

      alert('Sale updated successfully!');
    } catch (err) {
      alert('Failed to update sale: ' + (err.response?.data?.error || err.message));
    }
  };

  // FIXED: Delete sale with proper UI feedback
  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      return;
    }

    setDeletingSaleId(saleId);

    try {
      await deleteSale(saleId);

      // Refresh the sales list
      if (viewMode === 'today') {
        await loadTodaySales();
      } else {
        await loadSalesByDate(selectedDate);
      }

      alert('Sale deleted successfully!');
    } catch (err) {
      alert('Failed to delete sale: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingSaleId(null);
    }
  };

  // Calculate summary for displayed sales
  const calculatedSummary = useMemo(() => {
    if (salesByDate.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalItems: 0,
        totalDiscount: 0,
        averageSale: 0
      };
    }

    const summary = salesByDate.reduce((acc, sale) => {
      acc.totalRevenue += sale.grandTotal || 0;
      acc.totalItems += sale.totalQuantity || 0;
      acc.totalDiscount += sale.discountAmount || 0;
      return acc;
    }, {
      totalSales: salesByDate.length,
      totalRevenue: 0,
      totalItems: 0,
      totalDiscount: 0
    });

    summary.averageSale = summary.totalSales > 0
      ? summary.totalRevenue / summary.totalSales
      : 0;

    return summary;
  }, [salesByDate]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy hh:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  // Quick date buttons
  const quickDateOptions = [
    { label: 'Today', date: new Date() },
    { label: 'Yesterday', date: subDays(new Date(), 1) },
    { label: '3 Days Ago', date: subDays(new Date(), 3) },
    { label: '7 Days Ago', date: subDays(new Date(), 7) }
  ];

  // Get payment method display name - FIXED FOR ZAAD & EDAHAB
  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'zaad': return 'Zaad';
      case 'edahab': return 'Edahab';
      default: return method || 'Cash';
    }
  };

  // Get payment method badge color - FIXED FOR ZAAD & EDAHAB
  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'zaad': return 'bg-blue-100 text-blue-800';
      case 'edahab': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sales Management</h1>
        <p className="text-gray-600 mt-2">View, manage, and analyze your sales data</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Date Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              title="Previous day"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {viewMode === 'today' ? 'Today\'s Sales' : `Sales for ${formatDate(selectedDate)}`}
              </div>
              <div className="text-sm text-gray-500">
                {selectedDate === format(new Date(), 'yyyy-MM-dd')
                  ? 'Showing today\'s sales'
                  : `Showing sales for ${format(parseISO(selectedDate), 'MMMM do, yyyy')}`
                }
              </div>
            </div>

            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              title="Next day"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Date Buttons */}
          <div className="flex flex-wrap gap-2">
            {quickDateOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => loadSalesByDate(option.date)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDate === format(option.date, 'yyyy-MM-dd')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Date Search */}
          <form onSubmit={handleDateSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Select date"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Go
            </button>
          </form>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by sale number, customer, or product..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* FIXED: Payment Method Filter for Zaad & Edahab */}
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="zaad">Zaad</option>
            <option value="edahab">Edahab</option>
          </select>

          <button
            onClick={loadTodaySales}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {calculatedSummary.totalSales}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(calculatedSummary.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Sold</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {calculatedSummary.totalItems}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Sale Value</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(calculatedSummary.averageSale)}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Sales List</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredSales.length} sale{filteredSales.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {fetchingSales ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
            <p className="mt-2 text-gray-600">Loading sales data...</p>
          </div>
        ) : paginatedSales.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No sales found for this date</p>
            <button
              onClick={loadTodaySales}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Today's Sales
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sale #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          {sale.saleNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(sale.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sale.customerName || 'Walk-in Customer'}
                        </div>
                        {sale.customerPhone && (
                          <div className="text-xs text-gray-500">
                            {sale.customerPhone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sale.products?.length || 0} items
                        </div>
                        <div className="text-xs text-gray-500">
                          {sale.totalQuantity || 0} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(sale.grandTotal || 0)}
                        </div>
                        {sale.discountAmount > 0 && (
                          <div className="text-xs text-red-500">
                            -{formatCurrency(sale.discountAmount)}
                          </div>
                        )}
                      </td>
                      {/* FIXED: Payment Method Badge for Zaad & Edahab */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPaymentMethodColor(sale.paymentMethod)}`}>
                          {getPaymentMethodDisplay(sale.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${sale.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : sale.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {sale.status?.toUpperCase() || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewSale(sale.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditSale(sale)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            title="Edit Sale"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            disabled={deletingSaleId === sale.id}
                            className={`p-1 rounded hover:bg-red-50 ${deletingSaleId === sale.id
                              ? 'text-red-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900'
                              }`}
                            title="Delete Sale"
                          >
                            {deletingSaleId === sale.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredSales.length)} of{' '}
                  {filteredSales.length} sales
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg border ${currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-lg border ${currentPage === i + 1
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg border ${currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Sale Modal - FIXED: Payment Method Options */}
      {editingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Sale: {editingSale.saleNumber}
              </h3>
              <button
                onClick={() => setEditingSale(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.discountPercentage}
                  onChange={(e) => setEditForm({ ...editForm, discountPercentage: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.discountAmount}
                  onChange={(e) => setEditForm({ ...editForm, discountAmount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="zaad">Zaad</option>
                  <option value="edahab">Edahab</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.amountPaid}
                  onChange={(e) => setEditForm({ ...editForm, amountPaid: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingSale(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSale}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Update Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Details Modal */}
      {viewMode === 'details' && saleDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">
                Sale Details: {saleDetails.saleNumber}
              </h3>
              <button
                onClick={() => setViewMode(selectedDate === format(new Date(), 'yyyy-MM-dd') ? 'today' : 'custom')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Sale Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Sale Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(saleDetails.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{saleDetails.customerName || 'Walk-in'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{getPaymentMethodDisplay(saleDetails.paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${saleDetails.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                        {saleDetails.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Financial Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(saleDetails.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(saleDetails.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-600 font-semibold">Grand Total:</span>
                      <span className="font-bold text-lg">{formatCurrency(saleDetails.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium">{formatCurrency(saleDetails.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Change:</span>
                      <span className="font-medium">{formatCurrency(saleDetails.changeAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Products Sold</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {saleDetails.products?.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{product.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatCurrency(product.sellingPrice)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {product.discount}%
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(product.itemNet)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {saleDetails.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{saleDetails.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setViewMode(selectedDate === format(new Date(), 'yyyy-MM-dd') ? 'today' : 'custom')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </button>
          <button
            onClick={() => alert('Export functionality coming soon!')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetSales;