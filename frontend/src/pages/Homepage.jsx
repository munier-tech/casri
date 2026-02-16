import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiPlus,
  FiMinus,
  FiX,
  FiTrash2,
  FiShoppingCart,
  FiDollarSign,
  FiCalendar,
  FiPackage,
  FiPrinter,
  FiPercent,
  FiSmartphone,
  FiUser,
  FiPhone,
  FiChevronDown
} from "react-icons/fi";
import {
  BsCashCoin
} from "react-icons/bs";
import useProductsStore from "../store/useProductsStore";
import useSalesStore from "../store/UseSalesStore";
import { DollarSign } from "lucide-react";

const CreateSaleNew = () => {
  const { fetchProducts } = useProductsStore();
  const {
    searchProducts,
    searchResults,
    addProductToSale,
    selectedProducts,
    updateProductQuantity,
    updateProductPrice,
    updateProductDiscount,
    removeProductFromSale,
    clearSelectedProducts,
    getSaleCalculations,
    createSale,
    createSaleByDate,
    loading,
    fetchDailySales,
    salesByDate
  } = useSalesStore();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [saleType, setSaleType] = useState("today");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  // Customer information
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Other fields
  const [notes, setNotes] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  // Refs
  const searchInputRef = useRef(null);
  const amountPaidInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const paymentDropdownRef = useRef(null);

  // Calculations
  const calculations = getSaleCalculations();

  // Calculate grand total with discount
  const discountAmount = discountType === "percentage"
    ? (parseFloat(discountValue) || 0) / 100 * calculations.subtotal
    : parseFloat(discountValue) || 0;
  const grandTotal = calculations.subtotal - discountAmount;

  // Calculate remaining balance and change
  const paidAmount = parseFloat(amountPaid) || 0;
  const dueAmount = parseFloat(amountDue) || grandTotal;
  const remainingBalance = Math.max(0, dueAmount - paidAmount);
  const changeAmount = paidAmount > dueAmount ? paidAmount - dueAmount : 0;

  // Calculate expected money for all products
  const calculateExpected = (product) => {
    const discountAmount = (product.sellingPrice * product.discount) / 100;
    const priceAfterDiscount = product.sellingPrice - discountAmount;
    return priceAfterDiscount * product.quantity;
  };

  const totalExpected = selectedProducts.reduce((sum, product) => {
    return sum + calculateExpected(product);
  }, 0);

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchDailySales();

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [fetchProducts, fetchDailySales]);

  // Set amount due automatically when grand total changes
  useEffect(() => {
    if (grandTotal > 0 && !amountDue) {
      setAmountDue(grandTotal.toFixed(2));
    }
  }, [grandTotal, amountDue]);

  // Search products
  useEffect(() => {
    if (searchTerm.trim()) {
      const debounceTimer = setTimeout(() => {
        searchProducts(searchTerm);
        setShowSearchResults(true);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setShowSearchResults(false);
    }
  }, [searchTerm, searchProducts]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target)) {
        setShowPaymentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle product selection
  const handleProductSelect = (product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    addProductToSale(product, 1, product.price || product.cost);
    setSearchTerm("");
    setShowSearchResults(false);
    toast.success(`${product.name} added to sale`);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle quantity changes
  const handleQuantityChange = (productId, quantity) => {
    if (quantity >= 1) {
      updateProductQuantity(productId, quantity);
    }
  };

  const handlePriceChange = (productId, price) => {
    if (price >= 0) {
      updateProductPrice(productId, parseFloat(price));
    }
  };

  const handleDiscountChange = (productId, discount) => {
    if (discount >= 0 && discount <= 100) {
      updateProductDiscount(productId, parseFloat(discount));
    }
  };

  // Complete sale
  const handleCompleteSale = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!amountDue || parseFloat(amountDue) <= 0) {
      toast.error("Amount due is required");
      return;
    }

    if (!amountPaid || parseFloat(amountPaid) < 0) {
      toast.error("Amount paid is required");
      return;
    }

    if (parseFloat(amountPaid) > parseFloat(amountDue)) {
      toast.error("Amount paid cannot exceed amount due");
      return;
    }

    const saleData = {
      products: selectedProducts.map(product => ({
        productId: product.id,
        quantity: product.quantity,
        sellingPrice: product.sellingPrice,
        discount: product.discount
      })),
      discountPercentage: discountType === "percentage" ? parseFloat(discountValue) || 0 : 0,
      discountAmount: discountType === "amount" ? parseFloat(discountValue) || 0 : 0,
      paymentMethod,
      amountDue: parseFloat(amountDue),
      amountPaid: parseFloat(amountPaid),
      grandTotal: grandTotal,
      ...(saleType === "date" && { saleDate }),
      ...(customerName && { customerName }),
      ...(customerPhone && { customerPhone }),
      ...(notes && { notes })
    };

    try {
      if (saleType === "date") {
        await createSaleByDate(saleData);
        toast.success(`Sale recorded for ${new Date(saleDate).toLocaleDateString()}`);
      } else {
        await createSale(saleData);

        if (parseFloat(amountPaid) >= parseFloat(amountDue)) {
          toast.success("Sale completed successfully!");
        } else {
          toast.success("Sale recorded with partial payment!");
        }
      }

      // Clear form
      clearSelectedProducts();
      setAmountDue("");
      setAmountPaid("");
      setPaymentMethod("");
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setDiscountValue("");
      setSearchTerm("");

      // Fetch updated sales
      fetchDailySales();

      // Focus back to search
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to complete sale");
    }
  };

  // Checkout Now function
  const handleCheckoutNow = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    // Set amount paid equal to amount due for quick checkout
    const totalToPay = parseFloat(amountDue) || grandTotal;
    setAmountPaid(totalToPay.toFixed(2));
    setPaymentMethod("cash"); // Default to cash for quick checkout

    toast.success("Ready for checkout! Please confirm payment.");
  };

  // Print receipt
  const handlePrintReceipt = () => {
    if (selectedProducts.length === 0) {
      toast.error("No products to print receipt");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sale Receipt</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 20px; }
          .receipt { width: 280px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .header h2 { margin: 0; font-size: 18px; }
          .header p { margin: 3px 0; font-size: 12px; }
          .item-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px; }
          .item-row .name { flex: 2; }
          .item-row .qty { text-align: center; flex: 0.5; }
          .item-row .price { text-align: right; flex: 1; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .total-row { font-weight: bold; font-size: 14px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          .bold { font-weight: bold; }
          .status { padding: 2px 8px; border-radius: 4px; font-size: 10px; }
          .paid { background: #d1fae5; color: #065f46; }
          .partial { background: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>INVENTORY SYSTEM</h2>
            <p>${saleType === "date" ? new Date(saleDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            <p>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div class="item-row bold">
            <div class="name">PRODUCT</div>
            <div class="qty">QTY</div>
            <div class="price">AMOUNT</div>
          </div>
          <div class="divider"></div>
          ${selectedProducts.map(item => `
            <div class="item-row">
              <div class="name">${item.name}</div>
              <div class="qty">${item.quantity}</div>
              <div class="price">$${(item.sellingPrice * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="item-row">
            <div>Subtotal:</div>
            <div>$${calculations.subtotal.toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Discount:</div>
            <div>-$${discountAmount.toFixed(2)}</div>
          </div>
          <div class="item-row total-row">
            <div>AMOUNT DUE:</div>
            <div>$${parseFloat(amountDue || grandTotal).toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Amount Paid:</div>
            <div>$${parseFloat(amountPaid || 0).toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Remaining Balance:</div>
            <div>$${remainingBalance.toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Change:</div>
            <div>$${changeAmount.toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Payment Method:</div>
            <div>${paymentMethod ? paymentMethod.toUpperCase() : 'CASH'}</div>
          </div>
          ${customerName ? `<div class="item-row"><div>Customer:</div><div>${customerName}</div></div>` : ''}
          <div class="item-row">
            <div>Status:</div>
            <div class="status ${paidAmount >= dueAmount ? 'paid' : 'partial'}">
              ${paidAmount >= dueAmount ? 'FULLY PAID' : 'PARTIALLY PAID'}
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Receipt #: ${Date.now().toString().slice(-6)}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Payment methods
  const paymentMethods = [
    { value: "cash", label: "Cash", icon: <BsCashCoin className="h-4 w-4" /> },
    { value: "zaad", label: "Zaad", icon: <FiSmartphone className="h-4 w-4" /> },
    { value: "edahab", label: "Edahab", icon: <DollarSign className="h-4 w-4" /> }
  ];

  // Get selected payment method
  const selectedPaymentMethod = paymentMethods.find(method => method.value === paymentMethod);

  // Get stock status color
  const getStockStatusColor = (stock, threshold = 5) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock <= threshold) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Sale</h1>
            <p className="text-gray-600 text-sm mt-1">Search products and complete the transaction</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReceipt}
              disabled={selectedProducts.length === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
            >
              <FiPrinter className="mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Cart Section */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cart Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Cart</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <FiPercent className="h-4 w-4 mr-1" />
                  <span className="line-through">Max Discount: 100%</span>
                </div>
              </div>
            </div>

            {/* Product Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="relative" ref={searchResultsRef}>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products or scan barcodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-3"
                    >
                      <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {showSearchResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
                    >
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FiPackage className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-500">Price: ${product.price || product.cost}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getStockStatusColor(product.stock, product.lowStockThreshold)}`}>
                                Stock: {product.stock}
                              </span>
                              <FiPlus className="h-4 w-4 text-blue-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">$ Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">$ Discount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedProducts.length > 0 ? (
                      selectedProducts.map((product) => {
                        const total = product.sellingPrice * product.quantity;
                        const discountAmount = (product.sellingPrice * product.discount) / 100;
                        const expected = (product.sellingPrice - discountAmount) * product.quantity;

                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <FiPackage className="h-5 w-5 text-gray-400 mr-2" />
                                <div>
                                  <p className="font-medium text-gray-900">{product.name}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2 max-w-24">
                                <button
                                  onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
                                  className="p-1 rounded hover:bg-gray-200"
                                  disabled={product.quantity <= 1}
                                >
                                  <FiMinus className="h-3 w-3" />
                                </button>
                                <input
                                  type="number"
                                  value={product.quantity}
                                  onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                                  className="w-12 p-1 text-center border border-gray-300 rounded text-sm"
                                  min="1"
                                />
                                <button
                                  onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                                  className="p-1 rounded hover:bg-gray-200"
                                >
                                  <FiPlus className="h-3 w-3" />
                                </button>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={product.sellingPrice}
                                onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value) || 0)}
                                className="w-20 p-1.5 border border-gray-300 rounded text-sm"
                                min="0"
                                step="0.01"
                              />
                            </td>

                            <td className="px-4 py-3 font-medium text-gray-900">
                              ${total.toFixed(2)}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  value={product.discount || 0}
                                  onChange={(e) => handleDiscountChange(product.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 p-1.5 border border-gray-300 rounded text-sm"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                                <span className="ml-1 text-gray-500 text-sm">%</span>
                              </div>
                            </td>

                            <td className="px-4 py-3 font-medium text-green-600">
                              ${expected.toFixed(2)}
                            </td>

                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeProductFromSale(product.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                          <FiShoppingCart className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">Your cart is empty</p>
                          <p className="text-xs text-gray-400 mt-1">Search and add products to get started!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Customer Information */}
          <div className="space-y-6">

            {/* Customer Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>

              <div className="space-y-5">
                {/* Total */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-xl font-bold text-gray-900">${calculations.subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Discount: (Max: 100%)</span>
                    <span className="text-red-600 font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      {discountType === "percentage" ? (
                        <FiPercent className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      ) : (
                        <FiDollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      )}
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm"
                        placeholder={discountType === "percentage" ? "0" : "0.00"}
                        min="0"
                        max={discountType === "percentage" ? "100" : calculations.subtotal}
                        step={discountType === "percentage" ? "1" : "0.01"}
                      />
                    </div>
                    <button
                      onClick={() => setDiscountType(discountType === "percentage" ? "amount" : "percentage")}
                      className="ml-2 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50 hover:bg-gray-100"
                    >
                      {discountType === "percentage" ? "%" : "$"}
                    </button>
                  </div>
                </div>

                {/* Expected */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expected:</span>
                    <span className="text-xl font-bold text-green-600">${(calculations.subtotal - discountAmount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-4">
                    {/* Amount paid */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Amount paid</label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          ref={amountPaidInputRef}
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Select Option - DROPDOWN */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Select Option</label>
                      <div className="relative" ref={paymentDropdownRef}>
                        <button
                          onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                          className="w-full p-2 border border-gray-300 rounded text-sm text-left flex items-center justify-between bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            {selectedPaymentMethod ? (
                              <>
                                <span className="mr-2">{selectedPaymentMethod.icon}</span>
                                <span>{selectedPaymentMethod.label}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">Select payment method</span>
                            )}
                          </div>
                          <FiChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {/* Dropdown menu */}
                        {showPaymentDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                            {paymentMethods.map((method) => (
                              <button
                                key={method.value}
                                onClick={() => {
                                  setPaymentMethod(method.value);
                                  setShowPaymentDropdown(false);
                                }}
                                className="w-full p-3 text-left flex items-center hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <span className="mr-3">{method.icon}</span>
                                <span>{method.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Receipt option */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Receipt option</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                        <option value="">Select receipt option</option>
                        <option value="print">Print Receipt</option>
                        <option value="email">Email Receipt</option>
                        <option value="none">No Receipt</option>
                      </select>
                    </div>

                    {/* Due date */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Due date</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm bg-white"
                          defaultValue={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Customer name */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Customer name (optional)</label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm"
                          placeholder="Enter customer name"
                        />
                      </div>
                    </div>

                    {/* Customer phone */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Customer phone</label>
                      <div className="flex">
                        <div className="w-20 p-2 border border-gray-300 border-r-0 rounded-l text-sm bg-gray-50 flex items-center justify-center">
                          +252
                        </div>
                        <div className="relative flex-1">
                          <FiPhone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-r text-sm"
                            placeholder="61xxxxxx"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Description</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="Add notes or description..."
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                {/* Checkout Now Button */}
                <button
                  onClick={handleCheckoutNow}
                  disabled={selectedProducts.length === 0}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                >
                  Checkout Now
                </button>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Summary</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span>{selectedProducts.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span>{selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium">Grand Total:</span>
                  <span className="font-bold">${grandTotal.toFixed(2)}</span>
                </div>

                {remainingBalance > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Balance Due:</span>
                    <span className="font-bold">${remainingBalance.toFixed(2)}</span>
                  </div>
                )}

                {changeAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Change:</span>
                    <span className="font-bold">${changeAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Complete Sale Button */}
                <button
                  onClick={handleCompleteSale}
                  disabled={loading || selectedProducts.length === 0 || !paymentMethod || !amountDue || !amountPaid}
                  className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Complete Sale"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSaleNew;