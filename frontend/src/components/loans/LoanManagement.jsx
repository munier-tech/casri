import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  User,
  Package,
  Calendar,
  Check,
  X,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer,
  Download
} from "lucide-react";
import useLoanStore from "../../store/useLoanStore";

const LoanManagement = ({ language = "so" }) => {
  const {
    loans,
    stats,
    loading,
    error,
    fetchLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    markLoanAsPaid,
    fetchLoanStats,
    clearError
  } = useLoanStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    personName: "",
    productName: "",
    amount: "",
    description: "",
    quantity: 1
  });

  const [editFormData, setEditFormData] = useState({
    personName: "",
    productName: "",
    amount: "",
    description: "",
    quantity: 1
  });

  const [filters, setFilters] = useState({
    isPaid: "",
    personName: "",
    startDate: "",
    endDate: ""
  });

  const [showFilters, setShowFilters] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    fetchLoans();
    fetchLoanStats();
  }, [fetchLoans, fetchLoanStats]);

  useEffect(() => {
    if (error) {
      setTimeout(() => clearError(), 5000);
    }
  }, [error, clearError]);

  // Enhanced helper function to display creator's name
  const getCreatorDisplayName = (createdBy) => {
    if (!createdBy) {
      return "Unknown";
    }

    if (createdBy.username) {
      return createdBy.username;
    }

    if (createdBy.userName) {
      return createdBy.userName;
    }

    if (createdBy.user && createdBy.user.username) {
      return createdBy.user.username;
    }

    if (createdBy.displayName) {
      return createdBy.displayName;
    }

    if (createdBy.name) {
      return createdBy.name;
    }

    if (createdBy.firstName && createdBy.lastName) {
      return `${createdBy.firstName} ${createdBy.lastName}`;
    }

    if (createdBy.firstName) {
      return createdBy.firstName;
    }

    if (createdBy.email) {
      return createdBy.email.split('@')[0];
    }

    return "Unknown";
  };

  const getUsernameFromEmail = (email) => {
    if (!email) return "Unknown";
    return email.split('@')[0];
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const filterParams = {};
    if (filters.isPaid !== "") filterParams.isPaid = filters.isPaid;
    if (filters.personName) filterParams.personName = filters.personName;
    if (filters.startDate) filterParams.startDate = filters.startDate;
    if (filters.endDate) filterParams.endDate = filters.endDate;

    fetchLoans(filterParams);
  };

  const clearFilters = () => {
    setFilters({
      isPaid: "",
      personName: "",
      startDate: "",
      endDate: ""
    });
    fetchLoans();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.personName || !formData.productName || !formData.amount) {
      return;
    }

    setIsSubmitting(true);
    await createLoan(formData);
    if (!error) {
      setFormData({
        personName: "",
        productName: "",
        amount: "",
        description: "",
        quantity: 1
      });
      setIsCreating(false);
    }
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateLoan(editingId, editFormData);
    if (!error) {
      setEditingId(null);
      setEditFormData({
        personName: "",
        productName: "",
        amount: "",
        description: "",
        quantity: 1
      });
    }
    setIsSubmitting(false);
  };

  const startEditing = (loan) => {
    setEditingId(loan.id);
    setEditFormData({
      personName: loan.personName,
      productName: loan.productName,
      amount: loan.amount.toString(),
      description: loan.description || "",
      quantity: loan.quantity
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({
      personName: "",
      productName: "",
      amount: "",
      description: "",
      quantity: 1
    });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        language === "so"
          ? "Ma hubtaa inaad rabto inaad tirtirto deyntan?"
          : "Are you sure you want to delete this loan?"
      )
    ) {
      await deleteLoan(id);
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (
      window.confirm(
        language === "so"
          ? "Ma hubtaa in deynta la bixiyay?"
          : "Are you sure this loan has been paid?"
      )
    ) {
      await markLoanAsPaid(id);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${content[language].title} - Casri Electronics</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
            .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .print-header h1 { margin: 0; color: #333; font-size: 24px; }
            .print-header p { margin: 5px 0; color: #666; }
            .print-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
            .table-container { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: bold; color: #000; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .paid { color: #059669; font-weight: bold; }
            .unpaid { color: #dc2626; font-weight: bold; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${content[language].title} - Casri Electronics</h1>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
          ${printContent}
        </body>
      </html>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const content = {
    so: {
      title: "Maamulka Deynta",
      subtitle: "Maamul deynta dadka iyo alaabta la siiyay",
      createButton: "Abuur Deyn Cusub",
      createTitle: "Abuur Deyn Cusub",
      editTitle: "Wax Ka Beddel Deynta",
      viewTitle: "Fiiri Deynta",
      personNameLabel: "Magaca Qofka",
      productNameLabel: "Magaca Alaabta",
      amountLabel: "Qiimaha ($)",
      descriptionLabel: "Sharaxaad",
      quantityLabel: "Tirada",
      filterButton: "Shaandhey",
      clearFilters: "Ka Saar Shaandheynta",
      statusFilter: "Xaalada",
      dateFromFilter: "Taariikhda Bilowga",
      dateToFilter: "Taariikhda Dhamaadka",
      searchPerson: "Raadi magaca qofka...",
      allStatus: "Dhammaan",
      paid: "La Bixiyay",
      unpaid: "Lama Bixin",
      cancel: "Jooji",
      save: "Kaydi",
      delete: "Tirtir",
      edit: "Wax Ka Beddel",
      view: "Fiiri",
      markAsPaid: "Ku Calaamadee La Bixiyay",
      noLoans: "Deyn lama helin",
      loading: "...",
      error: "Khalad ayaa dhacay",
      totalLoans: "Wadarta Deynta",
      totalAmount: "Wadarta Lacagta",
      unpaidLoans: "Deynta aan la Bixin",
      unpaidAmount: "Lacagta aan la Bixin",
      paidLoans: "Deynta la Bixiyay",
      paidAmount: "Lacagta la Bixiyay",
      loanDate: "Taariikhda Deynta",
      paidDate: "Taariikhda Bixinta",
      createdBy: "Ku Abuuray",
      status: "Xaalada",
      print: "Print",
      export: "Soo Dejiso",
      person: "Qofka",
      product: "Alaabta",
      amount: "Qadarka",
      quantity: "Tirada",
      date: "Taariikhda",
      actions: "Ficilada"
    },
    en: {
      title: "Loan Management",
      subtitle: "Manage loans given to people and products",
      createButton: "Create New Loan",
      createTitle: "Create New Loan",
      editTitle: "Edit Loan",
      viewTitle: "View Loan",
      personNameLabel: "Person Name",
      productNameLabel: "Product Name",
      amountLabel: "Amount ($)",
      descriptionLabel: "Description",
      quantityLabel: "Quantity",
      filterButton: "Filter",
      clearFilters: "Clear Filters",
      statusFilter: "Status",
      dateFromFilter: "From Date",
      dateToFilter: "To Date",
      searchPerson: "Search person name...",
      allStatus: "All",
      paid: "Paid",
      unpaid: "Unpaid",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      markAsPaid: "Mark as Paid",
      noLoans: "No loans found",
      loading: "Loading loans...",
      error: "An error occurred",
      totalLoans: "Total Loans",
      totalAmount: "Total Amount",
      unpaidLoans: "Unpaid Loans",
      unpaidAmount: "Unpaid Amount",
      paidLoans: "Paid Loans",
      paidAmount: "Paid Amount",
      loanDate: "Loan Date",
      paidDate: "Paid Date",
      createdBy: "Created By",
      status: "Status",
      print: "Print",
      export: "Export",
      person: "Person",
      product: "Product",
      amount: "Amount",
      quantity: "Quantity",
      date: "Date",
      actions: "Actions"
    },
  };

  const filteredLoans = loans.filter(loan => {
    if (filters.isPaid !== "" && loan.isPaid.toString() !== filters.isPaid) return false;
    if (filters.personName && !loan.personName.toLowerCase().includes(filters.personName.toLowerCase())) return false;
    if (filters.startDate && new Date(loan.loanDate) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(loan.loanDate) > new Date(filters.endDate)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{content[language].title}</h2>
                <p className="text-gray-600">{content[language].subtitle}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium no-print"
              >
                <Printer className="w-5 h-5 mr-2" />
                {content[language].print}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
              >
                <Filter className="w-5 h-5 mr-2" />
                {content[language].filterButton}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreating(true)}
                className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                {content[language].createButton}
              </motion.button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-6 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Print Content */}
          <div ref={printRef}>
            {/* Statistics Cards */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{content[language].totalLoans}</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalLoans}</p>
                      <p className="text-gray-600 text-sm">{content[language].totalAmount}</p>
                      <p className="text-lg font-semibold text-emerald-600">{formatCurrency(stats.totalAmount)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{content[language].unpaidLoans}</p>
                      <p className="text-2xl font-bold text-red-600">{stats.unpaidLoans}</p>
                      <p className="text-gray-600 text-sm">{content[language].unpaidAmount}</p>
                      <p className="text-lg font-semibold text-red-600">{formatCurrency(stats.unpaidAmount)}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{content[language].paidLoans}</p>
                      <p className="text-2xl font-bold text-green-600">{stats.paidLoans}</p>
                      <p className="text-gray-600 text-sm">{content[language].paidAmount}</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(stats.paidAmount)}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-gray-200 overflow-hidden no-print"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {content[language].statusFilter}
                        </label>
                        <select
                          name="isPaid"
                          value={filters.isPaid}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                        >
                          <option value="">{content[language].allStatus}</option>
                          <option value="false">{content[language].unpaid}</option>
                          <option value="true">{content[language].paid}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {content[language].searchPerson}
                        </label>
                        <input
                          type="text"
                          name="personName"
                          value={filters.personName}
                          onChange={handleFilterChange}
                          placeholder={content[language].searchPerson}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {content[language].dateFromFilter}
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={filters.startDate}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {content[language].dateToFilter}
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={filters.endDate}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
                      >
                        {content[language].clearFilters}
                      </button>
                      <button
                        onClick={applyFilters}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white"
                      >
                        {content[language].filterButton}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loans Table */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2">{content[language].loading}</p>
                </div>
              ) : filteredLoans.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">{content[language].noLoans}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 border text-left font-semibold text-gray-700">{content[language].person}</th>
                        <th className="p-3 border text-left font-semibold text-gray-700">{content[language].product}</th>
                        <th className="p-3 border text-right font-semibold text-gray-700">{content[language].amount}</th>
                        <th className="p-3 border text-center font-semibold text-gray-700">{content[language].quantity}</th>
                        <th className="p-3 border text-left font-semibold text-gray-700">{content[language].date}</th>
                        <th className="p-3 border text-center font-semibold text-gray-700">{content[language].status}</th>
                        <th className="p-3 border text-left font-semibold text-gray-700">{content[language].createdBy}</th>
                        <th className="p-3 border text-center font-semibold text-gray-700 no-print">{content[language].actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-gray-50 border-b">
                          <td className="p-3 border text-left align-top">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="font-medium text-gray-900">{loan.personName}</span>
                            </div>
                          </td>
                          <td className="p-3 border text-left align-top">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-700">{loan.productName}</span>
                            </div>
                            {loan.description && (
                              <p className="text-gray-500 text-xs mt-1">{loan.description}</p>
                            )}
                          </td>
                          <td className="p-3 border text-right align-top">
                            <span className="font-semibold text-emerald-600">{formatCurrency(loan.amount)}</span>
                          </td>
                          <td className="p-3 border text-center align-top">
                            <span className="text-gray-700">{loan.quantity}</span>
                          </td>
                          <td className="p-3 border text-left align-top">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-700">{formatDate(loan.loanDate)}</span>
                            </div>
                            {loan.isPaid && loan.paidDate && (
                              <div className="flex items-center mt-1">
                                <Check className="h-3 w-3 text-gray-500 mr-1" />
                                <span className="text-gray-500 text-xs">{formatDate(loan.paidDate)}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 border text-center align-top">
                            {loan.isPaid ? (
                              <div className="flex items-center justify-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="font-medium">{content[language].paid}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center text-red-600">
                                <XCircle className="h-4 w-4 mr-1" />
                                <span className="font-medium">{content[language].unpaid}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 border text-left align-top">
                            <span className="text-gray-600 text-sm">
                              {loan.createdBy ? getUsernameFromEmail(loan.createdBy.email || loan.createdBy) : "Unknown"}
                            </span>
                          </td>
                          <td className="p-3 border text-center align-top no-print">
                            <div className="flex justify-center gap-2">
                              {!loan.isPaid && (
                                <button
                                  onClick={() => handleMarkAsPaid(loan.id)}
                                  className="text-green-600 hover:text-green-500 hover:bg-green-50 p-2 rounded-lg transition duration-200"
                                  title={content[language].markAsPaid}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => startEditing(loan)}
                                className="text-blue-600 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition duration-200"
                                title={content[language].edit}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(loan.id)}
                                className="text-red-600 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition duration-200"
                                title={content[language].delete}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan="2" className="p-3 border text-right">{content[language].totalAmount}:</td>
                        <td className="p-3 border text-right text-emerald-600">
                          {formatCurrency(filteredLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0))}
                        </td>
                        <td className="p-3 border text-center">
                          {filteredLoans.reduce((sum, loan) => sum + loan.quantity, 0)}
                        </td>
                        <td colSpan="2" className="p-3 border"></td>
                        <td className="p-3 border text-center">
                          {filteredLoans.filter(loan => loan.isPaid).length} {content[language].paid} / {filteredLoans.length}
                        </td>
                        <td className="p-3 border no-print"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Create Loan Modal */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={() => setIsCreating(false)}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-emerald-600 mb-4">{content[language].createTitle}</h3>
                  <form onSubmit={handleCreateSubmit} className="space-y-3">
                    <input
                      type="text"
                      name="personName"
                      placeholder={content[language].personNameLabel}
                      value={formData.personName}
                      onChange={handleCreateChange}
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      required
                    />
                    <input
                      type="text"
                      name="productName"
                      placeholder={content[language].productNameLabel}
                      value={formData.productName}
                      onChange={handleCreateChange}
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      required
                    />
                    <input
                      type="number"
                      name="amount"
                      placeholder={content[language].amountLabel}
                      value={formData.amount}
                      onChange={handleCreateChange}
                      step="0.01"
                      min="0"
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      required
                    />
                    <input
                      type="number"
                      name="quantity"
                      placeholder={content[language].quantityLabel}
                      value={formData.quantity}
                      onChange={handleCreateChange}
                      min="1"
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                    />
                    <textarea
                      name="description"
                      placeholder={content[language].descriptionLabel}
                      value={formData.description}
                      onChange={handleCreateChange}
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      rows="2"
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-4 py-2 bg-red-600 rounded text-white flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" />
                        {content[language].cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-600 rounded text-white flex items-center disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                          <Check className="w-4 h-4 mr-1" />
                        )}
                        {isSubmitting ? "Saving..." : content[language].save}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Loan Modal */}
          <AnimatePresence>
            {editingId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={cancelEditing}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-emerald-600 mb-4">{content[language].editTitle}</h3>
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <input
                      type="text"
                      name="personName"
                      placeholder={content[language].personNameLabel}
                      value={editFormData.personName}
                      onChange={handleEditChange}
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      required
                    />
                    <input
                      type="text"
                      name="productName"
                      placeholder={content[language].productNameLabel}
                      value={editFormData.productName}
                      onChange={handleEditChange}
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      required
                    />
                    <input
                      type="number"
                      name="amount"
                      placeholder={content[language].amountLabel}
                      value={editFormData.amount}
                      onChange={handleEditChange}
                      step="0.01"
                      min="0"
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      required
                    />
                    <input
                      type="number"
                      name="quantity"
                      placeholder={content[language].quantityLabel}
                      value={editFormData.quantity}
                      onChange={handleEditChange}
                      min="1"
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                    />
                    <textarea
                      name="description"
                      placeholder={content[language].descriptionLabel}
                      value={editFormData.description}
                      onChange={handleEditChange}
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      rows="2"
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-red-600 rounded text-white flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" />
                        {content[language].cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-600 rounded text-white flex items-center disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                          <Check className="w-4 h-4 mr-1" />
                        )}
                        {isSubmitting ? "Saving..." : content[language].save}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default LoanManagement;