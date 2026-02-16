import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, DollarSign, TrendingUp, CreditCard, AlertCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import useExpenseStore from '../../store/expensesStore';

// Constants
const expenseTypes = [
  'Rent',
  'Electricity',
  'Salaries and Wages',
  'Security / Guard',
  'Repairs and Maintenance',
  'Mobile Money',
  'Bank Charge Fees',
  'Marketing and Branding',
  'Taxes',
  'Internet',
  'Water',
  'Others'
];

const paymentMethods = ['Cash', 'Zaad', 'E-Dahab'];

const ExpensesPage = () => {
  // Get store state and actions
  const {
    expenses,
    loading,
    summary,
    pagination,
    filters,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    setFilters,
    setPage,
    clearFilters
  } = useExpenseStore();

  // Local state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '+252',
    amountDue: '',
    amountPaid: '',
    expenseType: 'Security / Guard',
    paymentMethod: 'Cash',
    description: '',
    dueDate: ''
  });
  const [errors, setErrors] = useState({});

  // Defensive date formatter
  const formatDateSafe = (dateString, formatStr = 'MMM dd, yyyy') => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, formatStr);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ clientName: searchTerm });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const expenseData = {
        ...formData,
        amountDue: parseFloat(formData.amountDue),
        amountPaid: parseFloat(formData.amountPaid)
      };

      if (selectedExpense) {
        await updateExpense(selectedExpense.id, expenseData);
      } else {
        await createExpense(expenseData);
      }

      setShowFormModal(false);
      resetForm();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.clientPhone.trim()) newErrors.clientPhone = 'Client phone is required';
    if (!formData.amountDue) newErrors.amountDue = 'Amount due is required';
    if (!formData.amountPaid) newErrors.amountPaid = 'Amount paid is required';
    if (parseFloat(formData.amountPaid) > parseFloat(formData.amountDue)) {
      newErrors.amountPaid = 'Amount paid cannot exceed amount due';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '+252',
      amountDue: '',
      amountPaid: '',
      expenseType: 'Security / Guard',
      paymentMethod: 'Cash',
      description: '',
      dueDate: ''
    });
    setSelectedExpense(null);
    setErrors({});
  };

  // Open edit modal
  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      clientName: expense.clientName,
      clientPhone: expense.clientPhone,
      amountDue: expense.amountDue,
      amountPaid: expense.amountPaid,
      expenseType: expense.expenseType,
      paymentMethod: expense.paymentMethod,
      description: expense.description || '',
      dueDate: expense.dueDate ? new Date(expense.dueDate).toISOString().split('T')[0] : ''
    });
    setShowFormModal(true);
  };

  // Open view modal
  const openViewModal = async (expense) => {
    try {
      const fullExpense = await getExpenseById(expense.id);
      setSelectedExpense(fullExpense);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching expense details:', error);
    }
  };

  // Handle phone change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (!value.startsWith('+252')) {
      setFormData({ ...formData, clientPhone: '+252' + value.replace(/^\+252/, '') });
    } else {
      setFormData({ ...formData, clientPhone: value });
    }
  };

  // Calculate balance
  const calculateBalance = () => {
    const due = parseFloat(formData.amountDue) || 0;
    const paid = parseFloat(formData.amountPaid) || 0;
    return due - paid;
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'Fully Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Type color helper
  const getTypeColor = (type) => {
    const colors = {
      'Rent': 'bg-purple-100 text-purple-800',
      'Electricity': 'bg-blue-100 text-blue-800',
      'Salaries and Wages': 'bg-green-100 text-green-800',
      'Security / Guard': 'bg-red-100 text-red-800',
      'Repairs and Maintenance': 'bg-yellow-100 text-yellow-800',
      'Mobile Money': 'bg-teal-100 text-teal-800',
      'Bank Charge Fees': 'bg-indigo-100 text-indigo-800',
      'Marketing and Branding': 'bg-pink-100 text-pink-800',
      'Taxes': 'bg-gray-100 text-gray-800',
      'Internet': 'bg-cyan-100 text-cyan-800',
      'Water': 'bg-sky-100 text-sky-800',
      'Others': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Payment method color helper
  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'Cash': return 'bg-green-100 text-green-800';
      case 'Zaad': return 'bg-blue-100 text-blue-800';
      case 'E-Dahab': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats cards data
  const statsCards = summary ? [
    {
      title: 'Total Amount Due',
      value: `$${summary.totalAmountDue?.toLocaleString() || '0'}`,
      icon: <DollarSign className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Total Amount Paid',
      value: `$${summary.totalAmountPaid?.toLocaleString() || '0'}`,
      icon: <TrendingUp className="text-green-600" size={24} />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Total Balance',
      value: `$${summary.totalBalance?.toLocaleString() || '0'}`,
      icon: <CreditCard className="text-purple-600" size={24} />,
      bgColor: 'bg-purple-50',
      textColor: summary.totalBalance > 0 ? 'text-red-700' : 'text-purple-700'
    },
    {
      title: 'Total Records',
      value: summary.count?.toLocaleString() || '0',
      icon: <AlertCircle className="text-orange-600" size={24} />,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Expense Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all your expenses</p>
          </div>
          <button
            onClick={() => setShowFormModal(true)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Add New Expense
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-2`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor.replace('50', '100')}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {/* Implement filter modal */ }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={18} />
              Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading expenses...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{expense.clientName}</div>
                          <div className="text-sm text-gray-500">{expense.clientPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(expense.expenseType)}`}>
                          {expense.expenseType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${expense.amountDue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        ${expense.amountPaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${expense.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${expense.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(expense.paymentMethod)}`}>
                          {expense.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateSafe(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(expense)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(expense)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {expenses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first expense record.</p>
                <button
                  onClick={() => setShowFormModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Add New Expense
                </button>
              </div>
            )}

            {/* Pagination */}
            {expenses.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.currentPage - 1) * filters.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * filters.limit, pagination.total)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Expense Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className={`w-full px-3 py-2 border ${errors.clientName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter client name"
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                  )}
                </div>

                {/* Client Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">+252</div>
                    <input
                      type="text"
                      value={formData.clientPhone.replace('+252', '')}
                      onChange={handlePhoneChange}
                      className={`w-full pl-14 pr-3 py-2 border ${errors.clientPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="63xxxxxx"
                    />
                  </div>
                  {errors.clientPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientPhone}</p>
                  )}
                </div>

                {/* Amount Due */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Due <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amountDue}
                      onChange={(e) => setFormData({ ...formData, amountDue: e.target.value })}
                      className={`w-full pl-8 pr-3 py-2 border ${errors.amountDue ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter amount due"
                    />
                  </div>
                  {errors.amountDue && (
                    <p className="mt-1 text-sm text-red-600">{errors.amountDue}</p>
                  )}
                </div>

                {/* Amount Paid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amountPaid}
                      onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                      className={`w-full pl-8 pr-3 py-2 border ${errors.amountPaid ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter amount paid"
                    />
                  </div>
                  {errors.amountPaid && (
                    <p className="mt-1 text-sm text-red-600">{errors.amountPaid}</p>
                  )}
                  {formData.amountDue && formData.amountPaid && (
                    <p className="mt-2 text-sm">
                      Balance: <span className={`font-semibold ${calculateBalance() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${calculateBalance().toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>

                {/* Expense Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.expenseType}
                    onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {expenseTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter description"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {selectedExpense ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {selectedExpense ? 'Update Expense' : 'Create Expense'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Expense Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Client Name</h3>
                  <p className="text-gray-900 font-medium">{selectedExpense.clientName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Client Phone</h3>
                  <p className="text-gray-900 font-medium">{selectedExpense.clientPhone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Amount Due</h3>
                  <p className="text-gray-900 font-medium text-xl">${selectedExpense.amountDue.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Amount Paid</h3>
                  <p className="text-green-600 font-medium text-xl">${selectedExpense.amountPaid.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Balance</h3>
                  <p className={`font-medium text-xl ${selectedExpense.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${selectedExpense.balance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Expense Type</h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedExpense.expenseType)}`}>
                    {selectedExpense.expenseType}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentMethodColor(selectedExpense.paymentMethod)}`}>
                    {selectedExpense.paymentMethod}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedExpense.status)}`}>
                    {selectedExpense.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created Date</h3>
                  <p className="text-gray-900">{formatDateSafe(selectedExpense.date, 'MMM dd, yyyy HH:mm')}</p>
                </div>
                {selectedExpense.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                    <p className="text-gray-900">{formatDateSafe(selectedExpense.dueDate)}</p>
                  </div>
                )}
                {selectedExpense.description && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedExpense.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;