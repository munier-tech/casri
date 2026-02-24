import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import React from "react"
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
  FiPercent
} from "react-icons/fi";
import useProductsStore from "../store/useProductsStore";
import useSalesStore from "../store/UseSalesStore";
import useReceiptSettingsStore from "../store/useReceiptSettingsStore";

// Memoized Product Row Component
const ProductRow = React.memo(({ 
  product, 
  onQuantityChange, 
  onPriceChange, 
  onDiscountChange, 
  onRemove 
}) => {
  const total = useMemo(() => product.sellingPrice * product.quantity, [product.sellingPrice, product.quantity]);
  const discountAmount = useMemo(() => (product.sellingPrice * product.discount) / 100, [product.sellingPrice, product.discount]);
  const expected = useMemo(() => (product.sellingPrice - discountAmount) * product.quantity, [product.sellingPrice, discountAmount, product.quantity]);

  return (
    <motion.tr 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
    >
      <td className="px-4 py-3">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <FiPackage className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-500">ID: {product.id.slice(0, 8)}</p>
            {product.barcode && (
              <p className="text-xs text-indigo-600">Barcode: {product.barcode}</p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center space-x-2 max-w-24">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onQuantityChange(product.id, product.quantity - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
            disabled={product.quantity <= 1}
          >
            <FiMinus className="h-3 w-3" />
          </motion.button>
          <input
            type="number"
            value={product.quantity}
            onChange={(e) => onQuantityChange(product.id, parseInt(e.target.value) || 1)}
            className="w-14 p-1.5 text-center border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            min="1"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onQuantityChange(product.id, product.quantity + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <FiPlus className="h-3 w-3" />
          </motion.button>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="relative">
          <FiDollarSign className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="number"
            value={product.sellingPrice}
            onChange={(e) => onPriceChange(product.id, parseFloat(e.target.value) || 0)}
            className="w-24 pl-8 p-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            min="0"
            step="0.01"
          />
        </div>
      </td>

      <td className="px-4 py-3 font-medium text-gray-900">
        ${total.toFixed(2)}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center">
          <input
            type="number"
            value={product.discount || 0}
            onChange={(e) => onDiscountChange(product.id, parseFloat(e.target.value) || 0)}
            className="w-16 p-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onRemove(product.id)}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FiTrash2 className="h-4 w-4" />
        </motion.button>
      </td>
    </motion.tr>
  );
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.quantity === nextProps.product.quantity &&
         prevProps.product.sellingPrice === nextProps.product.sellingPrice &&
         prevProps.product.discount === nextProps.product.discount;
});

const CreateSaleNew = () => {
  const { fetchProducts } = useProductsStore();
  const {
    settings: receiptSettings,
    fetchReceiptSettings
  } = useReceiptSettingsStore();
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
    fetchSalesByDate,
    salesByDate
  } = useSalesStore();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [saleType, setSaleType] = useState("today");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesLookupDate, setSalesLookupDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Customer information
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Other fields
  const [notes, setNotes] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [receiptOption, setReceiptOption] = useState("print");
  const [settingsDraft, setSettingsDraft] = useState({
    storeName: "CASRI INVENTORY",
    footerMessage: "Thank you for your business!",
    includeItemBarcode: true,
    barcodeWrapper: "*",
    barcodeFontSize: 36,
    showSaleBarcode: true,
  });

  // Refs
  const searchInputRef = useRef(null);
  const amountPaidInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Memoized calculations
  const calculations = useMemo(() => getSaleCalculations(), [selectedProducts, getSaleCalculations]);

  // Memoized discount calculations
  const { discountAmount, grandTotal } = useMemo(() => {
    const discount = discountType === "percentage"
      ? (parseFloat(discountValue) || 0) / 100 * calculations.subtotal
      : parseFloat(discountValue) || 0;
    
    return {
      discountAmount: discount,
      grandTotal: calculations.subtotal - discount
    };
  }, [calculations.subtotal, discountType, discountValue]);

  // Memoized payment calculations
  const { paidAmount, dueAmount, remainingBalance, changeAmount } = useMemo(() => {
    const paid = parseFloat(amountPaid) || 0;
    const due = parseFloat(amountDue) || grandTotal;
    
    return {
      paidAmount: paid,
      dueAmount: due,
      remainingBalance: Math.max(0, due - paid),
      changeAmount: paid > due ? paid - due : 0
    };
  }, [amountPaid, amountDue, grandTotal]);

  // Fetch initial data
  useEffect(() => {
    const initData = async () => {
      await Promise.all([
        fetchProducts(),
        fetchDailySales(),
        fetchReceiptSettings()
      ]);
    };
    
    initData();

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [fetchProducts, fetchDailySales, fetchReceiptSettings]);

  useEffect(() => {
    if (receiptSettings) {
      setSettingsDraft({
        storeName: receiptSettings.storeName || "CASRI INVENTORY",
        footerMessage: receiptSettings.footerMessage || "Thank you for your business!",
        includeItemBarcode: receiptSettings.includeItemBarcode !== false,
        barcodeWrapper: receiptSettings.barcodeWrapper || "*",
        barcodeFontSize: receiptSettings.barcodeFontSize || 36,
        showSaleBarcode: receiptSettings.showSaleBarcode !== false,
      });
    }
  }, [receiptSettings]);

  useEffect(() => {
    if (saleType === "salesByDate") {
      fetchSalesByDate(salesLookupDate);
    }
  }, [saleType, salesLookupDate, fetchSalesByDate]);

  // Keep amount due in sync with the latest cart total
  useEffect(() => {
    if (selectedProducts.length === 0) {
      if (amountDue) setAmountDue("");
      return;
    }

    const nextAmountDue = grandTotal > 0 ? grandTotal.toFixed(2) : "";
    if (amountDue !== nextAmountDue) {
      setAmountDue(nextAmountDue);
    }
  }, [grandTotal, selectedProducts.length, amountDue]);

  // Search products with debounce
  useEffect(() => {
    if (searchTerm.trim()) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        searchProducts(searchTerm);
        setShowSearchResults(true);
      }, 300);
      
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoized handlers
  const handleProductSelect = useCallback((product) => {
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
  }, [addProductToSale]);

  const handleSearchKeyDown = useCallback(async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const normalizedTerm = searchTerm.trim();
    if (!normalizedTerm) return;

    let candidates = searchResults;
    if (candidates.length === 0) {
      candidates = await searchProducts(normalizedTerm);
    }

    const exactBarcodeMatch = candidates.find(
      (product) => product.barcode && String(product.barcode).trim() === normalizedTerm
    );

    if (exactBarcodeMatch) {
      handleProductSelect(exactBarcodeMatch);
      return;
    }

    if (candidates.length > 0) {
      handleProductSelect(candidates[0]);
      return;
    }

    toast.error("No product found for this barcode");
  }, [searchResults, searchTerm, handleProductSelect, searchProducts]);

  const handleQuantityChange = useCallback((productId, quantity) => {
    if (quantity >= 1) {
      updateProductQuantity(productId, quantity);
    }
  }, [updateProductQuantity]);

  const handlePriceChange = useCallback((productId, price) => {
    if (price >= 0) {
      updateProductPrice(productId, parseFloat(price));
    }
  }, [updateProductPrice]);

  const handleDiscountChange = useCallback((productId, discount) => {
    if (discount >= 0 && discount <= 100) {
      updateProductDiscount(productId, parseFloat(discount));
    }
  }, [updateProductDiscount]);

  const handleRemoveProduct = useCallback((productId) => {
    removeProductFromSale(productId);
  }, [removeProductFromSale]);

  const handleCheckout = useCallback(async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const dueAmount = parseFloat(amountDue || grandTotal);
    const paidAmountValue = parseFloat(amountPaid);

    if (!Number.isFinite(dueAmount) || dueAmount <= 0) {
      toast.error("Amount due is required");
      return;
    }

    if (!Number.isFinite(paidAmountValue) || paidAmountValue < 0) {
      toast.error("Amount paid is required");
      return;
    }

    if (paidAmountValue > dueAmount) {
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
      amountDue: dueAmount,
      amountPaid: paidAmountValue,
      grandTotal: grandTotal,
      ...(saleType === "date" && { saleDate }),
      ...(dueDate && { dueDate }),
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

        if (paidAmountValue >= dueAmount) {
          toast.success("Sale completed successfully!");
        } else {
          toast.success("Sale recorded with partial payment!");
        }
      }

      if (receiptOption === "print") {
        handlePrintReceipt();
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
      setDueDate(new Date().toISOString().split('T')[0]);

      // Fetch updated sales
      await fetchDailySales();

      // Focus back to search
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to complete sale");
    }
  }, [
    selectedProducts,
    paymentMethod,
    amountDue,
    amountPaid,
    grandTotal,
    saleType,
    saleDate,
    dueDate,
    customerName,
    customerPhone,
    notes,
    discountType,
    discountValue,
    settingsDraft,
    createSale,
    createSaleByDate,
    receiptOption,
    clearSelectedProducts,
    fetchDailySales
  ]);

  const handlePrintReceipt = useCallback(() => {
    if (selectedProducts.length === 0) {
      toast.error("No products to print receipt");
      return;
    }

    const receiptNumber = Date.now().toString().slice(-8);
    const storeName = settingsDraft.storeName || "CASRI INVENTORY";
    const footerMessage = settingsDraft.footerMessage || "Thank you for your business!";
    const barcodeWrapper = settingsDraft.barcodeWrapper || "*";
    const barcodeFontSize = Number(settingsDraft.barcodeFontSize) || 36;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sale Receipt</title>
        <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
          .receipt { max-width: 320px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 24px; text-align: center; }
          .header h2 { margin: 0; font-size: 24px; font-weight: 600; }
          .header p { margin: 4px 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 24px; }
          .divider { border-top: 2px dashed #e5e7eb; margin: 16px 0; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
          .total-row { font-weight: 700; font-size: 18px; color: #1f2937; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
          .paid { background: #d1fae5; color: #065f46; }
          .partial { background: #fef3c7; color: #92400e; }
          .barcode { font-family: 'Libre Barcode 39 Text', monospace; letter-spacing: 1px; text-align: center; line-height: 1; }
          .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>${storeName}</h2>
            <p>${saleType === "date" ? new Date(saleDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            <p>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div class="content">
            ${selectedProducts.map(item => `
              <div class="row">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.sellingPrice * item.quantity).toFixed(2)}</span>
              </div>
              ${settingsDraft.includeItemBarcode && item.barcode ? `
                <div class="barcode" style="font-size:${barcodeFontSize}px;">${barcodeWrapper}${item.barcode}${barcodeWrapper}</div>
                <div style="text-align:center;font-size:11px;color:#6b7280;margin-bottom:8px;">${item.barcode}</div>
              ` : ""}
            `).join('')}
            <div class="divider"></div>
            <div class="row">
              <span>Subtotal</span>
              <span>$${calculations.subtotal.toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Discount</span>
              <span>-$${discountAmount.toFixed(2)}</span>
            </div>
            <div class="row total-row">
              <span>TOTAL</span>
              <span>$${parseFloat(amountDue || grandTotal).toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Paid</span>
              <span>$${paidAmount.toFixed(2)}</span>
            </div>
            ${remainingBalance > 0 ? `
              <div class="row" style="color: #d97706;">
                <span>Balance Due</span>
                <span>$${remainingBalance.toFixed(2)}</span>
              </div>
            ` : ''}
            ${changeAmount > 0 ? `
              <div class="row" style="color: #059669;">
                <span>Change</span>
                <span>$${changeAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="row">
              <span>Payment</span>
              <span style="text-transform: uppercase;">${paymentMethod || 'CASH'}</span>
            </div>
            <div style="text-align: center; margin-top: 16px;">
              <span class="status-badge ${paidAmount >= dueAmount ? 'paid' : 'partial'}">
                ${paidAmount >= dueAmount ? '✓ FULLY PAID' : '⏱ PARTIALLY PAID'}
              </span>
            </div>
            ${settingsDraft.showSaleBarcode ? `
              <div style="margin-top:16px;">
                <div class="barcode" style="font-size:${barcodeFontSize}px;">${barcodeWrapper}${receiptNumber}${barcodeWrapper}</div>
                <div style="text-align:center;font-size:11px;color:#6b7280;">SALE ${receiptNumber}</div>
              </div>
            ` : ""}
            <div class="footer">
              <p>${footerMessage}</p>
              <p>Receipt #: ${receiptNumber}</p>
            </div>
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
  }, [selectedProducts, saleType, saleDate, calculations.subtotal, discountAmount, amountDue, grandTotal, paidAmount, dueAmount, remainingBalance, changeAmount, paymentMethod, settingsDraft]);

  // Payment methods
  const paymentMethods = useMemo(() => [
    { value: "cash", label: "Cash" },
    { value: "zaad", label: "Zaad" },
    { value: "edahab", label: "Edahab" }
  ], []);

  const getStockStatusColor = useCallback((stock, threshold = 5) => {
    if (stock === 0) return "bg-red-100 text-red-800 border-red-200";
    if (stock <= threshold) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-green-100 text-green-800 border-green-200";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-2 md:p-3">
      <div className="w-full">

        {/* Header with Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200/50"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create New Sale
            </h1>
            <p className="text-gray-600 text-sm mt-1 flex items-center">
              <FiShoppingCart className="mr-2 h-4 w-4" />
              Search products and complete the transaction
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrintReceipt}
              disabled={selectedProducts.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium shadow-sm transition-all duration-200"
            >
              <FiPrinter className="mr-2 h-4 w-4" />
              Print Receipt
            </motion.button>
          </div>
        </motion.div>

        {/* Checkout Mode Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "today", label: "Regular Checkout" },
            { id: "date", label: "Sale By Date" },
            { id: "salesByDate", label: "Sales By Date" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSaleType(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                saleType === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {saleType === "salesByDate" && (
          <div className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={salesLookupDate}
                  onChange={(e) => setSalesLookupDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={() => fetchSalesByDate(salesLookupDate)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Load Sales
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Sale #</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByDate.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        No sales found for this date
                      </td>
                    </tr>
                  ) : (
                    salesByDate.map((sale) => (
                      <tr key={sale.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">{sale.saleNumber || "-"}</td>
                        <td className="px-4 py-3">{sale.customerName || "Walk-in Customer"}</td>
                        <td className="px-4 py-3 capitalize">{sale.paymentMethod || "-"}</td>
                        <td className="px-4 py-3 text-right">${Number(sale.grandTotal || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${Number(sale.amountPaid || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-amber-700">
                          ${Number(sale.remainingBalance || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`${saleType === "salesByDate" ? "hidden" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}`}>

          {/* Left Column - Cart Section */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cart Header with Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FiShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Shopping Cart</h2>
                    <p className="text-sm text-gray-500">{selectedProducts.length} items selected</p>
                  </div>
                </div>
                <div className="flex items-center text-sm bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <FiPercent className="h-4 w-4 text-amber-600 mr-1" />
                  <span className="text-amber-700 font-medium">Max Discount: 100%</span>
                </div>
              </div>
            </motion.div>

            {/* Product Search with Enhanced UI */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative" ref={searchResultsRef}>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products or scan barcodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-3.5"
                    >
                      <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    </button>
                  )}
                </div>

                {/* Search Results with Enhanced Animation */}
                <AnimatePresence>
                  {showSearchResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-100 rounded-xl shadow-xl max-h-96 overflow-y-auto"
                    >
                      {searchResults.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleProductSelect(product)}
                          className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mr-3">
                                <FiPackage className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-sm text-gray-600">Price: <span className="font-medium text-green-600">${product.price || product.cost}</span></p>
                                  <span className={`text-xs px-2 py-1 rounded-full border ${getStockStatusColor(product.stock, product.lowStockThreshold)}`}>
                                    Stock: {product.stock}
                                  </span>
                                </div>
                                {product.barcode && (
                                  <p className="text-xs text-indigo-600 mt-1">Barcode: {product.barcode}</p>
                                )}
                              </div>
                            </div>
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                              <FiPlus className="h-4 w-4" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Products Table with Modern Design */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                      {['Product', 'Qty', 'Price', 'Total', 'Discount %', 'Expected', 'Action'].map((header) => (
                        <th key={header} className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {selectedProducts.length > 0 ? (
                        selectedProducts.map((product) => (
                          <ProductRow
                            key={product.id}
                            product={product}
                            onQuantityChange={handleQuantityChange}
                            onPriceChange={handlePriceChange}
                            onDiscountChange={handleDiscountChange}
                            onRemove={handleRemoveProduct}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-4 py-16 text-center">
                            <motion.div
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              className="flex flex-col items-center"
                            >
                              <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                                <FiShoppingCart className="h-10 w-10 text-gray-400" />
                              </div>
                              <p className="text-gray-600 font-medium">Your cart is empty</p>
                              <p className="text-sm text-gray-400 mt-1">Search and add products to get started!</p>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Checkout Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm space-y-4 lg:sticky lg:top-6"
            >
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-gray-900">${calculations.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-red-600">-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-base pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Expected:</span>
                  <span className="font-bold text-blue-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Discount</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder={discountType === "percentage" ? "0" : "0.00"}
                    min="0"
                    max={discountType === "percentage" ? "100" : calculations.subtotal}
                    step={discountType === "percentage" ? "1" : "0.01"}
                  />
                  <button
                    type="button"
                    onClick={() => setDiscountType(discountType === "percentage" ? "amount" : "percentage")}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50"
                  >
                    {discountType === "percentage" ? "%" : "$"}
                  </button>
                </div>
              </div>

              {saleType === "date" && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-medium">Sale date</label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-medium">Payment method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Option</option>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-medium">Amount paid</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      ref={amountPaidInputRef}
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-medium">Receipt option</label>
                  <select
                    value={receiptOption}
                    onChange={(e) => setReceiptOption(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Option</option>
                    <option value="print">Print Receipt</option>
                    <option value="email">Email Receipt</option>
                    <option value="none">No Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-medium">Due date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-medium">Customer name (optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-medium">Customer phone</label>
                  <div className="flex">
                    <span className="px-3 py-2.5 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-700 bg-gray-50">+252</span>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-r-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="63xxxxxx"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Description</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="Add any notes or description..."
                />
              </div>

              {selectedProducts.length > 0 && paymentMethod && (
                <p className="text-xs text-center text-gray-600">
                  {parseFloat(amountPaid || 0) >= parseFloat(amountDue || grandTotal || 0)
                    ? "Fully paid, ready to checkout"
                    : `Balance due: $${remainingBalance.toFixed(2)}`}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCheckout}
                disabled={loading || selectedProducts.length === 0 || !paymentMethod || grandTotal <= 0 || !amountPaid}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-sm"
              >
                {loading ? "Processing..." : saleType === "date" ? "Create Sale By Date" : "Checkout Now"}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSaleNew;

