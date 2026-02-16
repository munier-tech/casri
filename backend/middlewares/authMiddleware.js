import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken"

export const protectedRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "UNAUTHORIZED - no accessToken is provided" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET_KEY);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: "UNAUTHORIZED - no user found" });
      }

      req.user = user; // ✅ set the full user in req.user
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "UNAUTHORIZED - accessToken is expired" });
      }

      // Catch all JWT errors
      return res.status(401).json({ message: "UNAUTHORIZED - token error", error: error.message });
    }
  } catch (error) {
    console.error("Error in protectedRoute middleware:", error);
    res.status(500).json({ message: error.message });
  }
};

export const adminRoute = async (req, res, next) => {
  try {

    const user = req.user;
    const userRole = user?.role?.toUpperCase();

    if (user && (userRole === "ADMIN" || userRole === "EMPLOYEE")) {
      next();
    }
    else {
      return res.status(403).json({ message: "Forbidden - you have no access you aren't an admin or employee" });
    }


  } catch (error) {
    console.error(" error in  adminRoute", error);
    res.status(500).json({ message: error.message })
  }
}


export const EmployeeRoute = async (req, res, next) => {
  try {
    const userRole = req.user?.role?.toUpperCase();

    if (req.user && (userRole === "EMPLOYEE" || userRole === "ADMIN")) {
      next();
    }
    else {
      return res.status(401).json({ message: "UNAUTHORIZED - you have no access to sale a product" })
    }
  } catch (error) {
    console.error(" error in  employeeRoute", error);
    res.status(500).json({ message: error.message })
  }
}