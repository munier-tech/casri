import express from "express";
import { getProfile, LogOut, refreshToken, signIn, signUp } from "../Controllers/authController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
const router = express.Router();


router.post("/signUp" , signUp)
router.post("/signIn" , signIn)
router.post("/refreshToken" , refreshToken)

// Allow disabling auth for getProfile in preview/testing environments
const requireAuth = process.env.DISABLE_AUTH === "true" ? (_req, _res, next) => next() : protectedRoute;
router.get("/getProfile" , requireAuth, getProfile)

router.post("/logOut" , LogOut)



export default router;