import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Upload, X, ImageIcon, Trash2, Copy, Plus, Minus } from "lucide-react";
import useProductsStore from "../../store/useProductsStore";
import useCategoryStore from "../../store/useCategoryStore";

const CreateProduct = () => {
  const { createProduct, loading, error } = useProductsStore();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();

  const [creationMode, setCreationMode] = useState("single");
  const [successMessage, setSuccessMessage] = useState("");

  // Single product form data
  const [singleFormData, setSingleFormData] = useState({
    name: "",
    description: "",
    cost: "",
    stock: "",
    lowStockThreshold: "",
    category: "",
  });

  // Bulk products form data
  const [bulkProducts, setBulkProducts] = useState([
    {
      name: "",
      description: "",
      cost: "",
      stock: "",
      lowStockThreshold: "",
      category: "",
    }
  ]);

  // Debug categories
  console.log("Categories:", categories);
  console.log("Categories Loading:", categoriesLoading);

  useEffect(() => {
    console.log("Fetching categories...");
    fetchCategories().then(() => {
      console.log("Categories fetched successfully");
    }).catch(err => {
      console.error("Error fetching categories:", err);
    });
  }, [fetchCategories]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Single product handlers
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      name: singleFormData.name,
      description: singleFormData.description,
      cost: singleFormData.cost,
      stock: singleFormData.stock,
      lowStockThreshold: singleFormData.lowStockThreshold || 5,
      category: singleFormData.category,
    };

    await createProduct(submitData);

    if (!error) {
      setSuccessMessage("Alaabta si guul leh ayaa loo abuuray!");
      setSingleFormData({
        name: "",
        description: "",
        cost: "",
        stock: "",
        lowStockThreshold: "",
        category: "",
      });
    }
  };

  // Bulk product handlers
  const handleBulkChange = (index, field, value) => {
    const updatedProducts = [...bulkProducts];
    updatedProducts[index][field] = value;
    setBulkProducts(updatedProducts);
  };

  const addProductRow = () => {
    setBulkProducts([
      ...bulkProducts,
      {
        name: "",
        description: "",
        cost: "",
        stock: "",
        lowStockThreshold: "",
        category: "",
      }
    ]);
  };

  const removeProductRow = (index) => {
    if (bulkProducts.length > 1) {
      const updatedProducts = bulkProducts.filter((_, i) => i !== index);
      setBulkProducts(updatedProducts);
    }
  };

  const duplicateProductRow = (index) => {
    const productToDuplicate = { ...bulkProducts[index] };
    const updatedProducts = [...bulkProducts];
    updatedProducts.splice(index + 1, 0, productToDuplicate);
    setBulkProducts(updatedProducts);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty products (only name and cost are required)
    const validProducts = bulkProducts.filter(product =>
      product.name.trim() && product.cost && product.category
    );

    if (validProducts.length === 0) {
      alert("Fadlan geli ugu yaraan hal alaab oo sax ah.");
      return;
    }

    const submitData = {
      products: validProducts.map(product => ({
        name: product.name,
        description: product.description,
        cost: product.cost,
        stock: product.stock || 0,
        lowStockThreshold: product.lowStockThreshold || 5,
        category: product.category,
      }))
    };

    await createProduct(submitData);

    if (!error) {
      const createdCount = validProducts.length;
      const failedCount = bulkProducts.length - validProducts.length;

      setSuccessMessage(
        `${createdCount} alaab ayaa si guul leh loo abuuray${failedCount > 0 ? `, ${failedCount} alaabna way fashilmeen` : ''}`
      );

      // Reset form with one empty row
      setBulkProducts([
        {
          name: "",
          description: "",
          cost: "",
          stock: "",
          lowStockThreshold: "",
          category: "",
        }
      ]);
    }
  };

  const clearBulkForm = () => {
    setBulkProducts([
      {
        name: "",
        description: "",
        cost: "",
        stock: "",
        lowStockThreshold: "",
        category: "",
      }
    ]);
  };

  // Render category options
  const renderCategoryOptions = () => {
    if (categoriesLoading) {
      return <option value="">Loading categories...</option>;
    }

    if (!categories || categories.length === 0) {
      return <option value="">No categories available</option>;
    }

    return (
      <>
        <option value="">Dooro qayb</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-xl mr-4 backdrop-blur-sm">
                  <PlusCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Abuur Alaab Cusub</h2>
                  <p className="text-blue-100">Ku dar alaab cusub bakhaarkaaga</p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-white/20 rounded-xl p-1 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setCreationMode("single")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${creationMode === "single"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-blue-100 hover:text-white"
                    }`}
                >
                  Hal Alaab
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("bulk")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${creationMode === "bulk"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-blue-100 hover:text-white"
                    }`}
                >
                  Alaabooyin Badan
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 flex items-center"
              >
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <PlusCircle className="h-4 w-4" />
                </div>
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center"
            >
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <X className="h-4 w-4" />
              </div>
              {error}
            </motion.div>
          )}

          {/* Single Product Form */}
          {creationMode === "single" && (
            <form onSubmit={handleSingleSubmit} className="px-8 py-8">
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Magaca Alaabta *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={singleFormData.name}
                    onChange={handleSingleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Geli magaca alaabta"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    FaahFaahin
                  </label>
                  <textarea
                    name="description"
                    value={singleFormData.description}
                    onChange={handleSingleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Faahfaahin alaabta..."
                  />
                </div>

                {/* Cost and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Qiimaha Alaabta ($) *
                    </label>
                    <input
                      type="number"
                      name="cost"
                      value={singleFormData.cost}
                      onChange={handleSingleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tirada Kaydka
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={singleFormData.stock}
                      onChange={handleSingleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Category and Low Stock Threshold */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Qaybta *
                    </label>
                    <select
                      name="category"
                      value={singleFormData.category}
                      onChange={handleSingleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={categoriesLoading}
                    >
                      {renderCategoryOptions()}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Xaddiga Yar ee Kaydka
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={singleFormData.lowStockThreshold}
                      onChange={handleSingleChange}
                      min="1"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="5 (default)"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Abuuraya...
                    </div>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 mr-2" />
                      Abuur Alaab
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}

          {/* Bulk Products Form */}
          {creationMode === "bulk" && (
            <form onSubmit={handleBulkSubmit} className="px-8 py-8">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Alaabooyin Badan ({bulkProducts.length} alaab)
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ku dar dhowr alaab isla markiiba. *Waxaa loo baahan yahay magaca, qiimaha, iyo qaybta.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearBulkForm}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Soo yaree
                  </button>
                  <button
                    type="button"
                    onClick={addProductRow}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ku dar Alaab
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {bulkProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-700">Alaabta #{index + 1}</h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => duplicateProductRow(index)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Nuqul samee"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {bulkProducts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProductRow(index)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Tirtir"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Magaca *
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => handleBulkChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Magaca alaabta"
                        />
                      </div>

                      {/* Cost */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Qiimaha ($) *
                        </label>
                        <input
                          type="number"
                          value={product.cost}
                          onChange={(e) => handleBulkChange(index, 'cost', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Kaydka
                        </label>
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleBulkChange(index, 'stock', e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Qaybta *
                        </label>
                        <select
                          value={product.category}
                          onChange={(e) => handleBulkChange(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {renderCategoryOptions()}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        FaahFaahin
                      </label>
                      <textarea
                        value={product.description}
                        onChange={(e) => handleBulkChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Faahfaahin alaabta..."
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {bulkProducts.filter(p => p.name && p.cost && p.category).length} / {bulkProducts.length} alaab oo diyaar
                </div>
                <motion.button
                  type="submit"
                  disabled={loading || bulkProducts.filter(p => p.name && p.cost && p.category).length === 0}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Abuurista...
                    </div>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 mr-2" />
                      Abuur {bulkProducts.filter(p => p.name && p.cost && p.category).length} Alaab
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateProduct;