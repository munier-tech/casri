import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useFinancialStore from '../../store/useFinancialStore';
import useProductsStore from '../../store/useProductsStore';

const FinancialLogForm = () => {
  const { createLog, loading } = useFinancialStore();
  const { products, getProductsByDate } = useProductsStore();

  const [date, setDate] = useState('');
  const [productsTotal, setProductsTotal] = useState(0);
  const [netTotal, setNetTotal] = useState(0);

  const [income, setIncome] = useState({
    zdollar: '',
    zcash: '',
    edahabCash: '',
    Cash: '',
    dollar: '',
    account: '',
  });

  const [accountsAdjustments, setAccountsAdjustments] = useState([
    { label: '', value: '' }
  ]);

  const [expenses, setExpenses] = useState([
    { name: '', amount: '' }
  ]);

  useEffect(() => {
    if (date) {
      getProductsByDate(date);
    }
  }, [date, getProductsByDate]);

  useEffect(() => {
    const productsSum = products.reduce((sum, product) => {
      return sum + (product.price || 0) * (product.quantity || 1);
    }, 0);
    setProductsTotal(productsSum);

    const incomeSum = Object.values(income).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const adjustmentsSum = accountsAdjustments.reduce((sum, adj) => sum + (parseFloat(adj.value) || 0), 0);
    const expensesSum = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    setNetTotal((incomeSum + adjustmentsSum + expensesSum) - productsSum);
  }, [products, income, accountsAdjustments, expenses]);

  const handleIncomeChange = (e) => {
    const { name, value } = e.target;
    setIncome({ ...income, [name]: value });
  };

  const handleAdjustmentChange = (index, e) => {
    const { name, value } = e.target;
    const updates = [...accountsAdjustments];
    updates[index][name] = value;
    setAccountsAdjustments(updates);
  };

  const handleExpenseChange = (index, e) => {
    const { name, value } = e.target;
    const updates = [...expenses];
    updates[index][name] = value;
    setExpenses(updates);
  };

  const addAdjustment = () => setAccountsAdjustments([...accountsAdjustments, { label: '', value: '' }]);
  const addExpense = () => setExpenses([...expenses, { name: '', amount: '' }]);
  const removeAdjustment = (index) => setAccountsAdjustments(accountsAdjustments.filter((_, i) => i !== index));
  const removeExpense = (index) => setExpenses(expenses.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedIncome = Object.fromEntries(
      Object.entries(income).map(([key, val]) => [key, parseFloat(val) || 0])
    );

    const parsedAdjustments = accountsAdjustments
      .filter(adj => adj.value)
      .map(adj => ({ label: adj.label || 'Acc', value: parseFloat(adj.value) || 0 }));

    const parsedExpenses = expenses
      .filter(exp => exp.amount)
      .map(exp => ({ name: exp.name || 'Expense', amount: parseFloat(exp.amount) || 0 }));

    const payload = {
      date,
      income: parsedIncome,
      accountsAdjustments: parsedAdjustments,
      expenses: parsedExpenses,
    };

    const res = await createLog(payload);

    if (res.success) {
      toast.success("Financial log saved successfully");
      setDate('');
      setIncome({ zdollar: '', zcash: '', edahabCash: '', Cash: '', dollar: '', account: '' });
      setAccountsAdjustments([{ label: '', value: '' }]);
      setExpenses([{ name: '', amount: '' }]);
    } else {
      toast.error("Failed to save financial log");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
            <h2 className="text-2xl font-bold text-white">Create Financial Log</h2>
            <p className="text-blue-100">Record daily financial transactions and adjustments</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date and Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Log Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-3">Financial Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Product Costs:</span>
                    <span className="font-medium text-red-600">-${productsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Income Total:</span>
                    <span className="font-medium text-green-600">
                      +${Object.values(income).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Adjustments:</span>
                    <span className="font-medium text-amber-600">
                      +${accountsAdjustments.reduce((sum, adj) => sum + (parseFloat(adj.value) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expenses:</span>
                    <span className="font-medium text-purple-600">
                      +${expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="text-sm font-medium text-gray-700">Net Total:</span>
                    <span className={`font-bold ${netTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${netTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Section */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Income Sources</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(income).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 capitalize">{key}</label>
                    <input
                      type="number"
                      name={key}
                      value={income[key]}
                      onChange={handleIncomeChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Adjustments Section */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-amber-800">Account Adjustments</h3>
                <button
                  type="button"
                  onClick={addAdjustment}
                  className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded"
                >
                  + Add Adjustment
                </button>
              </div>
              
              <div className="space-y-3">
                {accountsAdjustments.map((adj, index) => (
                  <div key={index} className="grid grid-cols-5 gap-3 items-center">
                    <div className="col-span-2">
                      <input
                        name="label"
                        placeholder="Description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        value={adj.label}
                        onChange={(e) => handleAdjustmentChange(index, e)}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        name="value"
                        placeholder="Amount"
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        value={adj.value}
                        onChange={(e) => handleAdjustmentChange(index, e)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdjustment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-red-800">Expenses</h3>
                <button
                  type="button"
                  onClick={addExpense}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  + Add Expense
                </button>
              </div>
              
              <div className="space-y-3">
                {expenses.map((exp, index) => (
                  <div key={index} className="grid grid-cols-5 gap-3 items-center">
                    <div className="col-span-2">
                      <input
                        name="name"
                        placeholder="Expense name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        value={exp.name}
                        onChange={(e) => handleExpenseChange(index, e)}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        name="amount"
                        placeholder="Amount"
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        value={exp.amount}
                        onChange={(e) => handleExpenseChange(index, e)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExpense(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Submit Financial Log'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinancialLogForm;