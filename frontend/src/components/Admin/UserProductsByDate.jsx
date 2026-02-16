import React, { useState, useEffect } from "react";
import useSalesStore from "../../store/UseSalesStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const GetAllUsersSalesByDate = () => {
  const { allUsersSalesByDate, fetchAllUsersSalesByDate, loading, error } = useSalesStore();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [somaliLanguage] = useState(true);
  const [activeTab, setActiveTab] = useState("table"); // 'table' or 'chart'

  // Somali translations
  const translations = {
    title: "Iibka Isticmaalayaasha Maalinta",
    selectDate: "Xulo Taariikh",
    fetchButton: "Soo Daji",
    loading: "Soo dejinaya...",
    total: "Wadarta",
    noSales: "Wax iib ah ma jiraan taariikhdan",
    user: "Isticmaale",
    role: "Doorka",
    product: "Alaabta",
    quantity: "Tiro",
    price: "Qiimo",
    amount: "Qadarta",
    salesByDate: "Iibka Maalinta",
    salesReport: "Warbixinta Iibka",
    noData: "Xog malahan oo la heli karo",
    error: "Khalad",
    viewTable: "Muuji Jadwal",
    viewChart: "Muuji Shaashad",
    overallTotal: "Wadarta Guud",
    salesData: "Xogta Iibka",
    userSales: "Iibka Isticmaalaha"
  };

  // Fetch data when component mounts with today's date
  useEffect(() => {
    fetchAllUsersSalesByDate(date);
  }, [date]);

  const handleFetch = () => {
    if (date) {
      fetchAllUsersSalesByDate(date);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate overall total
  const calculateOverallTotal = () => {
    if (!allUsersSalesByDate?.data) return 0;
    return allUsersSalesByDate.data.reduce((total, user) => total + user.total, 0);
  };

  // Prepare data for chart
  const chartData = allUsersSalesByDate?.data
    ? allUsersSalesByDate.data.map(user => ({
      name: user.username,
      sales: user.total,
      role: user.role
    }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-emerald-700">{translations.salesReport}</h1>
          <p className="text-gray-600">{translations.salesByDate}</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-200 mb-8">
          {/* Controls Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-emerald-800">
              {translations.title}
            </h2>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.selectDate}
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <button
                onClick={handleFetch}
                disabled={!date || loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center mt-2 md:mt-0"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {translations.loading}
                  </>
                ) : (
                  translations.fetchButton
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium">{translations.error}: {error}</p>
            </div>
          )}

          {/* Overall Summary */}
          {allUsersSalesByDate?.data && allUsersSalesByDate.data.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-emerald-800">{translations.overallTotal}</h3>
                <span className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(calculateOverallTotal())}
                </span>
              </div>
            </div>
          )}

          {/* View Toggle */}
          {allUsersSalesByDate?.data && allUsersSalesByDate.data.length > 0 && (
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'table' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('table')}
              >
                {translations.viewTable}
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'chart' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('chart')}
              >
                {translations.viewChart}
              </button>
            </div>
          )}

          {/* Data Display */}
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-lg text-gray-600">{translations.loading}</span>
            </div>
          ) : allUsersSalesByDate?.data && allUsersSalesByDate.data.length > 0 ? (
            <>
              {/* Chart View */}
              {activeTab === 'chart' && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{translations.salesData}</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(value), 'Sales']} />
                        <Legend />
                        <Bar dataKey="sales" name="Sales" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Table View */}
              {activeTab === 'table' && (
                <div className="space-y-6">
                  {allUsersSalesByDate.data.map((user, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 p-4 md:p-5 rounded-xl">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div>
                          <h3 className="font-semibold text-lg text-emerald-800">
                            {user.username}
                          </h3>
                          <p className="text-sm text-gray-600">{user.role}</p>
                        </div>
                        <p className="text-lg font-bold mt-2 md:mt-0">
                          {translations.total}: <span className="text-emerald-700">{formatCurrency(user.total)}</span>
                        </p>
                      </div>

                      {user.sales && user.sales.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {translations.product}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {translations.quantity}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {translations.price}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {translations.amount}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {user.sales.map((sale) => (
                                <tr key={sale.id}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {sale.product?.name}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {sale.quantity}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatCurrency(sale.sellingCost)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-700">
                                    {formatCurrency(sale.totalAmount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 py-4 text-center">{translations.noSales}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : allUsersSalesByDate?.data && allUsersSalesByDate.data.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-lg text-gray-600">{translations.noData}</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>© {new Date().getFullYear()} - {translations.salesReport}</p>
        </div>
      </div>
    </div>
  );
};

export default GetAllUsersSalesByDate;