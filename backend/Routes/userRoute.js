import express from "express";
import { deleteUser, getAllUsers, getUserById, getUserProfile } from "../Controllers/userController.js";
import { adminRoute, protectedRoute } from "../middlewares/authMiddleware.js";
const router = express.Router();


router.get("/getAll" , protectedRoute , getAllUsers)
router.get("/getUserById/:id", protectedRoute , getUserById)
router.get("/getUserProfile",protectedRoute , getUserProfile)
router.delete("/deleteUser/:id",protectedRoute , adminRoute , deleteUser)



export default router;