import { Loader, Lock, LogIn, Mail, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, isLoading } = useUserStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(formData);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-white to-purple-50 p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 backdrop-blur-sm">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center relative overflow-hidden">
            {/* Animated decorative elements */}
            <motion.div 
              className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/10"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 8,
                ease: "easeInOut"
              }}
            ></motion.div>
            <motion.div 
              className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/10"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 10,
                ease: "easeInOut"
              }}
            ></motion.div>
            
            <motion.h2
              className="text-3xl font-bold text-white relative z-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Welcome Back
            </motion.h2>
            <motion.p 
              className="mt-2 text-white/90 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Sign in to access your account
            </motion.p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-5">
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-all duration-300 hover:border-gray-300"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-all duration-300 hover:border-gray-300"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={showPassword ? "show" : "hide"}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.1 }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Remember Me Checkbox */}
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center focus:outline-none"
                >
                  <div className={`w-5 h-5 flex items-center justify-center border-2 rounded-md transition-all duration-200 ${
                    rememberMe 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-white border-gray-300 hover:border-blue-500'
                  }`}>
                    {rememberMe && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    )}
                  </div>
                  <label className="ml-2 block text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                    Remember me
                  </label>
                </button>
              </div>

              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot password?
              </a>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <span className="relative flex items-center">
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <LogIn className="h-5 w-5 mr-2" />
                )}
                Sign In
              </span>
            </motion.button>

            {/* Sign Up Link */}
            <motion.div 
              className="text-center text-sm text-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Don't have an account?{" "}
              <Link
                to="/signUp"
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Sign up now
              </Link>
            </motion.div>
          </form>

          {/* Footer Decoration */}
          <div className="px-8 pb-6">
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional decorative elements */}
        <motion.div 
          className="absolute -z-10 top-1/4 -left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -z-10 bottom-1/4 -right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
};

export default SignIn;