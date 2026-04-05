import express from "express";
import {
  createLoan,
  getLoans,
  updateLoan,
  deleteLoan,
  getLoanById,
  markLoanAsPaid,
  getLoanStats
} from "../Controllers/loanController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes, except in development when explicitly disabled
if (!(process.env.NODE_ENV === "development" && process.env.DISABLE_AUTH_FOR_LOANS === "true")) {
  router.use(protectedRoute);
}

// Loan CRUD routes
router.post("/", createLoan);
router.get("/", getLoans);
router.get("/stats", getLoanStats);
router.get("/:id", getLoanById);
router.put("/:id", updateLoan);
router.patch("/:id/pay", markLoanAsPaid);
router.delete("/:id", deleteLoan);

export default router;