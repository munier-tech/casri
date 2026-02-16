import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBasket,
  ShoppingCart,
  Boxes,
  PlusCircle,
  Calendar,
  FileText,
  ChevronRight,
  BarChart3,
  Package,
  CreditCard,
  Users,
  LogOut,
  LogIn,
  Loader,
  DollarSign,
  User,
  ChevronDown,
  Menu,
  X,
  Bell,
  Search,
  TrendingUp,
  Activity,
  Target,
  Zap,
  Briefcase,
  Layers,
  FileBarChart,
  House,
  BellDot,
  Box,
  Smartphone,
  Wallet,
  Eye,
  Filter,
  RefreshCw
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useProductsStore from "../store/useProductsStore";
import useSalesStore from "../store/UseSalesStore";
import { useUserStore } from "../store/useUserStore";
import { BsCart } from "react-icons/bs";

const Dashboard = ({ activeTab: initialActiveTab }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || "dashboard");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isLoading, signOut } = useUserStore();
  const { products, fetchProducts } = useProductsStore();

  // Update active tab when location changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/dashboard") || path === "/") setActiveTab("dashboard");
    else if (path.includes("/products")) setActiveTab("products");
    else if (path.includes("/stock")) setActiveTab("stock");
    else if (path.includes("/AddSale")) setActiveTab("sales");
    else if (path.includes("/financial")) setActiveTab("financial");
    else if (path.includes("/reports")) setActiveTab("reports");
    else if (path.includes("/UserDailySales") || path.includes("/UserProductsByDate")) setActiveTab("users");
    else if (path.includes("/loans")) setActiveTab("loans");
    else if (path.includes("/purchases")) setActiveTab("purchases");
    else if (path.includes("/categories")) setActiveTab("categories");
    else if (path.includes("/payment-methods")) setActiveTab("payment-methods");
  }, [location]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleLogout = () => {
    signOut();
    setUserMenuOpen(false);
    navigate("/signin");
  };

  const mainTabs = [
    {
      id: "Overview",
      label: "Overview",
      icon: Box,
      color: "from-blue-500 to-blue-600",
      gradient: "bg-gradient-to-r from-blue-500 to-blue-600",
      path: "/dashboard",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      color: "from-emerald-500 to-emerald-600",
      gradient: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      path: "/products",
    },
    {
      id: "alerts",
      label: "alerts",
      icon: BellDot,
      color: "from-amber-500 to-amber-600",
      gradient: "bg-gradient-to-r from-amber-500 to-amber-600",
      path: "/stock",
    },
    {
      id: "Checkout",
      label: "Checkout",
      icon: ShoppingCart,
      color: "from-rose-500 to-rose-600",
      gradient: "bg-gradient-to-r from-rose-500 to-rose-600",
      path: "/CreateSales",
    },
    {
      id: "Vendors",
      label: "Vendors",
      icon: ShoppingBasket,
      color: "from-violet-500 to-violet-600",
      gradient: "bg-gradient-to-r from-violet-500 to-violet-600",
      path: "/vendor",
    },
    {
      id: "expense",
      label: "Expenses",
      icon: CreditCard,
      color: "from-indigo-500 to-indigo-600",
      gradient: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      path: "/expense",
    },
    {
      id: "Account",
      label: "Account Receivables",
      icon: CreditCard,
      color: "from-indigo-500 to-indigo-600",
      gradient: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      path: "/Account",
    },
    {
      id: "loans",
      label: "Loans",
      icon: DollarSign,
      color: "from-yellow-500 to-yellow-600",
      gradient: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      path: "/loans",
    },
    {
      id: "payment-methods",
      label: "Payments",
      icon: Wallet,
      color: "from-green-500 to-green-600",
      gradient: "bg-gradient-to-r from-green-500 to-green-600",
      path: "/payment-methods",
    },

    {
      id: "Sales",
      label: "Sales",
      icon: BsCart,
      color: "from-pink-500 to-pink-600",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-600",
      path: "/GetSales",
      desc: "View today's sales report",
    },
  ];

  const quickAccessCards = [
    {
      id: "createProduct",
      label: "Create Product",
      icon: PlusCircle,
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      path: "/createProduct",
      desc: "Add new product to inventory",
    },
    {
      id: "Sales",
      label: "Sales",
      icon: Calendar,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      path: "/GetSales",
      desc: "View today's sales report",
    },
    {
      id: "payment-methods",
      label: "Payment Methods",
      icon: Wallet,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      path: "/payment-methods",
      desc: "Track sales by payment method",
    },
    {
      id: "alerts",
      label: "alerts",
      icon: Boxes,
      color: "bg-gradient-to-r from-amber-500 to-amber-600",
      path: "/stock",
      desc: "View stock levels and alerts",
    },
    {
      id: "financialLog",
      label: "Financial Log",
      icon: FileText,
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      path: "/FinancialLogForm",
      desc: "Record financial transactions",
    },
    {
      id: "categories",
      label: "Categories",
      icon: Layers,
      color: "bg-gradient-to-r from-violet-500 to-violet-600",
      path: "/categories",
      desc: "Manage product categories",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="text-white" size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ACCOUNTING DASHBOARD
                  </h1>
                  <p className="text-xl font-bold  text-blue-900 ">
                    <strong className="text-xl font-bold text-blue-900"> Casri </strong> Management System
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products, sales, reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell size={22} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-bold text-gray-900">
                        {user.username?.charAt(0).toUpperCase() + user.username?.slice(1) || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-0.5 rounded-full font-medium">
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Admin'}
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* User Menu Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900">{user.username || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email || 'user@example.com'}</p>
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-full">
                              {user.role || 'Administrator'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleLogout}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          {isLoading ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            <LogOut size={16} />
                          )}
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/signin"
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                  >
                    <LogIn className="inline mr-2" size={16} />
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Tabs Navigation */}
          <div className="hidden lg:flex items-center justify-center gap-1 mt-4 pb-2">
            {mainTabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id
                    ? `${tab.gradient} text-white shadow-lg transform scale-105`
                    : "text-gray-700 hover:text-black hover:bg-gray-50"
                  }`}
              >
                <tab.icon size={20} />
                <span className="font-bold text-sm whitespace-nowrap">
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-white/30 rounded-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Tabs Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="lg:hidden mt-4 pb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-2 gap-2">
                  {mainTabs.map((tab) => (
                    <Link
                      key={tab.id}
                      to={tab.path}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl transition-all ${activeTab === tab.id
                          ? `${tab.gradient} text-white shadow-md`
                          : "bg-gray-50 text-gray-700 hover:text-black hover:bg-gray-100"
                        }`}
                    >
                      <tab.icon size={18} />
                      <span className="font-bold text-sm">{tab.label}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        {/* Show Dashboard Content Only on Dashboard Page */}
        {location.pathname === "/dashboard" || location.pathname === "/" ? (
          <>
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-8 mb-8 border border-white/50 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Welcome to Accounting Dashboard
                    {user && (
                      <span className="block text-2xl md:text-3xl text-blue-600 mt-2">
                        {user.username?.charAt(0).toUpperCase() + user.username?.slice(1) || 'User'}! 👋
                      </span>
                    )}
                  </motion.h2>
                  <p className="text-gray-600 text-lg max-w-2xl">
                    Manage your business finances, inventory, sales, and reports from one centralized platform.
                  </p>
                </div>
                <div className="flex gap-4">
                  <motion.div
                    className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Activity className="text-blue-600 mb-2" size={24} />
                    <p className="text-sm text-gray-600 font-medium">Real-time Updates</p>
                  </motion.div>
                  <motion.div
                    className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Zap className="text-amber-600 mb-2" size={24} />
                    <p className="text-sm text-gray-600 font-medium">Quick Actions</p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Quick Access Cards Grid */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Quick Access
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">
                    6 Quick Actions
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickAccessCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Link
                      to={card.path}
                      className="group block bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`${card.color} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                            <card.icon size={24} className="text-white" />
                          </div>
                          <ChevronRight
                            size={20}
                            className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all"
                          />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {card.label}
                        </h4>
                        <p className="text-gray-600 text-sm">{card.desc}</p>
                      </div>
                      <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"></div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Dashboard Content */}
            <DashboardStats />
          </>
        ) : location.pathname === "/payment-methods" ? (
          // Payment Methods Page
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PaymentMethodsStats />
          </motion.div>
        ) : (
          // Render other child routes content
          <Outlet />
        )}
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products, sales, reports..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

// Dashboard Stats Component
const DashboardStats = () => {
  const navigate = useNavigate();
  const { products } = useProductsStore();
  const { sales, fetchSales } = useSalesStore();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const stats = [
    {
      label: "Total Products",
      value: products?.length || 0,
      change: "+12%",
      icon: Package,
      color: "from-emerald-500 to-emerald-600",
      path: "/products",
      trend: "up",
    },
    {
      label: "Today's Sales",
      value: sales?.length || 0,
      change: "+8%",
      icon: ShoppingCart,
      color: "from-rose-500 to-rose-600",
      path: "/DailySales",
      trend: "up",
    },
    {
      label: "Inventory Items",
      value: products?.length || 0,
      change: "-2%",
      icon: Boxes,
      color: "from-amber-500 to-amber-600",
      path: "/stock",
      trend: "down",
    },
    {
      label: "Payment Methods",
      value: "4",
      change: "+0%",
      icon: Wallet,
      color: "from-green-500 to-green-600",
      path: "/payment-methods",
      trend: "stable",
    },
    {
      label: "Active Users",
      value: "24",
      change: "+5%",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      path: "/UserDailySales",
      trend: "up",
    },
  ];

  const performanceMetrics = [
    {
      title: "Monthly Revenue",
      value: "$12,458",
      change: "+24%",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Low Stock Items",
      value: products?.filter(p => (p.stock ?? 0) <= (p.lowStockThreshold ?? 5)).length || 0,
      change: "-8%",
      icon: Boxes,
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Accounts Receivable",
      value: "$8,245",
      change: "+18%",
      icon: DollarSign,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Accounts Payable",
      value: "$3,420",
      change: "-5%",
      icon: FileBarChart,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  const recentActivities = [
    { time: "10:30 AM", action: "New sale recorded", amount: "$450", user: "John D." },
    { time: "9:45 AM", action: "Product added to inventory", item: "Laptop Pro", user: "Sarah M." },
    { time: "Yesterday", action: "Monthly report generated", period: "November 2024", user: "System" },
    { time: "Nov 28", action: "Low stock alert", item: "Wireless Mouse", user: "Auto" },
  ];

  const quickActions = [
    {
      label: "Create Product",
      icon: PlusCircle,
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      path: "/createProduct",
    },
    {
      label: "Record Sale",
      icon: ShoppingCart,
      color: "bg-gradient-to-r from-rose-500 to-rose-600",
      path: "/AddSale",
    },
    {
      label: "Payment Methods",
      icon: Wallet,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      path: "/payment-methods",
    },
    {
      label: "View Reports",
      icon: BarChart3,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      path: "/reports",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Statistics Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Overview
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
              whileHover={{ y: -8 }}
              onClick={() => navigate(stat.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <stat.icon size={24} className="text-white" />
                  </div>
                  <div className={`text-sm font-bold ${stat.trend === 'up' ? 'text-emerald-600' : stat.trend === 'down' ? 'text-rose-600' : 'text-gray-600'} ${stat.trend === 'up' ? 'bg-emerald-50' : stat.trend === 'down' ? 'bg-rose-50' : 'bg-gray-50'} px-3 py-1 rounded-full`}>
                    {stat.change}
                    {stat.trend === 'up' && <TrendingUp size={14} className="inline ml-1" />}
                    {stat.trend === 'down' && <TrendingUp size={14} className="inline ml-1 rotate-180" />}
                  </div>
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </h4>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
              <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-200 group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Financial Metrics
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {performanceMetrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${metric.color}`}>
                    <metric.icon size={20} />
                  </div>
                  <span className={`text-sm font-bold ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {metric.change}
                  </span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</h4>
                <p className="text-gray-600 font-medium">{metric.title}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Recent Activity
              </span>
            </h3>
            <button
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
              onClick={() => navigate("/reports")}
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time} • {activity.user}</p>
                </div>
                {activity.amount && (
                  <span className="font-bold text-emerald-600">{activity.amount}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quick Actions
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 text-left"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <action.icon size={26} className="text-white" />
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all"
                />
              </div>
              <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Payment Methods Preview */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Payment Methods Overview
            </span>
          </h3>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            onClick={() => navigate("/payment-methods")}
          >
            View Details
          </button>
        </div>

        {/* Simple payment method summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { method: 'cash', name: 'Cash', icon: Wallet, color: 'bg-gradient-to-r from-green-500 to-green-600' },
              { method: 'zaad', name: 'Zaad', icon: Smartphone, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
              { method: 'edahab', name: 'E-Dahab', icon: CreditCard, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
              { method: 'credit', name: 'Credit', icon: DollarSign, color: 'bg-gradient-to-r from-amber-500 to-amber-600' },
            ].map((item, index) => (
              <div key={item.method} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div className={`${item.color} p-2 rounded-lg`}>
                  <item.icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Click for details</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// PaymentMethodsStats Component (Integrated into Dashboard.jsx)
const PaymentMethodsStats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedMethod, setSelectedMethod] = useState(null);

  const {
    paymentMethodsStats,
    fetchPaymentMethodsStats,
    loading,
    fetchPaymentMethodTransactions,
    paymentMethodTransactions
  } = useSalesStore();

  useEffect(() => {
    fetchPaymentMethodsStats();
  }, []);

  useEffect(() => {
    if (selectedMethod) {
      fetchPaymentMethodTransactions(selectedMethod, selectedPeriod);
    }
  }, [selectedMethod, selectedPeriod]);

  const handleMethodClick = (method) => {
    setSelectedMethod(method);
  };

  const handleViewAll = () => {
    setSelectedMethod(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'cash': return Wallet;
      case 'zaad': return Smartphone;
      case 'edahab': return CreditCard;
      case 'credit': return DollarSign;
      default: return Wallet;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'cash': return "from-green-500 to-green-600";
      case 'zaad': return "from-blue-500 to-blue-600";
      case 'edahab': return "from-purple-500 to-purple-600";
      case 'credit': return "from-amber-500 to-amber-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getMethodName = (method) => {
    switch (method) {
      case 'cash': return "Cash";
      case 'zaad': return "Zaad";
      case 'edahab': return "E-Dahab";
      case 'credit': return "Credit";
      default: return method;
    }
  };

  if (loading && !paymentMethodsStats) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const stats = paymentMethodsStats?.[selectedPeriod] || {};
  const periods = ['today', 'weekly', 'monthly'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Payment Methods
            </span>
          </h3>
          <p className="text-gray-600 mt-1">Track sales by payment method</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={20} />
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(stats).map(([method, data]) => {
          const MethodIcon = getMethodIcon(method);
          const totalPaid = data.totalAmountPaid || 0;
          const totalSales = data.totalSales || 0;
          const count = data.count || 0;

          return (
            <motion.div
              key={method}
              className={`bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${selectedMethod === method ? 'ring-2 ring-blue-500' : ''
                }`}
              whileHover={{ y: -4 }}
              onClick={() => handleMethodClick(method)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getMethodColor(method)}`}>
                    <MethodIcon size={24} className="text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {count} sales
                    </span>
                    <Eye className="text-gray-400" size={16} />
                  </div>
                </div>

                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {getMethodName(method)}
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Paid:</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Sales:</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(totalSales)}
                    </span>
                  </div>

                  {data.totalRemainingBalance > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Balance Due:</span>
                      <span className="font-bold text-amber-600">
                        {formatCurrency(data.totalRemainingBalance)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`h-2 bg-gradient-to-r ${getMethodColor(method)}`}></div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Method Transactions */}
      {selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className={`p-2 rounded-lg ${getMethodColor(selectedMethod).replace('from-', 'bg-gradient-to-r from-')}`}>
                  {(() => {
                    const Icon = getMethodIcon(selectedMethod);
                    return <Icon className="text-white" size={20} />;
                  })()}
                </span>
                {getMethodName(selectedMethod)} Transactions
                <span className="text-sm font-normal text-gray-500 capitalize">
                  ({selectedPeriod})
                </span>
              </h4>
              <p className="text-gray-600 text-sm mt-1">
                Showing all sales processed via {getMethodName(selectedMethod)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleViewAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                View All Methods
              </button>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentMethodTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">
                        {transaction.saleNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {transaction.customerName || 'Walk-in Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amountDue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-emerald-600">
                        {formatCurrency(transaction.amountPaid)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${transaction.remainingBalance > 0 ? 'text-amber-600' : 'text-gray-500'
                        }`}>
                        {formatCurrency(transaction.remainingBalance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${transaction.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : transaction.status === 'partially_paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {transaction.status?.replace('_', ' ') || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paymentMethodTransactions.length === 0 && (
              <div className="text-center py-8">
                <Filter className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500">No transactions found for this period</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      {!selectedMethod && paymentMethodsStats?.summary && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Payment Methods Summary ({selectedPeriod})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Collected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paymentMethodsStats.summary[`${selectedPeriod}Total`] || 0)}
                  </p>
                </div>
                <DollarSign className="text-emerald-600" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(stats).reduce((sum, method) => sum + (method.count || 0), 0)}
                  </p>
                </div>
                <CreditCard className="text-blue-600" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average per Sale</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      Object.values(stats).reduce((sum, method) => sum + (method.totalAmountPaid || 0), 0) /
                      Math.max(Object.values(stats).reduce((sum, method) => sum + (method.count || 0), 0), 1)
                    )}
                  </p>
                </div>
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;