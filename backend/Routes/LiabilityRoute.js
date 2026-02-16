import express from "express";
import {  addLiabilityToDailySales, deleteLiability, getAllLiabilities, getDailyLiability, markLiabilityAsPaid } from "../Controllers/liabilityController.js";
import {  adminRoute, protectedRoute } from "../middlewares/authMiddleware.js";
const router = express.Router();



router.post("/addLiability" , protectedRoute , adminRoute,  addLiabilityToDailySales);
router.get("/getAll" , protectedRoute , adminRoute,  getAllLiabilities);
router.patch("/paid/:id" , protectedRoute , adminRoute,  markLiabilityAsPaid);
router.get("/daily" , protectedRoute , adminRoute,  getDailyLiability);
router.delete("/delete/:id" , protectedRoute , adminRoute,  deleteLiability);




export default router;