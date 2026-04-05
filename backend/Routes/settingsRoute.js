import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { getReceiptSettings, updateReceiptSettings } from "../Controllers/settingsController.js";

const router = express.Router();

router.get("/receipt", protectedRoute, getReceiptSettings);
router.put("/receipt", protectedRoute, updateReceiptSettings);

export default router;
