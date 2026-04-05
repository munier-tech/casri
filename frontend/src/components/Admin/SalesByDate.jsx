import React, { useState, useEffect } from "react";
import useSalesStore from "../../store/UseSalesStore";
import { FiCalendar, FiDollarSign, FiEdit, FiTrash2, FiRefreshCw, FiChevronDown, FiChevronUp, FiUser, FiPackage } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const SalesByDate = () => {
  const { salesByDate, fetchSalesByDate, updateSale, deleteSale, loading, error } = useSalesStore();
  const [date, setDate] = useState("");
  const [expandedSale, setExpandedSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editSellingCost, setEditSellingCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  // Fetch sales when date changes
  useEffect(() => {
    if (date) {
      handleFetch();
    }
  }, [date]);

  const handleFetch = () => {
    if (date) {
      fetchSalesByDate(date);
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale.id);
    setEditQuantity(sale.quantity);
    setEditSellingCost(sale.sellingCost);
  };

  const handleCancelEdit = () => {
    setEditingSale(null);
    setEditQuantity(1);
    setEditSellingCost(0);
  };

  const handleUpdate = async (saleId) => {
    if (editQuantity < 1) {
      toast.error("Tirada waa inay ka weyn tahay 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSale(saleId, {
        quantity: editQuantity,
        sellingCost: editSellingCost
      });
      toast.success("Iibka si guul leh ayaa loo cusboonaysiiyay");
      setEditingSale(null);
      handleFetch(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.error || "Khalad ayaa dhacay marka la cusboonaysiinayo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (saleId) => {
    if (!window.confirm("Ma hubtaa inaad masaxdo iibkan?")) return;

    try {
      await deleteSale(saleId);
      toast.success("Iibka si guul leh ayaa loo masaxay");
      handleFetch(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.error || "Khalad ayaa dhacay marka la masaxayo");
    }
  };

  const toggleExpand = (saleId) => {
    if (expandedSale === saleId) {
      setExpandedSale(null);
    } else {
      setExpandedSale(saleId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('so-SO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalSales = salesByDate?.total || 0;
  const salesCount = salesByDate?.sales?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                <FiCalendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Iibka Taariikhda</h1>
                <p className="text-gray-600">Soo bandhig iibka taariikh aad dooratay</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="date"
                className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button
                onClick={handleFetch}
                disabled={loading}
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-white font-medium shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <FiRefreshCw className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <FiDollarSign className="h-5 w-5 mr-2" />
                )}
                Soo Bandhig
              </button>
            </div>
          </div>
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <FiRefreshCw className="animate-spin h-12 w-12 text-blue-500" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {salesByDate?.sales && salesByDate.sales.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm opacity-80">Wadarta Iibka</p>
                  <p className="text-3xl font-bold">${totalSales.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-80">Tirada Iibka</p>
                  <p className="text-3xl font-bold">{salesCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-80">Celinta Celcelis ahaan</p>
                  <button
                    onClick={handleFetch}
                    className="mt-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-100"
                  >
                    <FiRefreshCw className="inline mr-2" />
                    Cusboonaysii
                  </button>
                </div>
              </div>
            </div>

            {/* Sales List */}
            <div className="space-y-4">
              {salesByDate.sales.map((sale) => {
                const productCost = sale.product?.cost || 0;

                return (
                  <motion.div
                    key={sale.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => toggleExpand(sale.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-3 rounded-xl">
                            <FiPackage className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{sale.product?.name}</h3>
                            <p className="text-sm text-gray-600">
                              {sale.user?.username && (
                                <span className="flex items-center">
                                  <FiUser className="mr-1" /> {sale.user.username}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-lg font-bold text-blue-600 block">
                              ${sale.totalAmount.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {sale.quantity} unug
                            </span>
                          </div>
                          {expandedSale === sale.id ? (
                            <FiChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <FiChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedSale === sale.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-5">
                            {editingSale === sale.id ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Tirada
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={editQuantity}
                                      onChange={(e) => setEditQuantity(parseInt(e.target.value))}
                                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Qiimaha Iibka ($)
                                    </label>
                                    <input
                                      type="number"
                                      min="0.01"
                                      step="0.01"
                                      value={editSellingCost}
                                      onChange={(e) => setEditSellingCost(parseFloat(e.target.value))}
                                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                                  >
                                    Jooji
                                  </button>
                                  <button
                                    onClick={() => handleUpdate(sale.id)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {isSubmitting ? "Ku kaynaya..." : "Kaydi"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Tirada</p>
                                    <p className="font-medium">{sale.quantity}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Qiimaha Alaabta</p>
                                    <p className="font-medium">${productCost.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Qiimaha Iibka</p>
                                    <p className="font-medium">${sale.sellingCost.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Wadarta</p>
                                    <p className="font-medium text-blue-600">${sale.totalAmount.toFixed(2)}</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <p className="text-sm text-gray-500">Taariikhda</p>
                                  <p className="font-medium">{formatDate(sale.createdAt)}</p>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => handleEdit(sale)}
                                    className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200"
                                  >
                                    <FiEdit className="mr-2" />
                                    Beddel
                                  </button>
                                  <button
                                    onClick={() => handleDelete(sale.id)}
                                    className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                                  >
                                    <FiTrash2 className="mr-2" />
                                    Masax
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : salesByDate?.sales && salesByDate.sales.length === 0 ? (
          <motion.div
            className="bg-white rounded-2xl p-8 text-center shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FiCalendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ma jiro Iib</h3>
            <p className="text-gray-500">
              Ma jiro iibka la helay taariikhda {date}. Isku day taariikh kale.
            </p>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default SalesByDate;