import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Eye, DollarSign, 
  Calendar, User, Phone, TrendingUp, AlertCircle,
  CheckCircle, Clock, RefreshCw,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAccountsReceivable } from '../../hooks/useAccountReceivable';
import CollectPaymentModal from '../../components/AccountReceivables/collectAccount';
import ViewReceivableModal from '../../components/AccountReceivables/viewReceivableModal'; // Add this import

const AccountsReceivablePage = () => {
  const { receivables, loading, error, fetchReceivables } = useAccountsReceivable();
  const [selectedReceivable, setSelectedReceivable] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); // Add state for view modal
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReceivables();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status, dueDate) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date();
    
    if (isOverdue) {
      return {
        text: 'Overdue',
        bg: 'bg-red-100',
        textColor: 'text-red-800',
        icon: <AlertCircle className="w-4 h-4" />
      };
    }
    
    switch (status) {
      case 'completed':
        return {
          text: 'Paid',
          bg: 'bg-green-100',
          textColor: 'text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'partially_paid':
        return {
          text: 'Unpaid',
          bg: 'bg-red-100',
          textColor: 'text-red-800',
          icon: <TrendingUp className="w-4 h-4" />
        };
      default:
        return {
          text: 'Pending',
          bg: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  // Filter receivables
  const filteredReceivables = receivables.filter(receivable => {
    const matchesSearch = receivable.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receivable.saleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'overdue') {
      return matchesSearch && receivable.dueDate && new Date(receivable.dueDate) < new Date();
    }
    return matchesSearch && receivable.status === statusFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReceivables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceivables = filteredReceivables.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalBalance = filteredReceivables.reduce((sum, r) => sum + r.balance, 0);
  const totalReceivables = filteredReceivables.length;
  const overdueCount = filteredReceivables.filter(r => 
    r.dueDate && new Date(r.dueDate) < new Date()
  ).length;

  const handleCollectPayment = (receivable) => {
    setSelectedReceivable(receivable);
    setShowPaymentModal(true);
  };

  // Add this function for viewing receivable details
  const handleViewReceivable = (receivable) => {
    setSelectedReceivable(receivable);
    setShowViewModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedReceivable(null);
    fetchReceivables(); // Refresh data
  };

  const handleViewModalClose = () => {
    setShowViewModal(false);
    setSelectedReceivable(null);
  };

  const handleExport = () => {
    const csvData = [
      ['Customer', 'Total', 'Paid', 'Balance', 'Transaction Date', 'Due Date', 'Status'],
      ...filteredReceivables.map(r => [
        r.customer,
        r.total,
        r.paid,
        r.balance,
        formatDate(r.createdAt),
        formatDate(r.dueDate),
        getStatusBadge(r.status, r.dueDate).text
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts-receivable-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounts receivable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts Receivable</h1>
            <p className="text-gray-600 mt-2">Manage outstanding customer payments</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchReceivables}
              className="p-2 hover:bg-white rounded-lg border border-gray-300"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Receivables</p>
                <p className="text-3xl font-bold text-gray-900">{totalReceivables}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer or sale #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Paid</option>
              </select>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Customer
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Transaction Date
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedReceivables.map((receivable) => {
                const statusBadge = getStatusBadge(receivable.status, receivable.dueDate);
                
                return (
                  <tr key={receivable.saleId} className="hover:bg-gray-50 transition-colors">
                    {/* Customer */}
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900">{receivable.customer}</div>
                        {receivable.customerPhone && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {receivable.customerPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Total */}
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(receivable.total)}
                      </div>
                    </td>
                    
                    {/* Paid */}
                    <td className="p-4">
                      <div className="text-green-600 font-semibold">
                        {formatCurrency(receivable.paid)}
                      </div>
                    </td>
                    
                    {/* Balance */}
                    <td className="p-4">
                      <div className={`font-bold ${
                        receivable.balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(receivable.balance)}
                      </div>
                    </td>
                    
                    {/* Transaction Date */}
                    <td className="p-4">
                      <div className="text-gray-700">
                        {formatDate(receivable.createdAt)}
                      </div>
                    </td>
                    
                    {/* Due Date */}
                    <td className="p-4">
                      <div className={`font-medium ${
                        receivable.dueDate && new Date(receivable.dueDate) < new Date()
                          ? 'text-red-600'
                          : 'text-gray-700'
                      }`}>
                        {formatDate(receivable.dueDate)}
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="p-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.textColor}`}>
                        {statusBadge.icon}
                        <span className="ml-2">{statusBadge.text}</span>
                      </div>
                    </td>
                    
                    {/* Actions - Fixed eye action and removed three dots */}
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCollectPayment(receivable)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Collect
                        </button>
                        <button
                          onClick={() => handleViewReceivable(receivable)}
                          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedReceivables.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No receivables found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try changing your search or filters'
                : 'All payments are up to date!'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReceivables.length)} of{' '}
              {filteredReceivables.length} receivables
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedReceivable && (
        <CollectPaymentModal
          receivable={selectedReceivable}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedReceivable(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* View Receivable Modal - Add this */}
      {showViewModal && selectedReceivable && (
        <ViewReceivableModal
          receivable={selectedReceivable}
          onClose={handleViewModalClose}
        />
      )}
    </div>
  );
};

export default AccountsReceivablePage;