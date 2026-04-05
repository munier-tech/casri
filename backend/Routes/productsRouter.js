import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { createProduct, deleteProduct, getLowStockProducts, getProductById, getProducts, searchProducts, updateProduct } from "../Controllers/productsController.js";


const router = express.Router();

router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/low-stock", getLowStockProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.single("image"), updateProduct);
router.patch("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
