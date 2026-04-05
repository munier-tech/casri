import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import useYearlyStore from '../../store/useYearlyReport';
import { Loader, Loader2 } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const GetYearlyReport = () => {
  const {
    yearlyReport,
    loading,
    error,
    selectedYear,
    fetchYearlyReport,
    setSelectedYear,
    clearError
  } = useYearlyStore();

  const [yearInput, setYearInput] = useState(selectedYear.toString());
  const [customYear, setCustomYear] = useState(selectedYear);

  // Generate years from 2020 to current year + 1
  const currentYear = new Date().getFullYear();
  const startYear = 2020; // You can change this to your business start year
  const years = Array.from({ length: currentYear - startYear + 2 }, (_, i) => startYear + i);

  useEffect(() => {
    fetchYearlyReport(selectedYear);
  }, [selectedYear, fetchYearlyReport]); // Fixed the typo here

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setYearInput(year.toString());
    setCustomYear(year);
  };

  const handleCustomYearSubmit = (e) => {
    e.preventDefault();
    const year = parseInt(yearInput);
    if (year >= startYear && year <= currentYear + 1) {
      setSelectedYear(year);
      setCustomYear(year);
    } else {
      alert(`Please enter a year between ${startYear} and ${currentYear + 1}`);
    }
  };

  const handleCustomYearChange = (e) => {
    setYearInput(e.target.value);
  };

  // Chart data for monthly sales
  const monthlyChartData = {
    labels: yearlyReport?.monthlyBreakdown.map(month => month.monthNameSomali) || [],
    datasets: [
      {
        label: 'Total Sales ($)',
        data: yearlyReport?.monthlyBreakdown.map(month => month.totalSales) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
      {
        label: 'Number of Sales',
        data: yearlyReport?.monthlyBreakdown.map(month => month.salesCount) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        type: 'line',
        yAxisID: 'y1',
      }
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Monthly Sales Breakdown - ${selectedYear}`
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Sales ($)'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Number of Sales'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Top products chart data
  const topProductsChartData = {
    labels: yearlyReport?.topProducts.map(product => product.product?.name || 'Unknown Product') || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: yearlyReport?.topProducts.map(product => product.totalRevenue) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Quantity Sold',
        data: yearlyReport?.topProducts.map(product => product.totalSold) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg  animate-spin text-white text-3xl text-center"><Loader2 size={20}/> </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button
          onClick={clearError}
          className="absolute top-0 right-0 px-4 py-3"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Yearly Sales Report
        </h1>
        
        {/* Year Selection Section */}
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
          {/* Quick Year Selector */}
          <div className="flex items-center space-x-3">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
              Select Year:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Or separator */}
          <div className="text-gray-500">OR</div>

          {/* Custom Year Input */}
          <form onSubmit={handleCustomYearSubmit} className="flex items-center space-x-3">
            <label htmlFor="custom-year" className="text-sm font-medium text-gray-700">
              Enter Year:
            </label>
            <input
              id="custom-year"
              type="number"
              min={startYear}
              max={currentYear + 1}
              value={yearInput}
              onChange={handleCustomYearChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              placeholder="YYYY"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Go
            </button>
          </form>

          {/* Refresh Button */}
          <button
            onClick={() => fetchYearlyReport(selectedYear)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Year Navigation */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => {
              const newYear = selectedYear - 1;
              if (newYear >= startYear) {
                setSelectedYear(newYear);
                setYearInput(newYear.toString());
              }
            }}
            disabled={selectedYear <= startYear}
            className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{selectedYear - 1}</span>
          </button>

          <div className="bg-blue-500 text-white px-6 py-2 rounded-md font-bold text-lg">
            {selectedYear}
          </div>

          <button
            onClick={() => {
              const newYear = selectedYear + 1;
              if (newYear <= currentYear + 1) {
                setSelectedYear(newYear);
                setYearInput(newYear.toString());
              }
            }}
            disabled={selectedYear >= currentYear + 1}
            className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2"
          >
            <span>{selectedYear + 1}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Summary Cards */}
        {yearlyReport && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Total Sales</h3>
              <p className="text-2xl font-bold text-blue-900">
                ${yearlyReport.summary.totalSales.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800">Total Transactions</h3>
              <p className="text-2xl font-bold text-green-900">
                {yearlyReport.summary.totalTransactions.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-800">Avg Monthly Sales</h3>
              <p className="text-2xl font-bold text-purple-900">
                ${yearlyReport.summary.averageMonthlySales.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-sm font-medium text-orange-800">Best Month</h3>
              <p className="text-lg font-bold text-orange-900">
                {yearlyReport.summary.bestSellingMonth.month}
              </p>
              <p className="text-sm text-orange-700">
                ${yearlyReport.summary.bestSellingMonth.sales.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {yearlyReport ? (
        <div className="space-y-6">
          {/* Monthly Sales Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Sales Overview - {selectedYear}</h2>
            <div className="h-96">
              <Bar data={monthlyChartData} options={chartOptions} />
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Top Products - {selectedYear}</h2>
            <div className="h-96">
              <Bar 
                data={topProductsChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: `Top Products by Revenue - ${selectedYear}`
                    },
                  },
                }} 
              />
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Breakdown - {selectedYear}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number of Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Sale
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {yearlyReport.monthlyBreakdown.map((month) => (
                    <tr key={month.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {month.monthNameSomali}
                        </div>
                        <div className="text-sm text-gray-500">{month.monthName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          ${month.totalSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {month.salesCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${month.averageSale.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
            <p className="text-yellow-800">
              No yearly report data available for {selectedYear}. Select a different year or check back later.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default GetYearlyReport;