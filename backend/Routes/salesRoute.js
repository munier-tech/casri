import express from "express";
import {
  createSaleByDate,
  createMultipleProductsSale,
  searchProductsForSale,
  getSales,
  getSaleById,
  getDailySalesSummary,
  updateSale,
  deleteSale,
  getSalesByDateRange,
  getDailySales,
  getMyDailySales,
  getUsersDailySales,
  getSalesByDate,
  getAllUsersSalesByDate,
  // Add these new imports
  getAccountsReceivable,
  addPaymentToSale,  // ADD THIS IMPORT!
  getPaymentMethodsStats,
  getPaymentMethodTransactions
} from "../Controllers/salesController.js";
import { adminRoute, protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ========== NEW SYSTEM ROUTES ==========

// Product search for sales
router.get("/products/search", protectedRoute, searchProductsForSale);

// Create sales
router.post("/", protectedRoute, createMultipleProductsSale);
router.post("/by-date", protectedRoute, createSaleByDate);
router.post("/multiple", protectedRoute, createMultipleProductsSale);

// Sales data
router.get("/", protectedRoute, getSales);

// ⚠️⚠️⚠️ CRITICAL: This MUST come BEFORE /:id ⚠️⚠️⚠️
router.get("/receivables", protectedRoute, getAccountsReceivable);

// ⚠️⚠️⚠️ This comes AFTER /receivables ⚠️⚠️⚠️
router.get("/:id", protectedRoute, getSaleById);

// ⚠️⚠️⚠️ ADD THIS NEW ROUTE FOR PAYMENTS ⚠️⚠️⚠️
router.post("/:id/payment", protectedRoute, addPaymentToSale);

router.get("/daily/summary", protectedRoute, getDailySalesSummary);
router.get("/date-range/:startDate/:endDate", protectedRoute, getSalesByDateRange);

// Update and delete
router.put("/:id", protectedRoute, updateSale);
router.delete("/:id", protectedRoute, deleteSale);

// ========== DAILY SALES ROUTES (OLD SYSTEM COMPATIBILITY) ==========

router.get("/daily/today", protectedRoute, getDailySales);
router.get("/daily/my", protectedRoute, getMyDailySales);
router.get("/daily/users", protectedRoute, adminRoute, getUsersDailySales);
router.get("/date/:date", protectedRoute, getSalesByDate);
router.get("/all/date/:date", protectedRoute, adminRoute, getAllUsersSalesByDate);
router.get('/payment-methods/stats', protectedRoute, getPaymentMethodsStats);
router.get('/payment-methods/:method/transactions/:period', protectedRoute, getPaymentMethodTransactions);

export default router;