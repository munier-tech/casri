import express from "express";
import { collectReceivablePayment, getAccountsReceivable, getReceivableDetails, getReceivableSummary, searchReceivablesByCustomer, updateReceivable } from "../Controllers/accountReceivableController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";


const router = express.Router();

// All routes require authentication

// Get all accounts receivable with filters
router.get("/", protectedRoute , getAccountsReceivable);

// Get receivable summary statistics
router.get("/summary",  protectedRoute ,getReceivableSummary);

// Search receivables by customer
router.get("/search",  protectedRoute , searchReceivablesByCustomer);


// Get receivable details by ID
router.get("/:id",  protectedRoute , getReceivableDetails);

// Collect payment for a receivable
router.post("/:id/collect",  protectedRoute , collectReceivablePayment);

// Update receivable (due date, notes, etc.)
router.put("/:id",  protectedRoute ,updateReceivable);

export default router;