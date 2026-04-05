import express from "express";
import { adminRoute, protectedRoute } from "../middlewares/authMiddleware.js";
import { deleteAllHistory, deleteUserHistory, getAllUserSaleHistory, getAllUsersHistory, getLiabilityByDate, getMyDailySales, getProductsSoldByDate, getSingleUserHistoryByDate } from "../Controllers/historyController.js";
const router = express.Router();



router.get("/myDailySales", protectedRoute ,   getMyDailySales)
router.get("/myHistory", protectedRoute ,   getAllUserSaleHistory)
router.get("/getAll", protectedRoute , adminRoute ,    getAllUsersHistory)
router.get("/user/:userId/:date", protectedRoute , adminRoute ,   getSingleUserHistoryByDate)
router.get("/product-date/:date", protectedRoute , adminRoute ,   getProductsSoldByDate)
router.get("/Liability-date/:date", protectedRoute , adminRoute ,   getLiabilityByDate)
router.delete("/deleteAll", protectedRoute , adminRoute ,    deleteAllHistory)
router.delete("/user/:userId/:date", protectedRoute , adminRoute ,   deleteUserHistory)




export default router;