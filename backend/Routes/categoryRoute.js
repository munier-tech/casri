import express from "express";
import {
  createCategory,
  updateCategory,
  getCategories,
  getCategoryById,
  deleteCategory
} from "../Controllers/categoryController.js";

import upload  from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", upload.single("image"), createCategory);
router.put("/:id", upload.single("image"), updateCategory);
router.patch("/:id", upload.single("image"), updateCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.delete("/:id", deleteCategory);

export default router;
