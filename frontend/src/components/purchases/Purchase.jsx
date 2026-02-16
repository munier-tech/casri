import React, { useState, useEffect, useRef } from "react";
import usePurchaseStore from "../../store/usepurchaseStore";

const PurchaseManager = () => {
  const {
    purchases,
    getAllPurchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    loading,
    error,
  } = usePurchaseStore();

  const [creationMode, setCreationMode] = useState("single");
  const [formData, setFormData] = useState({
    supplierName: "",
    productName: "",
    quantity: 1,
    price: "",
    additionalPrice: "",
    subtractingPrice: "",
    description: "",
  });

  const [bulkPurchases, setBulkPurchases] = useState([
    {
      productName: "",
      quantity: 1,
      price: "",
      additionalPrice: "",
      subtractingPrice: "",
      description: "",
    }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [successMessage, setSuccessMessage] = useState("");
  const [debugData, setDebugData] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const printRef = useRef();

  useEffect(() => {
    getAllPurchases();
  }, [getAllPurchases]);

  // Get unique suppliers for filter
  const suppliers = [...new Set(purchases.map(p => p.supplierName).filter(Boolean))];

  // Single purchase handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateSingleTotal = () => {
    const quantity = parseInt(formData.quantity) || 0;
    const price = parseFloat(formData.price) || 0;
    const additionalPrice = parseFloat(formData.additionalPrice) || 0;
    const subtractingPrice = parseFloat(formData.subtractingPrice) || 0;
    return (quantity * price) + additionalPrice - subtractingPrice;
  };

  // Bulk purchase handlers
  const handleBulkChange = (index, field, value) => {
    const updatedPurchases = [...bulkPurchases];
    updatedPurchases[index][field] = value;
    setBulkPurchases(updatedPurchases);
  };

  const addProductRow = () => {
    setBulkPurchases([
      ...bulkPurchases,
      {
        productName: "",
        quantity: 1,
        price: "",
        additionalPrice: "",
        subtractingPrice: "",
        description: "",
      }
    ]);
  };

  const removeProductRow = (index) => {
    if (bulkPurchases.length > 1) {
      const updatedPurchases = bulkPurchases.filter((_, i) => i !== index);
      setBulkPurchases(updatedPurchases);
    }
  };

  const duplicateProductRow = (index) => {
    const productToDuplicate = { ...bulkPurchases[index] };
    const updatedPurchases = [...bulkPurchases];
    updatedPurchases.splice(index + 1, 0, productToDuplicate);
    setBulkPurchases(updatedPurchases);
  };

  const clearBulkForm = () => {
    setBulkPurchases([
      {
        productName: "",
        quantity: 1,
        price: "",
        additionalPrice: "",
        subtractingPrice: "",
        description: "",
      }
    ]);
    setFormData(prev => ({ ...prev, supplierName: "" }));
  };

  const calculateBulkTotal = () => {
    return bulkPurchases.reduce((total, purchase) => {
      const quantity = parseInt(purchase.quantity) || 0;
      const price = parseFloat(purchase.price) || 0;
      const additionalPrice = parseFloat(purchase.additionalPrice) || 0;
      const subtractingPrice = parseFloat(purchase.subtractingPrice) || 0;
      return total + (quantity * price) + additionalPrice - subtractingPrice;
    }, 0);
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();

    const quantity = parseInt(formData.quantity) || 1;
    const price = parseFloat(formData.price) || 0;
    const additionalPrice = formData.additionalPrice ? parseFloat(formData.additionalPrice) : 0;
    const subtractingPrice = formData.subtractingPrice ? parseFloat(formData.subtractingPrice) : 0;

    const calculatedTotal = (quantity * price) + additionalPrice - subtractingPrice;

    const submitData = {
      productName: formData.productName.trim(),
      supplierName: formData.supplierName.trim(),
      quantity: quantity,
      price: price,
      additionalPrice: additionalPrice,
      substractingPrice: subtractingPrice,
      description: formData.description.trim(),
      total: calculatedTotal,
    };

    try {
      if (editingId) {
        await updatePurchase(editingId, submitData);
        setSuccessMessage("✅ Iibka si guul leh ayaa loo cusboonaysiiyay!");
        setEditingId(null);
      } else {
        await addPurchase(submitData);
        setSuccessMessage("✅ Iibka cusub si guul leh ayaa loo diwaan geliyay!");
      }

      await getAllPurchases();

      setFormData({
        supplierName: "",
        productName: "",
        quantity: 1,
        price: "",
        additionalPrice: "",
        subtractingPrice: "",
        description: "",
      });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Submit error:", err);
      setDebugData(`Error: ${err.message}`);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplierName.trim()) {
      alert("Fadlan geli magaca alaab-qeybiyaha.");
      return;
    }

    const validPurchases = bulkPurchases.filter(purchase =>
      purchase.productName.trim() && purchase.price && purchase.quantity
    );

    if (validPurchases.length === 0) {
      alert("Fadlan geli ugu yaraan hal alaab oo sax ah.");
      return;
    }

    const submitData = {
      purchases: validPurchases.map(purchase => ({
        productName: purchase.productName,
        supplierName: formData.supplierName.trim(),
        quantity: parseInt(purchase.quantity) || 1,
        price: parseFloat(purchase.price) || 0,
        additionalPrice: purchase.additionalPrice ? parseFloat(purchase.additionalPrice) : 0,
        substractingPrice: purchase.subtractingPrice ? parseFloat(purchase.subtractingPrice) : 0,
        description: purchase.description || "",
        total: (parseInt(purchase.quantity) * parseFloat(purchase.price)) +
          (purchase.additionalPrice ? parseFloat(purchase.additionalPrice) : 0) -
          (purchase.subtractingPrice ? parseFloat(purchase.subtractingPrice) : 0),
      }))
    };

    try {
      await addPurchase(submitData);

      const createdCount = validPurchases.length;
      const failedCount = bulkPurchases.length - validPurchases.length;

      setSuccessMessage(
        `${createdCount} alaab ayaa si guul leh loo iibsaday${failedCount > 0 ? `, ${failedCount} alaabna way fashilmeen` : ''}`
      );

      clearBulkForm();
      await getAllPurchases();

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Bulk submit error:", err);
      setDebugData(`Error: ${err.message}`);
    }
  };

  const handleEdit = (purchase) => {
    setCreationMode("single");
    setEditingId(purchase.id);
    setFormData({
      supplierName: purchase.supplierName || "",
      productName: purchase.productName || "",
      quantity: purchase.quantity || 1,
      price: purchase.price?.toString() || "",
      additionalPrice: purchase.additionalPrice?.toString() || "",
      subtractingPrice: purchase.substractingPrice?.toString() || "",
      description: purchase.description || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ma hubtaa inaad rabto inaad tirtirto iibkan?")) {
      await deletePurchase(id);
      await getAllPurchases();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      supplierName: "",
      productName: "",
      quantity: 1,
      price: "",
      additionalPrice: "",
      subtractingPrice: "",
      description: "",
    });
  };

  // Filter and group purchases by supplier
  const filteredPurchases = purchases.filter(purchase =>
    (purchase.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedSupplier === "all" || purchase.supplierName === selectedSupplier)
  );

  // Group purchases by supplier
  const purchasesBySupplier = filteredPurchases.reduce((acc, purchase) => {
    const supplier = purchase.supplierName || "Unknown Supplier";
    if (!acc[supplier]) {
      acc[supplier] = [];
    }
    acc[supplier].push(purchase);
    return acc;
  }, {});

  // Calculate totals for each supplier
  const supplierTotals = Object.keys(purchasesBySupplier).reduce((acc, supplier) => {
    const supplierPurchases = purchasesBySupplier[supplier];
    acc[supplier] = supplierPurchases.reduce((total, purchase) => {
      const baseTotal = purchase.quantity * purchase.price;
      const additional = Number(purchase.additionalPrice) || 0;
      const subtracting = Number(purchase.substractingPrice) || 0;
      return total + baseTotal + additional - subtracting;
    }, 0);
    return acc;
  }, {});

  const totalValue = filteredPurchases.reduce((sum, purchase) => {
    const baseTotal = purchase.quantity * purchase.price;
    const additional = Number(purchase.additionalPrice) || 0;
    const subtracting = Number(purchase.substractingPrice) || 0;
    return sum + baseTotal + additional - subtracting;
  }, 0);

  const totalQuantity = filteredPurchases.reduce((sum, purchase) => sum + (purchase.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">


        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Maamulka Iibka
          </h1>
          <p className="text-gray-600 text-lg">Maamul alaabta Meheradu soo Daymaysatey iyo kaydka</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6 no-print">
          <div className="bg-white rounded-2xl shadow-lg p-1 border border-gray-200">
            <button
              type="button"
              onClick={() => setCreationMode("single")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${creationMode === "single"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
            >
              📦 Hal Alaab
            </button>
            <button
              type="button"
              onClick={() => setCreationMode("bulk")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${creationMode === "bulk"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                }`}
            >
              🛒 Alaabooyin Badan
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Single Purchase Form */}
          {creationMode === "single" && (
            <div className="bg-white rounded-2xl shadow-xl p-6 no-print border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? "🔄 Wax ka beddel Iibka" : "➕ Kudar Iib Cusub"}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded-lg transition duration-200"
                  >
                    ❌ Jooji
                  </button>
                )}
              </div>

              <form onSubmit={handleSingleSubmit} className="space-y-4">
                {/* Supplier Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏢 Magaca Laga Soo daymaystey *
                  </label>
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    placeholder="Geli magaca Laga Soo Iibsadey"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📦 Magaca Alaabta *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="Geli magaca alaabta"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                {/* Quantity, Price, Additional & Subtracting */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔢 Tiro *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💰 Qiimo ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ➕ Qiimo ku Dar ($)
                    </label>
                    <input
                      type="number"
                      name="additionalPrice"
                      value={formData.additionalPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ➖ Qiimo ka Jar ($)
                    </label>
                    <input
                      type="number"
                      name="subtractingPrice"
                      value={formData.subtractingPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Faahfaahin
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Geli faahfaahinta iibka..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>

                {/* Total */}
                <div className="text-right font-semibold text-lg text-white bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-xl">
                  Wadarta: ${calculateSingleTotal().toLocaleString()}
                </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    className={`w-full py-4 rounded-xl font-bold text-white transition duration-200 shadow-lg ${editingId
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      }`}
                  >
                    {editingId ? "🔄 Cusbooneysii Iibka" : "➕ Kudar Iibka"}
                  </button>
                </div>

                {successMessage && (
                  <p className="text-green-600 mt-2 font-medium text-center">{successMessage}</p>
                )}
              </form>
            </div>
          )}

          {/* Bulk Purchase Form */}
          {creationMode === "bulk" && (
            <div className="bg-white rounded-2xl shadow-xl p-6 no-print border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  🛒 Iibsashooyin Badan
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearBulkForm}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    🗑️ ka saar
                  </button>
                  <button
                    type="button"
                    onClick={addProductRow}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700"
                  >
                    ➕ Ku dar Alaab
                  </button>
                </div>
              </div>

              <form onSubmit={handleBulkSubmit} className="space-y-4">
                {/* Supplier Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏢 Magaca Laga Soo daymaystey *
                  </label>
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    placeholder="Geli magaca Laga Soo Iibsadey"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-xl">
                    {bulkPurchases.length} alaab • {bulkPurchases.filter(p => p.productName && p.price && p.quantity).length} diyaar
                  </p>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {bulkPurchases.map((purchase, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Alaabta #{index + 1}</h4>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => duplicateProductRow(index)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200"
                            title="Nuqul samee"
                          >
                            📋
                          </button>
                          {bulkPurchases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeProductRow(index)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-200"
                              title="Tirtir"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Magaca Alaabta *
                          </label>
                          <input
                            type="text"
                            value={purchase.productName}
                            onChange={(e) => handleBulkChange(index, 'productName', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Magaca alaabta"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Tiro *
                          </label>
                          <input
                            type="number"
                            value={purchase.quantity}
                            onChange={(e) => handleBulkChange(index, 'quantity', e.target.value)}
                            min="1"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Qiimo ($) *
                          </label>
                          <input
                            type="number"
                            value={purchase.price}
                            onChange={(e) => handleBulkChange(index, 'price', e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Qiimo ku Dar ($)
                          </label>
                          <input
                            type="number"
                            value={purchase.additionalPrice}
                            onChange={(e) => handleBulkChange(index, 'additionalPrice', e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Qiimo ka Jar ($)
                          </label>
                          <input
                            type="number"
                            value={purchase.subtractingPrice}
                            onChange={(e) => handleBulkChange(index, 'subtractingPrice', e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Faahfaahin
                        </label>
                        <textarea
                          value={purchase.description}
                          onChange={(e) => handleBulkChange(index, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Faahfaahin alaabta..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bulk Total */}
                <div className="text-right font-semibold text-lg text-white bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl">
                  Wadarta Guud: ${calculateBulkTotal().toLocaleString()}
                </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-bold text-white transition duration-200 shadow-lg"
                  >
                    🛒 Iibso {bulkPurchases.filter(p => p.productName && p.price && p.quantity).length} Alaab
                  </button>
                </div>

                {successMessage && (
                  <p className="text-green-600 mt-2 font-medium text-center">{successMessage}</p>
                )}
              </form>
            </div>
          )}

          {/* Purchases List - Receipt Style */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800">📋 Liiska Iibsashada</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  <option value="all">Dhammaan Alaab-qeybiyayaasha</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="🔍 Raadi alaabta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
              </div>
            </div>

            <div className="space-y-6">
              {Object.keys(purchasesBySupplier).length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Ma jiro Iibsasho</h3>
                  <p className="text-gray-500">Wali ma jiro wax iibsasho ah oo la diiwaangeliyay</p>
                </div>
              ) : (
                Object.keys(purchasesBySupplier).map((supplier) => (
                  <div key={supplier} className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
                    {/* Supplier Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-bold">🏢 {supplier}</h3>
                          <p className="text-blue-100 text-sm">
                            {purchasesBySupplier[supplier].length} alaab •
                            Taariikh: {new Date().toLocaleDateString('so-SO')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${supplierTotals[supplier]?.toLocaleString()}</p>
                          <p className="text-blue-100 text-sm">Wadarta Guud</p>
                        </div>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="p-6">
                      <div className="space-y-3">
                        {purchasesBySupplier[supplier].map((purchase, index) => {
                          const total = (purchase.quantity * purchase.price) +
                            (Number(purchase.additionalPrice) || 0) -
                            (Number(purchase.substractingPrice) || 0);
                          return (
                            <div key={purchase.id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">{index + 1}</span>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{purchase.productName}</h4>
                                    <p className="text-sm text-gray-500">
                                      {purchase.quantity} Xabo × ${purchase.price?.toLocaleString()}
                                      {purchase.additionalPrice > 0 && ` + $${purchase.additionalPrice?.toLocaleString()}`}
                                      {purchase.substractingPrice > 0 && ` - $${purchase.substractingPrice?.toLocaleString()}`}
                                    </p>
                                    {purchase.description && (
                                      <p className="text-xs text-gray-400 mt-1">{purchase.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">${total.toLocaleString()}</p>
                                <div className="flex gap-2 mt-1 no-print">
                                  <button
                                    onClick={() => handleEdit(purchase)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition duration-200"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDelete(purchase.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded transition duration-200"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Receipt Footer */}
                      <div className="mt-6 pt-4 border-t border-gray-300">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-gray-600">
                            <p>Tirada Alaabta:</p>
                            <p>Wadarta Qiimaha:</p>
                            <p>Taariikhda:</p>
                          </div>
                          <div className="text-right font-semibold">
                            <p>{purchasesBySupplier[supplier].reduce((sum, p) => sum + p.quantity, 0)}</p>
                            <p className="text-green-600">${supplierTotals[supplier]?.toLocaleString()}</p>
                            <p>{new Date().toLocaleDateString('so-SO')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Grand Total */}
            {Object.keys(purchasesBySupplier).length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Wadarta Guud</h3>
                    <p className="text-green-100">Dhammaan alaab-qeybiyayaasha</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
                    <p className="text-green-100">
                      {totalQuantity} alaab • {filteredPurchases.length} iibsasho
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManager;