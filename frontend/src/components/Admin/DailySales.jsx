import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiDollarSign, FiPackage, FiRefreshCw, FiUser, FiSearch, FiTrash2, FiEdit, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import useSalesStore from "../../store/UseSalesStore";

const DailySales = () => {
  const { dailySales, fetchDailySales, deleteSale, updateSale, loading, error } = useSalesStore();
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);
  const [editingSale, setEditingSale] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    quantity: 0,
    sellingCost: 0
  });

  useEffect(() => {
    fetchDailySales();
  }, [fetchDailySales]);

  useEffect(() => {
    if (dailySales && dailySales.sales) {
      let filtered = dailySales.sales;

      if (searchTerm) {
        filtered = filtered.filter(sale =>
          sale.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sale.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || "Qof")
        );
      }

      setFilteredSales(filtered);
    }
  }, [dailySales, searchTerm]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleRefresh = () => {
    fetchDailySales();
    toast.success("Iibka maanta si guul leh ayaa loo cusboonaysiiyay");
  };

  const handleDeleteSale = async (saleId) => {
    if (window.confirm("Ma hubtaa inaad rabto inaad tirtirto iibkan?")) {
      try {
        await deleteSale(saleId);
        toast.success("Iibka si guul leh ayaa loo tirtiray");
      } catch (error) {
        toast.error("Khalad ayaa dhacay marka la tirtirayo iibka");
      }
    }
  };

  const handleEditSale = (sale) => {
    setEditingSale(sale.id);
    setUpdatedData({
      quantity: sale.quantity,
      sellingCost: sale.sellingCost || sale.sellingPrice || 0
    });
  };

  const handleUpdateSale = async (saleId) => {
    try {
      await updateSale(saleId, updatedData);
      toast.success("Iibka si guul leh ayaa loo cusboonaysiiyay");
      setEditingSale(null);
    } catch (error) {
      toast.error("Khalad ayaa dhacay marka la cusboonaysiinayo iibka");
    }
  };

  const handleCancelEdit = () => {
    setEditingSale(null);
    setUpdatedData({ quantity: 0, sellingCost: 0 });
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || sale.total || 0), 0);
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg">
              <FiDollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Iibka Maanta
              </h1>
              <p className="text-gray-600">Diiwaanka iibka maanta</p>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Date Selector */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Raadi alaabta ama macaamiisha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm w-full sm:w-64"
              />
            </div>

            <motion.button
              onClick={handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-medium shadow-lg transition-all"
            >
              <FiRefreshCw className="w-5 h-5 mr-2" />
              Cusboonaysii
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 shadow-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Wadarta Iibka</p>
                <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FiDollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 shadow-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tirada Alaabta</p>
                <p className="text-2xl font-bold">{totalQuantity}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FiPackage className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Tirada Iibka</p>
                <p className="text-2xl font-bold">{filteredSales.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FiUser className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sales Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Liiska Iibka Maanta</h2>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {filteredSales.length} iib lagu helay
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">iibka Maanta ...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <FiDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                {searchTerm ?
                  `Wax iib ah lagama helin "${searchTerm}"` :
                  "Ma jiro iibka maanta."
                }
              </p>
              <p className="text-gray-500 mt-2">Iibka cusub marka la geliyo way ku soo bandhigi doonaan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Alaabta</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Qiimaha Alaabta</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Tirada</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Qiimaha Iibka</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Wadarta</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Wakhti</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold">Ficilada</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, index) => {
                    const productCost = sale.product?.cost || 0;

                    return (
                      <motion.tr
                        key={sale.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm">
                              <FiPackage className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{sale.product?.name || "Alaab la'aan"}</p>
                              <p className="text-sm text-gray-500">ID: {sale.product?.id?.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>

                        {/* Product Cost */}
                        <td className="px-6 py-4">
                          <span className="text-gray-600 font-medium">
                            ${productCost.toFixed(2)}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="px-6 py-4">
                          {editingSale === sale.id ? (
                            <input
                              type="number"
                              min="1"
                              value={updatedData.quantity}
                              onChange={(e) => setUpdatedData({
                                ...updatedData,
                                quantity: parseInt(e.target.value) || 0
                              })}
                              className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {sale.quantity}
                            </span>
                          )}
                        </td>

                        {/* Selling Cost */}
                        <td className="px-6 py-4">
                          {editingSale === sale.id ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={updatedData.sellingCost}
                              onChange={(e) => setUpdatedData({
                                ...updatedData,
                                sellingCost: parseFloat(e.target.value) || 0
                              })}
                              className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold">
                              ${sale.sellingCost?.toFixed(2) || sale.sellingPrice?.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Total Amount */}
                        <td className="px-6 py-4">
                          <span className="text-emerald-600 font-bold text-lg">
                            ${(editingSale === sale.id
                              ? (updatedData.quantity * updatedData.sellingCost).toFixed(2)
                              : (sale.totalAmount || sale.total || 0).toFixed(2)
                            )}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded-full">
                            {dayjs(sale.createdAt).format("HH:mm")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {editingSale === sale.id ? (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdateSale(sale.id)}
                                  className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white shadow-sm transition-colors"
                                  title="Kaydi"
                                >
                                  <FiCheck className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={handleCancelEdit}
                                  className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white shadow-sm transition-colors"
                                  title="Jooji"
                                >
                                  <FiX className="h-4 w-4" />
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEditSale(sale)}
                                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white shadow-sm transition-colors"
                                  title="Wax ka beddel iibka"
                                >
                                  <FiEdit className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteSale(sale.id)}
                                  className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white shadow-sm transition-colors"
                                  title="Tirtir iibka"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {filteredSales.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Wadarta Iibka Maanta</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Wadarta Iibka</p>
                  <p className="text-xl font-bold text-emerald-600">${totalSales.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Tirada Alaabta</p>
                  <p className="text-xl font-bold text-blue-600">{totalQuantity}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Tirada Iibka</p>
                  <p className="text-xl font-bold text-purple-600">{filteredSales.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Qiimaha Dhexe</p>
                  <p className="text-xl font-bold text-amber-600">
                    ${totalQuantity > 0 ? (totalSales / totalQuantity).toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DailySales;