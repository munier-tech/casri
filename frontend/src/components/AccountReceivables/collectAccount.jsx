import React, { useState } from 'react';
import { 
  X, DollarSign, User, Phone, Calendar, 
  CreditCard, CheckCircle, AlertCircle, Save
} from 'lucide-react';
import useSalesStore from '../../store/UseSalesStore';

const CollectPaymentModal = ({ receivable, onClose, onSuccess }) => {
  const { addPaymentToSale, loading } = useSalesStore();
  const [formData, setFormData] = useState({
    amount: receivable?.balance || 0,
    paymentMethod: 'cash',
    notes: '',
    currency: 'USD'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (formData.amount > receivable.balance) {
      setError(`Amount cannot exceed balance of $${receivable.balance}`);
      return;
    }

    try {
      const paymentData = {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || `Payment collected for ${receivable.customer}`,
        currency: formData.currency
      };

      const response = await addPaymentToSale(receivable.saleId, paymentData);

      if (response.success) {
        onSuccess(response);
      } else {
        throw new Error(response.error || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
    }
  };

  const isFullPayment = formData.amount === receivable.balance;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white p-6 border-b z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Collect Payment</h2>
                <p className="text-gray-600">Record payment for outstanding balance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 bg-blue-50 border-b">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <User className="w-4 h-4 mr-2" />
                Customer Name
              </div>
              <p className="font-semibold text-gray-900">{receivable.customer}</p>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Phone className="w-4 h-4 mr-2" />
                Customer Phone
              </div>
              <p className="font-semibold text-gray-900">
                {receivable.customerPhone || '+252 634 220 519'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Amount Owed */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Amount Owed
              </div>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                value={`$${receivable.balance.toFixed(2)}`}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Amount Paid Today */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Paid Today *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                max={receivable.balance}
                step="0.01"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            <div className="mt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, amount: receivable.balance * 0.25 }))}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, amount: receivable.balance * 0.5 }))}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, amount: receivable.balance * 0.75 }))}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, amount: receivable.balance }))}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Full Payment
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Method *
              </div>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'zaad', 'edahab', 'credit', 'bank', 'other'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    formData.paymentMethod === method
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="SOS">SOS - Somali Shilling</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this payment..."
            />
          </div>

          {/* Payment Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Previous Balance:</span>
                <span className="font-semibold">${receivable.balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Amount:</span>
                <span className="font-semibold text-green-600">
                  ${parseFloat(formData.amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Balance:</span>
                <span className={`font-semibold ${
                  receivable.balance - parseFloat(formData.amount || 0) > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  ${(receivable.balance - parseFloat(formData.amount || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Buttons - FIXED STYLING */}
          <div className="sticky bottom-0 bg-white pt-6 border-t">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  isFullPayment
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectPaymentModal;