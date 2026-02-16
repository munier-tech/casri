import { useEffect, useState } from "react";
import useSalesStore from "../../store/UseSalesStore";
import { FiUser, FiRefreshCw, FiEdit, FiTrash2, FiChevronDown, FiChevronUp, FiPackage, FiUsers } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const GetAllUsersDailySales = () => {
  const { usersDailySales, fetchUsersDailySales, updateSale, deleteSale, loading, error } = useSalesStore();
  const [expandedUsers, setExpandedUsers] = useState({});
  const [editingSale, setEditingSale] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editSellingCost, setEditSellingCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsersDailySales();
  }, [fetchUsersDailySales]);

  const toggleUserExpanded = (username) => {
    setExpandedUsers(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
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
      fetchUsersDailySales(); // Refresh data
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
      fetchUsersDailySales(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.error || "Khalad ayaa dhacay marka la masaxayo");
    }
  };

  const refreshData = () => {
    fetchUsersDailySales();
    toast.success("Xogta si guul leh ayaa loo cusboonaysiiyay");
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

  const getRoleColor = (role) => {
    const upperRole = role?.toUpperCase();
    switch (upperRole) {
      case 'ADMIN': return 'text-purple-400';
      case 'EMPLOYEE': return 'text-blue-400';
      default: return 'text-emerald-300';
    }
  };

  const getRoleText = (role) => {
    const upperRole = role?.toUpperCase();
    switch (upperRole) {
      case 'ADMIN': return 'Maamule';
      case 'EMPLOYEE': return 'Shaqeeye';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-white text-emerald-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-8 border border-gray-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-xl">
                <FiUsers className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Iibka Isticmaalayaasha Maanta</h1>
                <p className="text-gray-400">Soo bandhig iibka istacmaalayaasha maanta</p>
              </div>
            </div>

            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-medium shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <FiRefreshCw className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <FiRefreshCw className="h-5 w-5 mr-2" />
              )}
              Cusboonaysii
            </button>
          </div>
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <FiRefreshCw className="animate-spin h-12 w-12 text-emerald-400" />
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl p-6 mb-8">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {usersDailySales?.data && usersDailySales.data.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {usersDailySales.data.map((user, index) => (
              <motion.div
                key={user.username}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleUserExpanded(user.username)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-900/30 p-3 rounded-xl border border-emerald-700/30">
                        <FiUser className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {user.username}
                          <span className={`ml-3 text-sm ${getRoleColor(user.role)}`}>
                            ({getRoleText(user.role)})
                          </span>
                        </h3>
                        <p className="text-gray-400">
                          {user.sales.length} iib • Wadarta: <span className="font-bold text-emerald-400">${user.total.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-emerald-400">
                        ${user.total.toFixed(2)}
                      </span>
                      {expandedUsers[user.username] ? (
                        <FiChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FiChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedUsers[user.username] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-700"
                    >
                      <div className="p-6">
                        <h4 className="font-semibold mb-4 text-emerald-400 border-b border-gray-700 pb-2">
                          Liiska Iibka
                        </h4>
                        <div className="space-y-4">
                          {user.sales.map((sale) => (
                            <div key={sale.id} className="bg-gray-750 rounded-xl p-4 border border-gray-700">
                              {editingSale === sale.id ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Tirada
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={editQuantity}
                                        onChange={(e) => setEditQuantity(parseInt(e.target.value))}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Qiimaha ($)
                                      </label>
                                      <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={editSellingCost}
                                        onChange={(e) => setEditSellingCost(parseFloat(e.target.value))}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-3">
                                    <button
                                      onClick={handleCancelEdit}
                                      className="px-4 py-2 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700"
                                    >
                                      Jooji
                                    </button>
                                    <button
                                      onClick={() => handleUpdate(sale.id)}
                                      disabled={isSubmitting}
                                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                      {isSubmitting ? "Ku kaynaya..." : "Kaydi"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-emerald-900/20 p-2 rounded-lg">
                                        <FiPackage className="h-5 w-5 text-emerald-400" />
                                      </div>
                                      <div>
                                        <h5 className="font-medium">{sale.product?.name}</h5>
                                        <p className="text-sm text-gray-400">
                                          {formatDate(sale.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-emerald-400 font-bold">${sale.totalAmount.toFixed(2)}</p>
                                      <p className="text-sm text-gray-400">
                                        {sale.quantity} x ${sale.sellingCost.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-700">
                                    <button
                                      onClick={() => handleEdit(sale)}
                                      className="flex items-center px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-lg hover:bg-yellow-900/50 text-sm"
                                    >
                                      <FiEdit className="mr-1" />
                                      Beddel
                                    </button>
                                    <button
                                      onClick={() => handleDelete(sale.id)}
                                      className="flex items-center px-3 py-1 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 text-sm"
                                    >
                                      <FiTrash2 className="mr-1" />
                                      Masax
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        ) : usersDailySales?.data && usersDailySales.data.length === 0 ? (
          <motion.div
            className="bg-gray-800 rounded-2xl p-8 text-center shadow-lg border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FiUsers className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Ma jiro Iib Maanta</h3>
            <p className="text-gray-500">
              Ma jiro iibka la sameeyay maanta by isticmaalayaasha.
            </p>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default GetAllUsersDailySales;