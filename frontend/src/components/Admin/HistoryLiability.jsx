import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, DollarSign, Package } from "lucide-react";
import { useLiabilityStore } from "@/store/useLiabilityStore";

const HistoryLiability = () => {
  const { liabilities, isLoading, getLiabilities } = useLiabilityStore();

  useEffect(() => {
    getLiabilities();
  }, [getLiabilities]);

  // Calculate total sales
  const totalLiabilities = liabilities.reduce((sum, product) => sum + product.price, 0);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 font-medium">Total liabilities</p>
                <h3 className="text-2xl font-bold text-white mt-2">{liabilities.length}</h3>
              </div>
              <div className="bg-indigo-700 p-3 rounded-lg">
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 font-medium">Today's liabilities</p>
                <h3 className="text-2xl font-bold text-white mt-2">${totalLiabilities.toFixed(1)}</h3>
              </div>
              <div className="bg-purple-700 p-3 rounded-lg">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 font-medium">Avg. Liabilities</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  ${liabilities.length > 0 ? (totalLiabilities / liabilities.length).toFixed(2) : "0.00"}
                </h3>
              </div>
              <div className="bg-pink-700 p-3 rounded-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sales Table */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              <TrendingUp className="mr-3" /> Today's Sales
            </h2>
            <p className="text-black mb-6">Overview of Liabilities  today</p>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-white" size={40} />
              </div>
            ) : liabilities.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white bg-opacity-20 rounded-full p-4 inline-block">
                  <Package size={48} className="text-white" />
                </div>
                <h3 className="text-xl text-white mt-4 font-medium">No sales today</h3>
                <p className="text-black mt-2">Check back later for updates</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-4 px-6 text-left text-black font-medium">Name</th>
                      <th className="py-4 px-6 text-left text-black font-medium">Description</th>
                      <th className="py-4 px-6 text-right text-black font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liabilities.map((product, index) => (
                      <motion.tr
                        key={index}
                        className="border-b border-gray-700 last:border-0 hover:bg-white hover:bg-opacity-5 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <td className="py-4 px-6 text-white font-medium">
                          <div className="flex items-center">
                            <div className="bg-indigo-500 rounded-lg p-2 mr-4">
                            {product.name.toLocaleUpperCase()}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-black">{product.description.toLocaleUpperCase()}</td>
                        <td className="py-4 px-6 text-right">
                          <span className="bg-emerald-500 bg-opacity-20 text-white py-1 px-3 rounded-full text-sm font-medium">
                            ${product.price.toFixed(1)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HistoryLiability;