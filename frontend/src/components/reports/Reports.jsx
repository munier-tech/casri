import React, { useState, useEffect } from 'react';
import { BarChart3, DollarSign, CreditCard, Smartphone, Coins, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../lib/axios';
import toast from 'react-hot-toast';

/**
 * Reports Component
 * Displays revenue reports with daily, monthly, and yearly views
 * Includes payment method breakdowns and product sales details
 */
const Reports = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productPage, setProductPage] = useState(1);
  
  // Constants
  const productsPerPage = 10;

  /**
   * Format currency amount to USD format
   * @param {number} amount - The amount to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  /**
   * Fetch report data based on active tab and selected date parameters
   */
  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';

      switch (activeTab) {
        case 'daily':
          endpoint = `/reports/daily-report/${selectedDate}`;
          break;
        case 'monthly':
          endpoint = `/reports/monthly-report/${selectedYear}/${selectedMonth}`;
          break;
        case 'yearly':
          endpoint = `/reports/yearly-report/${selectedYear}`;
          break;
        default:
          endpoint = `/reports/daily-report/${selectedDate}`;
      }

      const response = await axiosInstance.get(endpoint);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch report when filters change
  useEffect(() => {
    fetchReport();
  }, [activeTab, selectedDate, selectedMonth, selectedYear]);

  // Reset pagination when product data changes
  useEffect(() => {
    setProductPage(1);
  }, [reportData?.productRevenue]);

  /**
   * Payment Method Card Component
   */
  const PaymentMethodCard = ({ method, amount, icon: Icon, bgGradient, textColor, iconBg }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgGradient} rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${iconBg} shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{method}</p>
            <p className={`text-2xl font-bold ${textColor} mt-1`}>{formatCurrency(amount)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  /**
   * Summary Card Component
   */
  const SummaryCard = ({ title, value, icon: Icon, bgGradient, textColor, iconBg, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgGradient} rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
          {subtitle && <p className="mt-2 text-xs text-gray-600 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${iconBg} shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  // Get period label for display
  const periodLabel = activeTab === 'daily'
    ? selectedDate
    : activeTab === 'monthly'
      ? new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
      : `${selectedYear}`;

  // Calculate average sale value
  const averageSale = reportData?.totals?.totalSales
    ? reportData.totals.totalRevenue / reportData.totals.totalSales
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-6 md:px-8 lg:px-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex p-3 flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-red-700">
                Revenue Reports
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                View and analyze daily, monthly, and yearly revenue with detailed breakdowns
              </p>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchReport}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
            >
              <RefreshCw className={`${loading ? 'animate-spin' : ''} h-4 w-4`} />
              Refresh Data
            </button>
          </div>

          {/* Filter Controls */}
          <div className="mt-6 rounded-2xl bg-gray-50 shadow-xl p-5 border border-gray-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Tab Buttons */}
              <div className="flex flex-wrap gap-2 rounded-full bg-gray-100 p-1.5">
                {['daily', 'monthly', 'yearly'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
                      activeTab === tab 
                        ? 'bg-red-700 text-white shadow-md' 
                        : 'text-gray-700 hover:text-red-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {activeTab === 'daily' && (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 placeholder:text-gray-400"
                  />
                )}

                {(activeTab === 'monthly' || activeTab === 'yearly') && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {new Date(0, index).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                >
                  {Array.from({ length: 5 }, (_, index) => {
                    const year = new Date().getFullYear() - index;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="rounded-2xl bg-gray-50 p-16 text-center shadow-xl border border-gray-200">
            <RefreshCw className="mx-auto h-16 w-16 animate-spin text-red-600" />
            <p className="mt-6 text-gray-600 text-lg font-medium">Loading report data...</p>
          </div>
        ) : reportData ? (
          <>
            {/* Summary Cards Grid - Each with unique color */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Total Revenue"
                value={formatCurrency(reportData.totals?.totalRevenue)}
                icon={DollarSign}
                bgGradient="bg-gradient-to-br from-emerald-50 to-green-50"
                textColor="text-emerald-700"
                iconBg="bg-gradient-to-br from-emerald-600 to-green-700"
                subtitle="Total sales revenue"
              />
              <SummaryCard
                title="Collected Amount"
                value={formatCurrency(reportData.totals?.totalPaid)}
                icon={CreditCard}
                bgGradient="bg-gradient-to-br from-blue-50 to-indigo-50"
                textColor="text-blue-700"
                iconBg="bg-gradient-to-br from-blue-600 to-indigo-700"
                subtitle="Total payments collected"
              />
              <SummaryCard
                title="Outstanding Balance"
                value={formatCurrency(reportData.totals?.totalDue)}
                icon={CreditCard}
                bgGradient="bg-gradient-to-br from-amber-50 to-orange-50"
                textColor="text-amber-700"
                iconBg="bg-gradient-to-br from-amber-600 to-orange-700"
                subtitle="Remaining due balance"
              />
              <SummaryCard
                title="Products Sold"
                value={reportData.totals?.totalProductsSold || 0}
                icon={BarChart3}
                bgGradient="bg-gradient-to-br from-violet-50 to-purple-50"
                textColor="text-violet-700"
                iconBg="bg-gradient-to-br from-violet-600 to-purple-700"
                subtitle="Total quantity sold"
              />
            </div>

            {/* Payment Methods Breakdown - Each with unique color */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <PaymentMethodCard
                method="Cash"
                amount={reportData.paymentMethodBreakdown?.cash}
                icon={Coins}
                bgGradient="bg-gradient-to-br from-emerald-50 to-teal-50"
                textColor="text-emerald-700"
                iconBg="bg-gradient-to-br from-emerald-600 to-teal-700"
              />
              <PaymentMethodCard
                method="Zaad"
                amount={reportData.paymentMethodBreakdown?.zaad}
                icon={Smartphone}
                bgGradient="bg-gradient-to-br from-sky-50 to-blue-50"
                textColor="text-sky-700"
                iconBg="bg-gradient-to-br from-sky-600 to-blue-700"
              />
              <PaymentMethodCard
                method="Edahab"
                amount={reportData.paymentMethodBreakdown?.edahab}
                icon={CreditCard}
                bgGradient="bg-gradient-to-br from-fuchsia-50 to-pink-50"
                textColor="text-fuchsia-700"
                iconBg="bg-gradient-to-br from-fuchsia-600 to-pink-700"
              />
              <PaymentMethodCard
                method="Credit"
                amount={reportData.paymentMethodBreakdown?.credit}
                icon={CreditCard}
                bgGradient="bg-gradient-to-br from-orange-50 to-red-50"
                textColor="text-orange-700"
                iconBg="bg-gradient-to-br from-orange-600 to-red-700"
              />
            </div>

            {/* Report Overview Section */}
            {reportData.totals && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-10 overflow-hidden rounded-2xl bg-gray-50 shadow-xl border border-gray-200"
              >
                <div className="border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-gray-100 to-transparent">
                  <h2 className="text-2xl font-bold text-gray-900">Report Overview</h2>
                  <p className="mt-1 text-gray-600">Key metrics for the selected reporting period</p>
                </div>
                
                <div className="grid gap-6 p-6 md:grid-cols-3">
                  <SummaryCard
                    title="Reporting Period"
                    value={periodLabel}
                    icon={BarChart3}
                    bgGradient="bg-gradient-to-br from-gray-50 to-slate-50"
                    textColor="text-gray-800"
                    iconBg="bg-gradient-to-br from-gray-600 to-slate-700"
                    subtitle="Selected reporting window"
                  />
                  <SummaryCard
                    title="Total Sales"
                    value={reportData.sales?.length || 0}
                    icon={CreditCard}
                    bgGradient="bg-gradient-to-br from-cyan-50 to-blue-50"
                    textColor="text-cyan-700"
                    iconBg="bg-gradient-to-br from-cyan-600 to-blue-700"
                    subtitle="Number of sales records"
                  />
                  <SummaryCard
                    title="Average Sale Value"
                    value={formatCurrency(averageSale)}
                    icon={DollarSign}
                    bgGradient="bg-gradient-to-br from-emerald-50 to-green-50"
                    textColor="text-emerald-700"
                    iconBg="bg-gradient-to-br from-emerald-600 to-green-700"
                    subtitle="Average sale amount"
                  />
                </div>
              </motion.section>
            )}

            {/* Products Sold Table */}
            {reportData.productRevenue && reportData.productRevenue.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-10 overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-200"
              >
                <div className="border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-gray-50 to-transparent">
                  <h2 className="text-2xl font-bold text-gray-900">Products Sold</h2>
                  <p className="mt-1 text-gray-600">Complete list of sold products for the selected period</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity Sold</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Unit Price</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {reportData.productRevenue
                        .slice((productPage - 1) * productsPerPage, productPage * productsPerPage)
                        .map((product, idx) => (
                          <tr key={`${product.productId || product.productName}-${idx}`} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">{product.productName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 font-medium">{product.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{formatCurrency(product.unitPrice)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-emerald-600">{formatCurrency(product.revenue)}</div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex flex-col gap-3 items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50 sm:flex-row">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">
                      {Math.min((productPage - 1) * productsPerPage + 1, reportData.productRevenue.length)}
                    </span>
                    {' '}to{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min(productPage * productsPerPage, reportData.productRevenue.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-semibold text-gray-900">{reportData.productRevenue.length}</span>
                    {' '}products
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setProductPage((prev) => Math.max(prev - 1, 1))}
                      disabled={productPage === 1}
                      className="rounded-full bg-white border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-semibold text-gray-700">
                      Page {productPage} of {Math.max(1, Math.ceil(reportData.productRevenue.length / productsPerPage))}
                    </span>
                    <button
                      onClick={() => setProductPage((prev) => Math.min(prev + 1, Math.ceil(reportData.productRevenue.length / productsPerPage)))}
                      disabled={productPage >= Math.ceil(reportData.productRevenue.length / productsPerPage)}
                      className="rounded-full bg-white border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Yearly Monthly Breakdown */}
            {activeTab === 'yearly' && reportData.monthlyBreakdown?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl border border-gray-200"
              >
                <div className="border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-white to-transparent">
                  <h2 className="text-2xl font-bold text-gray-900">Monthly Breakdown</h2>
                  <p className="mt-1 text-gray-600">Revenue totals for each month in {selectedYear}</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Month</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sales Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {reportData.monthlyBreakdown.map((month, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{month.monthName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-emerald-600">{formatCurrency(month.revenue)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 font-medium">{month.salesCount}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            )}
          </>
        ) : (
          // Empty State
          <div className="rounded-2xl bg-gray-50 p-16 text-center shadow-xl border border-gray-200">
            <BarChart3 className="mx-auto h-20 w-20 text-gray-400" />
            <h3 className="mt-6 text-2xl font-bold text-gray-900">No Report Data Available</h3>
            <p className="mt-3 text-gray-600 text-lg">Select a different date period or refresh to load data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;