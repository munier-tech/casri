import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, PackageSearch } from "lucide-react";
import useProductsStore from "../../store/useProductsStore";

const tabs = [
  { key: "soldout", label: "Alaabaha Dhamaaday", icon: XCircle, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
  { key: "low", label: "Alaabta sii Dhamaanaya", icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  { key: "fine", label: "Alaabta si buuxa u taala", icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" },
];

const Stock = () => {
  const { products, fetchProducts, loading } = useProductsStore();
  const [activeTab, setActiveTab] = useState("soldout");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const classified = useMemo(() => {
    const soldout = [];
    const low = [];
    const fine = [];
    for (const p of products ?? []) {
      const threshold = Number(p.lowStockThreshold ?? 5);
      const stock = Number(p.stock ?? 0);
      if (stock <= 0) soldout.push(p);
      else if (stock <= threshold) low.push(p);
      else fine.push(p);
    }
    return { soldout, low, fine };
  }, [products]);

  const listForTab = activeTab === "soldout" ? classified.soldout : activeTab === "low" ? classified.low : classified.fine;

  const activeTabConfig = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Qolka Kaydka Alaabta</h2>
                <p className="text-blue-100 mt-1">Alaabta dhamaatay iyo kuwa u dhow inay dhamaadaan</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <span className="text-white font-semibold">Total: {products?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 pt-6 pb-4 bg-gray-50 border-b border-gray-100">
            <div className="flex gap-3 flex-wrap">
              {tabs.map(({ key, label, icon: Icon, color, bgColor, borderColor }) => {
                const count = key === "soldout" ? classified.soldout.length : key === "low" ? classified.low.length : classified.fine.length;
                const isActive = activeTab === key;

                return (
                  <motion.button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all duration-200 ${isActive
                        ? `${bgColor} ${borderColor} shadow-md border-2`
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                  >
                    <Icon className={`${color} ${isActive ? 'scale-110' : ''} transition-transform`} size={20} />
                    <span className={`font-medium ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>{label}</span>
                    <span className={`ml-2 text-sm font-semibold px-2 py-1 rounded-full ${isActive ? 'bg-white text-gray-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Indicator */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <activeTabConfig.icon className={activeTabConfig.color} size={16} />
                <span>Showing {listForTab.length} products</span>
                <span className="mx-2">•</span>
                <span className={`font-medium ${activeTabConfig.color}`}>{activeTabConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-x-auto bg-white">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : listForTab.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-gray-500"
              >
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <PackageSearch size={48} className="text-gray-400" />
                </div>
                <span className="text-lg font-medium">Wax alaab ah majiraan qaybtan</span>
                <span className="text-gray-400 mt-1">Alaabta cusub marka lagu daro way ku soo bandhigi doonaan</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Magac</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Tirada kuu Taala</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Qaybta ay tirsantahy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listForTab.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ scale: 1.005, backgroundColor: "rgba(249, 250, 251, 0.8)" }}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-medium text-gray-900">{product.name}</span>
                            {product.sku && (
                              <span className="block text-sm text-gray-500 mt-1">SKU: {product.sku}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${activeTab === "soldout" ? "text-red-600" :
                                activeTab === "low" ? "text-amber-600" : "text-green-600"
                              }`}>
                              {product.stock}
                            </span>
                            {activeTab === "low" && product.lowStockThreshold && (
                              <span className="text-xs text-gray-400">/ {product.lowStockThreshold}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {product.category?.name || "-"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Stock;