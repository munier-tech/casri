import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

// Generate access and refresh tokens
export const generateToken = (userId) => {
  const accesstokensecret = process.env.TOKEN_SECRET_KEY;
  const refreshtokensecret = process.env.REFRESH_TOKEN_SECRET_KEY;

  if (!accesstokensecret || !refreshtokensecret) {
    throw new Error("JWT secrets are missing from environment variables");
  }

  const accessToken = jwt.sign({ userId }, accesstokensecret, {
    expiresIn: "1y",
  });

  const refreshToken = jwt.sign({ userId }, refreshtokensecret, {
    expiresIn: "1y",
  });

  return { accessToken, refreshToken };
};

// Store refresh token (No Redis, just a placeholder if needed)
export const storeRefreshToken = async (_userId, _refreshToken) => {
  console.warn(
    "Redis removed: refresh token will not be stored persistently."
  );
};

// Set cookies
export const setCookies = (res, refreshToken, accessToken) => {
  const oneYear = 1000 * 60 * 60 * 24 * 365; // 1 year in ms

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: oneYear,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: oneYear,
  });
};
