import express from "express"
import { createFinancialIncome, getFinancialLogsByDate, updateFinancialLog } from "../Controllers/financialLog.js"
import { adminRoute, protectedRoute } from "../middlewares/authMiddleware.js"
const router = express.Router()



router.post("/create" , protectedRoute ,  adminRoute  ,  createFinancialIncome)
router.get("/get/:date" , protectedRoute ,  adminRoute  ,  getFinancialLogsByDate)
router.patch('/update/:id', updateFinancialLog);





export default router