import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useUserStore } from './store/useUserStore';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import FinancialLogForm from './components/Admin/FinancialLog';
import FinancialLogDate from './components/Admin/GetFinancialDate';
import CreateProduct from './components/products/CreateProduct';
import Categories from './components/categories/CreateCategories';
import LoanManagement from './components/loans/LoanManagement';
import SalesByDate from './components/Admin/SalesByDate';
import GetAllUsersDailySales from './components/Admin/UserProducts';
import GetAllUsersSalesByDate from './components/Admin/UserProductsByDate';
import Stock from './components/Admin/Stock';
import GetMonthlyReport from './components/reports/getMonthlyReports';
import GetYearlyReport from './components/reports/getYearlyReports';
import PurchaseManager from './components/purchases/Purchase';
import NotFound from './pages/NotFoundPage';
import AccessDenied from './pages/AccessDeniedPage';
import ProductsManager from './components/products/GetProducts';
import CreateSaleNew from './pages/Homepage';
import GetSales from './components/sales/getSales';
import Vendor from './components/vendors/Vendor';
import ExpensesPage from './components/expenses/ExpensesForm';
import Account from './components/AccountReceivables/Account';

const App = () => {
  const { checkAuth, user, isLoading, authChecked } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading || !authChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Helper to check if current route is auth route
  const isAuthRoute = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/dashboard" />} />

        {/* Main App with Dashboard Navigation */}
        <Route path="/*" element={
          user ? (
            user.role?.toUpperCase() === "ADMIN" ? (
              <DashboardLayout />
            ) : (
              <AccessDenied />
            )
          ) : (
            <Navigate to="/signin" />
          )
        }>
          {/* Dashboard home */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<div />} />

          {/* Admin routes */}
          <Route path="FinancialLogForm" element={<FinancialLogForm />} />
          <Route path="AddSale" element={<CreateSaleNew />} />
          <Route path="createProduct" element={<CreateProduct />} />
          <Route path="reports" element={<GetMonthlyReport />} />
          <Route path="yearlyreports" element={<GetYearlyReport />} />
          <Route path="purchases" element={<PurchaseManager />} />
          <Route path="products" element={<ProductsManager />} />
          <Route path="CreateSales" element={<CreateSaleNew />} />
          <Route path="GetSales" element={<GetSales />} />
          <Route path="HistorySalesDate" element={<SalesByDate />} />
          <Route path="UserDailySales" element={<GetAllUsersDailySales />} />
          <Route path="UserProductsByDate" element={<GetAllUsersSalesByDate />} />
          <Route path="stock" element={<Stock />} />
          <Route path="expense" element={<ExpensesPage />} />
          <Route path="vendor" element={<Vendor />} />
          <Route path="categories" element={<Categories />} />
          <Route path="Account" element={<Account />} />
          <Route path="loans" element={<LoanManagement />} />
          <Route path="FinancialLogDate" element={<FinancialLogDate />} />

          {/* Catch-all for dashboard routes */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Global 404 for non-existent routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
};

// Dashboard Layout Component
const DashboardLayout = () => {
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.includes('/products')) return 'products';
    if (path.includes('/stock')) return 'stock';
    if (path.includes('/sales')) return 'sales';
    if (path.includes('/financial')) return 'financial';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/users')) return 'users';
    if (path.includes('/loans')) return 'loans';
    if (path.includes('/purchases')) return 'purchases';
    if (path.includes('/categories')) return 'categories';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard component with the navigation */}
      <Dashboard activeTab={getActiveTab()} />
    </div>
  );
};

export default App;