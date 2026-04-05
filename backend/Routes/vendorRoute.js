import express from 'express';

import { protectedRoute } from '../middlewares/authMiddleware.js';
import { 
  testVendorAPI,
  createVendor,
  getVendors,
  getVendor,
  updateVendor,
  deleteVendor,
  createPurchase,
  getVendorPurchases,
  updatePurchase,
  deletePurchase
} from '../Controllers/vendorsController.js';

const router = express.Router();

// Test route (no auth required for testing)
router.get('/test', testVendorAPI);

// Vendor CRUD - All protected
router.post('/', protectedRoute, createVendor);
router.get('/', protectedRoute, getVendors);
router.get('/:id', protectedRoute, getVendor);
router.put('/:id', protectedRoute, updateVendor);
router.delete('/:id', protectedRoute, deleteVendor);

// Vendor purchases - Protected
router.post('/:vendorId/purchases', protectedRoute, createPurchase);
router.get('/:vendorId/purchases', protectedRoute, getVendorPurchases);
router.put('/:vendorId/purchases/:purchaseId', protectedRoute, updatePurchase);
router.delete('/:vendorId/purchases/:purchaseId', protectedRoute, deletePurchase);

export default router;