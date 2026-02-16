import express from "express";
import { uploadImage, convertToBase64 } from "../Controllers/uploadController.js";

const router = express.Router();

// POST /api/upload - Handle image upload/conversion
router.post("/", uploadImage);

// GET /api/upload/help - Get help for image conversion
router.get("/help", convertToBase64);

export default router;