import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats
} from '../Controllers/expenseController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes, except in development when explicitly disabled
if (!(process.env.NODE_ENV === "development" && process.env.DISABLE_AUTH_FOR_EXPENSES === "true")) {
  router.use(protectedRoute);
}

// Expense CRUD routes
router.post("/", protectedRoute , createExpense);
router.get("/", protectedRoute , getExpenses);
router.get("/stats/summary", protectedRoute , getExpenseStats);
router.get("/:id", protectedRoute , getExpenseById);
router.put("/:id", protectedRoute , updateExpense);
router.delete("/:id",  protectedRoute , deleteExpense);

export default router;