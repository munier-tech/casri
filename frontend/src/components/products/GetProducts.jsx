import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiPackage, FiDollarSign, FiSearch, FiTag, FiPrinter, FiUpload, FiCalendar, FiChevronLeft, FiChevronRight, FiMoreVertical, FiEye, FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { toast } from "react-hot-toast";
import useProductsStore from "../../store/useProductsStore";

const ProductsManager = () => {
  const {
    products,
    fetchProducts,
    deleteProduct,
    updateProduct,
    createProduct,
    loading
  } = useProductsStore();

  // State for products list
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    barcode: "",
    cost: "",
    stock: "",
    lowStockThreshold: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [creationMode, setCreationMode] = useState("single");
  const [showMobileActions, setShowMobileActions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 8;

  // State for adding new products
  const [singleFormData, setSingleFormData] = useState({
    name: "",
    barcode: "",
    price: "",
    cost: "",
    inventory: "",
    minQuantity: "",
    expiryDate: "",
  });

  const [bulkProducts, setBulkProducts] = useState([
    {
      name: "",
      barcode: "",
      price: "",
      cost: "",
      inventory: "",
      minQuantity: "",
      expiryDate: "",
    }
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort products by latest first
  const sortedProducts = [...filteredProducts].sort((a, b) =>
    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Calculate totals
  const totalInventoryValue = products.reduce((total, product) => {
    return total + (parseFloat(product.cost) || 0) * (parseInt(product.stock) || 0);
  }, 0);

  const totalProductsCount = products.length;
  const lowStockItems = products.filter(product =>
    product.stock < (product.lowStockThreshold || 5)
  ).length;

  const getStockStatus = (stock, threshold = 5) => {
    if (stock === 0) return { status: "out", color: "bg-red-100 text-red-800", text: "Out of Stock" };
    if (stock <= threshold) return { status: "low", color: "bg-amber-100 text-amber-800", text: `Low: ${stock}` };
    return { status: "high", color: "bg-green-100 text-green-800", text: `Stock: ${stock}` };
  };

  // Handle product operations
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        toast.success("Product deleted successfully");
        setShowMobileActions(null);
      } catch {
        toast.error("Error deleting product");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setUpdatedData({
      name: product.name,
      barcode: product.barcode || "",
      cost: product.cost,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
    });
    setShowMobileActions(null);
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("name", updatedData.name);
      formData.append("barcode", updatedData.barcode);
      formData.append("cost", updatedData.cost);
      formData.append("stock", updatedData.stock);
      formData.append("lowStockThreshold", updatedData.lowStockThreshold);

      await updateProduct(id, formData);
      toast.success("Product updated successfully");
      setEditingProduct(null);
    } catch {
      toast.error("Error updating product");
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setUpdatedData({
      name: "",
      barcode: "",
      cost: "",
      stock: "",
      lowStockThreshold: "",
    });
  };

  // Add product modal functions
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();

    if (!singleFormData.name || !singleFormData.cost) {
      toast.error("Please fill in required fields");
      return;
    }

    const submitData = {
      name: singleFormData.name,
      barcode: singleFormData.barcode,
      cost: singleFormData.cost,
      price: singleFormData.price || singleFormData.cost,
      stock: singleFormData.inventory || 0,
      lowStockThreshold: singleFormData.minQuantity || 5,
      expiryDate: singleFormData.expiryDate || null,
    };

    await createProduct(submitData);

    toast.success("Product created successfully!");
    setSingleFormData({
      name: "",
      barcode: "",
      price: "",
      cost: "",
      inventory: "",
      minQuantity: "",
      expiryDate: "",
    });

    fetchProducts();
    setShowAddProductModal(false);
  };

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
        barcode: "",
        price: "",
        cost: "",
        inventory: "",
        minQuantity: "",
        expiryDate: "",
      }
    ]);
  };

  const removeProductRow = (index) => {
    if (bulkProducts.length > 1) {
      const updatedProducts = bulkProducts.filter((_, i) => i !== index);
      setBulkProducts(updatedProducts);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    const validProducts = bulkProducts.filter(product =>
      product.name.trim() && product.cost
    );

    if (validProducts.length === 0) {
      toast.error("Please enter at least one valid product.");
      return;
    }

    const submitData = {
      products: validProducts.map(product => ({
        name: product.name,
        barcode: product.barcode,
        cost: product.cost,
        price: product.price || product.cost,
        stock: product.inventory || 0,
        lowStockThreshold: product.minQuantity || 5,
        expiryDate: product.expiryDate || null,
      }))
    };

    await createProduct(submitData);

    toast.success(`${validProducts.length} products created successfully!`);

    setBulkProducts([
      {
        name: "",
        barcode: "",
        price: "",
        cost: "",
        inventory: "",
        minQuantity: "",
        expiryDate: "",
      }
    ]);

    fetchProducts();
    setShowAddProductModal(false);
  };

  const resetSingleForm = () => {
    setSingleFormData({
      name: "",
      barcode: "",
      price: "",
      cost: "",
      inventory: "",
      minQuantity: "",
      expiryDate: "",
    });
  };

  const resetBulkForm = () => {
    setBulkProducts([
      {
        name: "",
        barcode: "",
        price: "",
        cost: "",
        inventory: "",
        minQuantity: "",
        expiryDate: "",
      }
    ]);
  };

  // Pagination controls
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Print function
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Product List - Inventory Management</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #000;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .print-header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
          }
          .print-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .out-of-stock { color: #dc2626; font-weight: bold; }
          .low-stock { color: #d97706; font-weight: bold; }
          .in-stock { color: #059669; font-weight: bold; }
          .total-row { background-color: #f9f9f9; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Product List - Inventory Management</h1>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="print-stats">
          <div class="stat-card">
            <p><strong>Total Inventory Value</strong></p>
            <p>$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div class="stat-card">
            <p><strong>Total Products</strong></p>
            <p>${totalProductsCount}</p>
          </div>
          <div class="stat-card">
            <p><strong>Low Stock Items</strong></p>
            <p>${lowStockItems}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Barcode</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            ${products.map((product, index) => {
      const stockInfo = getStockStatus(product.stock, product.lowStockThreshold);
      const statusClass = stockInfo.status === 'out' ? 'out-of-stock' :
        stockInfo.status === 'low' ? 'low-stock' : 'in-stock';

      return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${product.name}</td>
                  <td>${product.barcode || 'N/A'}</td>
                  <td class="text-right">$${parseFloat(product.cost || 0).toFixed(2)}</td>
                  <td class="text-right">$${parseFloat(product.price || product.cost || 0).toFixed(2)}</td>
                  <td class="text-center">${product.stock || 0}</td>
                  <td class="${statusClass}">${stockInfo.text}</td>
                  <td>${product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `;
    }).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" class="text-right"><strong>Total Value:</strong></td>
              <td class="text-right"><strong>$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              <td class="text-center"><strong>${products.reduce((sum, product) => sum + parseInt(product.stock || 0), 0)}</strong></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; font-size: 11px; color: #666; text-align: center;">
          <p>Generated by Inventory Management System - ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    } else {
      alert('Please allow popups for printing');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Mobile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FiPackage size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Products</h1>
                  <p className="text-blue-100 text-sm">Manage your inventory</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold">{totalProductsCount}</p>
                  <p className="text-xs text-blue-200">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</p>
                  <p className="text-xs text-blue-200">Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{lowStockItems}</p>
                  <p className="text-xs text-blue-200">Low Stock</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-white text-blue-600 p-3 rounded-xl shadow-lg"
            >
              <FiPlus size={24} />
            </button>
          </div>
        </motion.div>

        {/* Desktop Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 mb-6"
        >
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-xl mr-4 backdrop-blur-sm">
                  <FiPackage className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Products Manager</h2>
                  <p className="text-blue-100">Manage your inventory products</p>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold shadow-lg backdrop-blur-sm"
                >
                  <FiPrinter className="w-5 h-5 mr-2" />
                  Print
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold shadow-lg"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Add Product
                </motion.button>
              </div>
            </div>
          </div>

          {/* Desktop Stats */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Inventory Value</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiDollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{totalProductsCount}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiPackage className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Low Stock Items</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{lowStockItems}</p>
                    <p className="text-xs text-red-500 mt-1">Products near stock out</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FiTag className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products by name or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiX className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                <FiFilter className="mr-2" />
                Filters
                {showFilters ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
              </button>

              <div className="flex items-center gap-2 text-sm bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="font-medium text-blue-700">{sortedProducts.length}</span>
                <span className="text-blue-600">products</span>
              </div>
            </div>
          </div>

          {/* Filters Dropdown */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>All</option>
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Newest First</option>
                    <option>Name A-Z</option>
                    <option>Stock: High to Low</option>
                    <option>Stock: Low to High</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Products List - Mobile View */}
        <div className="lg:hidden space-y-4">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => {
              const stockInfo = getStockStatus(product.stock, product.lowStockThreshold);
              const isEditing = editingProduct === product.id;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200"
                >
                  {/* Product Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${stockInfo.color}`}>
                        <FiPackage className="text-current" />
                      </div>
                      <div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={updatedData.name}
                            onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
                            className="font-bold text-gray-800 border-b border-blue-300 focus:outline-none"
                          />
                        ) : (
                          <div>
                            <h3 className="font-bold text-gray-800">{product.name}</h3>
                            {product.barcode && <p className="text-xs text-indigo-600">Barcode: {product.barcode}</p>}
                          </div>
                        )}
                        <div className={`text-xs px-2 py-1 rounded-full ${stockInfo.color} mt-1 inline-block`}>
                          {stockInfo.text}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMobileActions(showMobileActions === product.id ? null : product.id)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiMoreVertical size={20} />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Barcode</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={updatedData.barcode}
                          onChange={(e) => setUpdatedData({ ...updatedData, barcode: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-800"
                        />
                      ) : (
                        <p className="font-semibold text-indigo-600">{product.barcode || "N/A"}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost</p>
                      {isEditing ? (
                        <input
                          type="number"
                          value={updatedData.cost}
                          onChange={(e) => setUpdatedData({ ...updatedData, cost: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-800"
                        />
                      ) : (
                        <p className="font-semibold text-green-600">${product.cost}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-semibold text-blue-600">${product.price || product.cost}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stock</p>
                      {isEditing ? (
                        <input
                          type="number"
                          value={updatedData.stock}
                          onChange={(e) => setUpdatedData({ ...updatedData, stock: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-800"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{product.stock}</p>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' :
                                product.stock > 5 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Min Qty</p>
                      {isEditing ? (
                        <input
                          type="number"
                          value={updatedData.lowStockThreshold}
                          onChange={(e) => setUpdatedData({ ...updatedData, lowStockThreshold: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-800"
                        />
                      ) : (
                        <p className="font-semibold">{product.lowStockThreshold || 5}</p>
                      )}
                    </div>
                  </div>

                  {/* Mobile Actions Dropdown */}
                  <AnimatePresence>
                    {showMobileActions === product.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 pt-4 mt-4"
                      >
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdate(product.id)}
                                className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                              >
                                <FiCheck /> Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex-1 bg-gray-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                              >
                                <FiX /> Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(product)}
                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                              >
                                <FiEdit2 /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? `No products match "${searchTerm}"` : "Add your first product to get started"}
              </p>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
              >
                Add Product
              </button>
            </div>
          )}
        </div>

        {/* Products Table - Desktop View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-blue-700 font-semibold text-left">Product</th>
                  <th className="px-6 py-4 text-blue-700 font-semibold text-left">Barcode</th>
                  <th className="px-6 py-4 text-blue-700 font-semibold text-left">Cost</th>
                  <th className="px-6 py-4 text-blue-700 font-semibold text-left">Price</th>
                  <th className="px-6 py-4 text-blue-700 font-semibold text-left">Stock</th>
                  <th className="px-6 py-4 text-blue-700 font-semibold text-left">Status</th>
                  <th className="px-6 py-4 text-blue-700 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product, index) => {
                    const stockInfo = getStockStatus(product.stock, product.lowStockThreshold);
                    const isEditing = editingProduct === product.id;

                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b border-gray-100 hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${stockInfo.color}`}>
                              <FiPackage className="text-current" />
                            </div>
                            <div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={updatedData.name}
                                  onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
                                  className="font-medium text-gray-800 border-b border-blue-300 focus:outline-none"
                                />
                              ) : (
                                <div>
                                  <p className="font-medium text-gray-800">{product.name}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-xs">
                                    {product.description || "No description"}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={updatedData.barcode}
                              onChange={(e) => setUpdatedData({ ...updatedData, barcode: e.target.value })}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                            />
                          ) : (
                            <p className="font-medium text-indigo-600">{product.barcode || "N/A"}</p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={updatedData.cost}
                              onChange={(e) => setUpdatedData({ ...updatedData, cost: e.target.value })}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                            />
                          ) : (
                            <p className="font-semibold text-green-600">${product.cost}</p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-blue-600">${product.price || product.cost}</p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {isEditing ? (
                              <>
                                <input
                                  type="number"
                                  value={updatedData.stock}
                                  onChange={(e) => setUpdatedData({ ...updatedData, stock: e.target.value })}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                                  placeholder="Stock"
                                />
                                <input
                                  type="number"
                                  value={updatedData.lowStockThreshold}
                                  onChange={(e) => setUpdatedData({ ...updatedData, lowStockThreshold: e.target.value })}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                                  placeholder="Min Qty"
                                />
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold">{product.stock}</span>
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' :
                                        product.stock > 5 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                      style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">Min: {product.lowStockThreshold || 5}</p>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockInfo.color}`}>
                            {stockInfo.text}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(product.id)}
                                  className="p-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-white shadow-md"
                                >
                                  <FiCheck />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-2.5 bg-gray-500 hover:bg-gray-600 rounded-xl text-white shadow-md"
                                >
                                  <FiX />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="p-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-white shadow-md"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="p-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white shadow-md"
                                >
                                  <FiTrash2 />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiPackage className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm ? `No products match "${searchTerm}"` : "Add your first product to get started"}
                        </p>
                        <button
                          onClick={() => setShowAddProductModal(true)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
                        >
                          Add Product
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-200"
          >
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                      <FiPlus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Add New Product</h2>
                      <p className="text-blue-100 text-sm">
                        {creationMode === "single" ? "Add single product" : "Add multiple products"}
                      </p>
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex bg-white/20 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCreationMode("single");
                        resetSingleForm();
                      }}
                      className={`px-3 py-1 rounded text-sm font-medium ${creationMode === "single"
                        ? "bg-white text-blue-600"
                        : "text-blue-100 hover:text-white"
                        }`}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreationMode("bulk");
                        resetBulkForm();
                      }}
                      className={`px-3 py-1 rounded text-sm font-medium ${creationMode === "bulk"
                        ? "bg-white text-blue-600"
                        : "text-blue-100 hover:text-white"
                        }`}
                    >
                      Multiple
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
                {creationMode === "single" ? (
                  // Single Product Form
                  <form onSubmit={handleSingleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={singleFormData.name}
                          onChange={handleSingleChange}
                          required
                          maxLength={50}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter product name"
                        />
                        <div className="absolute right-2 top-2 text-xs text-gray-400">
                          {singleFormData.name.length}/50
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Barcode
                      </label>
                      <input
                        type="text"
                        name="barcode"
                        value={singleFormData.barcode}
                        onChange={handleSingleChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Scan or type barcode"
                      />
                    </div>

                    {/* Price and Cost Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={singleFormData.price}
                          onChange={handleSingleChange}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter price"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Cost <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="cost"
                          value={singleFormData.cost}
                          onChange={handleSingleChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter cost"
                        />
                      </div>
                    </div>

                    {/* Inventory and Min Quantity Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Inventory
                        </label>
                        <input
                          type="number"
                          name="inventory"
                          value={singleFormData.inventory}
                          onChange={handleSingleChange}
                          min="0"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter inventory count"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Minimum quantity
                        </label>
                        <input
                          type="number"
                          name="minQuantity"
                          value={singleFormData.minQuantity}
                          onChange={handleSingleChange}
                          min="1"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter minimum quantity"
                        />
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Expiry Date <span className="text-gray-400 text-sm">(optional)</span>
                      </label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          name="expiryDate"
                          value={singleFormData.expiryDate}
                          onChange={handleSingleChange}
                          className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  // Bulk Products Form
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Multiple Products ({bulkProducts.length})
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Add multiple products at once
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={resetBulkForm}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={addProductRow}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add Row
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                      {bulkProducts.map((product, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-700">Product #{index + 1}</h4>
                            {bulkProducts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeProductRow(index)}
                                className="p-1 text-gray-500 hover:text-red-600"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Name *
                              </label>
                              <input
                                type="text"
                                value={product.name}
                                onChange={(e) => handleBulkChange(index, 'name', e.target.value)}
                                maxLength={50}
                                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-gray-800 text-sm"
                                placeholder="Product name"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Cost *
                              </label>
                              <input
                                type="number"
                                value={product.cost}
                                onChange={(e) => handleBulkChange(index, 'cost', e.target.value)}
                                min="0"
                                step="0.01"
                                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-gray-800 text-sm"
                                placeholder="Cost"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Barcode
                              </label>
                              <input
                                type="text"
                                value={product.barcode}
                                onChange={(e) => handleBulkChange(index, 'barcode', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-gray-800 text-sm"
                                placeholder="Barcode"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Inventory
                              </label>
                              <input
                                type="number"
                                value={product.inventory}
                                onChange={(e) => handleBulkChange(index, 'inventory', e.target.value)}
                                min="0"
                                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-gray-800 text-sm"
                                placeholder="Inventory"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProductModal(false);
                      creationMode === "single" ? resetSingleForm() : resetBulkForm();
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={creationMode === "single" ? handleSingleSubmit : handleBulkSubmit}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </div>
                    ) : creationMode === "single" ? (
                      "Save Product"
                    ) : (
                      `Save ${bulkProducts.filter(p => p.name && p.cost).length} Products`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsManager;
