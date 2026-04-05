import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, Edit, Trash2, Eye, Search } from 'lucide-react';
import useExpenseStore from '../../store/expensesStore';
import ExpenseForm from './ExpenseForm';
import ExpenseModal from './ExpenseModal';
import FilterModal from './FilterModal';
import ExpenseStats from './ExpenseStats';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const ExpensePage = () => {
  const {
    expenses,
    loading,
    summary,
    pagination,
    filters,
    fetchExpenses,
    deleteExpense,
    setFilters,
    clearFilters
  } = useExpenseStore();

  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ clientName: searchTerm });
  };

  const handleStatusColor = (status) => {
    switch (status) {
      case 'Fully Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTypeColor = (type) => {
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

  const handlePaymentMethodColor = (method) => {
    switch (method) {
      case 'Cash': return 'bg-green-100 text-green-800';
      case 'Zaad': return 'bg-blue-100 text-blue-800';
      case 'E-Dahab': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            onClick={() => setShowForm(true)}
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

      {/* Stats Summary */}
      <ExpenseStats summary={summary} />

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={18} />
              Filters
              {Object.values(filters).filter(v => v).length > 2 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).filter(v => v).length - 2}
                </span>
              )}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${handleTypeColor(expense.expenseType)}`}>
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${handlePaymentMethodColor(expense.paymentMethod)}`}>
                          {expense.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${handleStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setViewMode(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowForm(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-900"
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
                  onClick={() => setShowForm(true)}
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
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ExpenseForm
          expense={selectedExpense}
          onClose={() => {
            setShowForm(false);
            setSelectedExpense(null);
          }}
        />
      )}

      {viewMode && selectedExpense && (
        <ExpenseModal
          expense={selectedExpense}
          onClose={() => {
            setViewMode(false);
            setSelectedExpense(null);
          }}
        />
      )}

      {showFilters && (
        <FilterModal onClose={() => setShowFilters(false)} />
      )}
    </div>
  );
};

export default ExpensePage;