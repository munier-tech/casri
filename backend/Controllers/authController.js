import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken, setCookies } from "../helpers/authHelper.js";

// ==========================
// SIGN UP
// ==========================
export const signUp = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    const userRole = role ? role.toUpperCase() : undefined;

    if (!username || !password || !email) {
      return res.status(400).json({
        message: "Please provide username, password and email",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    const { accessToken, refreshToken } = generateToken(user.id);

    setCookies(res, refreshToken, accessToken);

    res.status(200).json({
      success: true,
      message: "User created successfully",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error("Error in signing up user", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// SIGN IN
// ==========================
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Both email and password are incorrect",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Both email and password are incorrect",
      });
    }

    const { accessToken, refreshToken } = generateToken(user.id);

    setCookies(res, refreshToken, accessToken);

    res.status(200).json({
      success: true,
      message: "Sign in successful",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error("Error in signing in user", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// REFRESH TOKEN
// ==========================
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(404).json({
        message: "No refresh token provided",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "1y" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });

  } catch (error) {
    console.error("Error in refreshToken", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// ==========================
// GET PROFILE
// ==========================
export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: No user data found",
      });
    }

    res.status(200).json({
      user: req.user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================
// LOG OUT
// ==========================
export const LogOut = async (_req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Error in logout user", error);
    res.status(500).json({ message: error.message });
  }
};
