import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { 
  getMonthlyReport, 
  getYearlyReport, 
  getDailyReport
} from "../Controllers/reportController.js";

const router = express.Router();

// Daily report
router.get("/daily-report/:date", protectedRoute, getDailyReport);

// Monthly report
router.get("/monthly-report/:year/:month", protectedRoute, getMonthlyReport);

// Yearly report
router.get("/yearly-report/:year", protectedRoute, getYearlyReport);


export default router;
