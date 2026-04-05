import React, { useState, useEffect } from 'react';
import { BarChart3, DollarSign, CreditCard, Smartphone, Coins, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../lib/axios';
import toast from 'react-hot-toast';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 10;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

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

  useEffect(() => {
    fetchReport();
  }, [activeTab, selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    setProductPage(1);
  }, [reportData?.productRevenue]);

  const PaymentMethodCard = ({ method, amount, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 capitalize">{method}</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const SummaryCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const periodLabel = activeTab === 'daily'
    ? selectedDate
    : activeTab === 'monthly'
      ? new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
      : `${selectedYear}`;

  const averageSale = reportData?.totals?.totalSales
    ? reportData.totals.totalRevenue / reportData.totals.totalSales
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Revenue Reports</h1>
              <p className="mt-2 text-slate-600">View daily, monthly, and yearly revenue with payment method breakdowns.</p>
            </div>
            <button
              onClick={fetchReport}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
            >
              <RefreshCw className={`${loading ? 'animate-spin' : ''} h-4 w-4`} />
              Refresh
            </button>
          </div>

          <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2 rounded-3xl bg-slate-100 p-2">
                {['daily', 'monthly', 'yearly'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {activeTab === 'daily' && (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-3xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500"
                  />
                )}

                {(activeTab === 'monthly' || activeTab === 'yearly') && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="rounded-3xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500"
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
                  className="rounded-3xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500"
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

        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-slate-200">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-sky-600" />
            <p className="mt-4 text-slate-600">Loading report data...</p>
          </div>
        ) : reportData ? (
          <>
            <div className="grid gap-6 xl:grid-cols-4">
              <SummaryCard
                title="Revenue"
                value={formatCurrency(reportData.totals?.totalRevenue)}
                icon={DollarSign}
                color="bg-emerald-500"
                subtitle="Total sales revenue"
              />
              <SummaryCard
                title="Collected"
                value={formatCurrency(reportData.totals?.totalPaid)}
                icon={CreditCard}
                color="bg-sky-500"
                subtitle="Total collected payments"
              />
              <SummaryCard
                title="Outstanding"
                value={formatCurrency(reportData.totals?.totalDue)}
                icon={CreditCard}
                color="bg-amber-500"
                subtitle="Remaining due balance"
              />
              <SummaryCard
                title="Products Sold"
                value={reportData.totals?.totalProductsSold || 0}
                icon={BarChart3}
                color="bg-violet-500"
                subtitle="Total quantity sold"
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-4">
              <PaymentMethodCard
                method="Cash"
                amount={reportData.paymentMethodBreakdown?.cash}
                icon={Coins}
                color="bg-emerald-500"
              />
              <PaymentMethodCard
                method="Zaad"
                amount={reportData.paymentMethodBreakdown?.zaad}
                icon={Smartphone}
                color="bg-sky-500"
              />
              <PaymentMethodCard
                method="Edahab"
                amount={reportData.paymentMethodBreakdown?.edahab}
                icon={CreditCard}
                color="bg-violet-500"
              />
              <PaymentMethodCard
                method="Credit"
                amount={reportData.paymentMethodBreakdown?.credit}
                icon={CreditCard}
                color="bg-orange-500"
              />
            </div>

            {reportData.totals && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200"
              >
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="text-xl font-semibold text-slate-900">Report Overview</h2>
                  <p className="mt-1 text-sm text-slate-500">Key metrics for the selected reporting period.</p>
                </div>
                <div className="grid gap-6 p-6 md:grid-cols-3">
                  <SummaryCard
                    title="Period"
                    value={periodLabel}
                    icon={BarChart3}
                    color="bg-slate-500"
                    subtitle="Selected reporting window"
                  />
                  <SummaryCard
                    title="Sales Count"
                    value={reportData.sales?.length || 0}
                    icon={CreditCard}
                    color="bg-sky-500"
                    subtitle="Number of sales records"
                  />
                  <SummaryCard
                    title="Average Sale"
                    value={formatCurrency(averageSale)}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    subtitle="Average sale value"
                  />
                </div>
                <div className="grid gap-6 p-6 md:grid-cols-2">
                  <SummaryCard
                    title="Total Revenue"
                    value={formatCurrency(reportData.totals?.totalRevenue)}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    subtitle="Revenue for selected period"
                  />
                  <SummaryCard
                    title="Total Due"
                    value={formatCurrency(reportData.totals?.totalDue)}
                    icon={CreditCard}
                    color="bg-amber-500"
                    subtitle="Unpaid balance"
                  />
                </div>

                {reportData.productRevenue && reportData.productRevenue.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200"
                  >
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h2 className="text-xl font-semibold text-slate-900">Products Sold</h2>
                      <p className="mt-1 text-sm text-slate-500">Browse the complete sold products list for the selected period.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                          <tr>
                            <th className="px-5 py-4">Product</th>
                            <th className="px-5 py-4">Qty Sold</th>
                            <th className="px-5 py-4">Unit Price</th>
                            <th className="px-5 py-4">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {reportData.productRevenue
                            .slice((productPage - 1) * productsPerPage, productPage * productsPerPage)
                            .map((product) => (
                              <tr key={`${product.productId || product.productName}-${product.unitPrice}`} className="hover:bg-slate-50">
                                <td className="px-5 py-4 font-medium text-slate-900">{product.productName}</td>
                                <td className="px-5 py-4">{product.quantity}</td>
                                <td className="px-5 py-4">{formatCurrency(product.unitPrice)}</td>
                                <td className="px-5 py-4">{formatCurrency(product.revenue)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-col gap-3 items-center justify-between border-t border-slate-200 px-6 py-4 sm:flex-row">
                      <p className="text-sm text-slate-500">
                        Showing <span className="font-semibold text-slate-900">{Math.min((productPage - 1) * productsPerPage + 1, reportData.productRevenue.length)}</span>
                        {' '}to{' '}
                        <span className="font-semibold text-slate-900">{Math.min(productPage * productsPerPage, reportData.productRevenue.length)}</span>
                        {' '}of{' '}
                        <span className="font-semibold text-slate-900">{reportData.productRevenue.length}</span>
                        {' '}products
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProductPage((prev) => Math.max(prev - 1, 1))}
                          disabled={productPage === 1}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-slate-600">Page {productPage} of {Math.max(1, Math.ceil(reportData.productRevenue.length / productsPerPage))}</span>
                        <button
                          onClick={() => setProductPage((prev) => Math.min(prev + 1, Math.ceil(reportData.productRevenue.length / productsPerPage)))}
                          disabled={productPage >= Math.ceil(reportData.productRevenue.length / productsPerPage)}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </motion.section>
                )}
              </motion.section>
            )}

            {activeTab === 'yearly' && reportData.monthlyBreakdown?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200"
              >
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="text-xl font-semibold text-slate-900">Yearly Monthly Breakdown</h2>
                  <p className="mt-1 text-sm text-slate-500">Revenue totals for each month.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Month</th>
                        <th className="px-5 py-4">Revenue</th>
                        <th className="px-5 py-4">Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {reportData.monthlyBreakdown.map((month) => (
                        <tr key={month.month} className="hover:bg-slate-50">
                          <td className="px-5 py-4 font-semibold text-slate-900">{month.monthName}</td>
                          <td className="px-5 py-4">{formatCurrency(month.revenue)}</td>
                          <td className="px-5 py-4">{month.salesCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            )}
          </>
        ) : (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-slate-200">
            <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-xl font-semibold text-slate-900">No report data available</h3>
            <p className="mt-2 text-slate-500">Choose a different date or refresh to load data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
