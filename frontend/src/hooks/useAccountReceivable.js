import useAccountsReceivableStore from "../store/useAccountStore";

export const useAccountsReceivable = () => {
  const { receivables, loading, error, fetchReceivables } = useAccountsReceivableStore();

  // Simple helper
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return {
    receivables,
    loading,
    error,
    fetchReceivables,
    formatMoney
  };
};