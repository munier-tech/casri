// routes/purchaseRoutes.js
import express from "express";
import {
  addPurchase,
  getAllPurchases,
  getDailyPurchases,
  updatePurchase,
  deletePurchase,
} from "../Controllers/purchaseController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new purchase
router.post("/", protectedRoute, addPurchase);

// Get all purchases (for logged-in user)
router.get("/", protectedRoute, getAllPurchases);

// Get today's purchases
router.get("/daily", protectedRoute, getDailyPurchases);

// Update purchase by ID
router.put("/:id", protectedRoute, updatePurchase);

// Delete purchase by ID
router.delete("/:id", protectedRoute, deletePurchase);

export default router;
