import { Link } from "react-router-dom";
import { Lock, LogOut, UserPlus, LogIn, Home, ShoppingBag, Loader, Boxes, DollarSign } from "lucide-react";
import useProductsStore from "@/store/useProductsStore";
import { useUserStore } from "@/store/useUserStore";

const Navbar = () => {
  const { user, isLoading, dashboardAdmin, signOut } = useUserStore();
  const { products, fetchProducts } = useProductsStore();

  const lowOrSoldCount = Array.isArray(products)
    ? products.reduce((acc, p) => {
        const threshold = Number(p.lowStockThreshold ?? 5);
        const stock = Number(p.stock ?? 0);
        if (stock <= 0 || stock <= threshold) return acc + 1;
        return acc;
      }, 0)
    : 0;

  const handleLogout = () => {
    signOut();
  };

  return (
    <header className="fixed w-full top-0 bg-white  z-50 border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-white text-black bg-clip-text">
                CASRI
              </h1>
              <p className="text-2xl font-bold bg-white text-black bg-clip-text -mt-2">
                INVENTORY
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <div
              className="hidden items-center px-3 py-2 rounded-lg text-sm font-medium text-black hover:bg-white/10 transition-colors"
            >
              <Home className="mr-1" size={18} />
              <span className="hidden sm:inline">bogga hore</span>
            </div>

            {user && dashboardAdmin() && (
              <>
                <Link
                  to="/DailySales"
                  className="hidden items-center px-3 py-2 rounded-lg text-sm font-medium text-black hover:bg-white/10 transition-colors"
                >
                  <ShoppingBag className="mr-1" size={18} />
                  <span className="hidden sm:inline">Iibka</span>
                </Link>

                <Link
                  to="/stock"
                  className="relative flex items-center px-3 py-2 rounded-lg text-sm font-medium text-black hover:bg-white/10 transition-colors"
                >
                  <Boxes className="mr-1" size={18} />
                  <span className="hidden sm:inline">Qolka Alaabta</span>
                  {lowOrSoldCount > 0 && (
                    <span className="ml-2 text-xs text-white bg-rose-600 rounded-full px-2 py-0.5">{lowOrSoldCount}</span>
                  )}
                </Link>

                <Link
                  to="/loans"
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-bold text hover:bg-white/10 transition-colors"
                >
                  <DollarSign className="mr-1" size={18} />
                  <span className="hidden sm:inline">Deynta</span>
                </Link>

                <Link
                  to="/Dashboard"
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
                >
                  <Lock className="mr-1" size={18} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 ${
                  isLoading ? "cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <Loader className="animate-spin mr-1" size={18} />
                ) : (
                  <LogOut className="mr-1" size={18} />
                )}
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <UserPlus className="mr-1" size={18} />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>

                <Link
                  to="/signin"
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="mr-1" size={18} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
