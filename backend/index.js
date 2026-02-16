import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";

import authRouter from "./Routes/authRoute.js";
import userRouter from "./Routes/userRoute.js";
import productRouter from "./Routes/productsRouter.js";
import historyRouter from "./Routes/historyRoute.js";
import liabilityRouter from "./Routes/LiabilityRoute.js";
import financialRouter from "./Routes/financialRoute.js";
import categoryRouter from "./Routes/categoryRoute.js";
import SalesRouter from "./Routes/salesRoute.js";
import uploadRouter from "./Routes/uploadRoute.js";
import loanRouter from "./Routes/loanRoute.js";
import accountsReceivableRoutes from "./Routes/accountReceivableRouter.js";
import purchaseRouter from "./Routes/purchaseRoute.js";
import VendorRouter from "./Routes/vendorRoute.js";
import reportRouter from "./Routes/ReportsRoute.js";
import expenseRoutes from "./Routes/expenseRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// CORS CONFIG
// ==========================
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CORS_ORIGIN
      : "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ==========================
// REQUEST LOGGER
// ==========================
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==========================
// UPLOADS (LOCAL ONLY)
// ==========================
const uploadsDir = path.join(process.cwd(), "uploads");

if (process.env.VERCEL !== "1") {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));
}

// ==========================
// DIAGNOSTIC ROUTE
// ==========================
app.get("/api", (_req, res) => {
  res.json({
    message: "CASRI Inventory Management System API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials,
    },
    database: "Connected via Prisma",
  });
});

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/history", historyRouter);
app.use("/api/liability", liabilityRouter);
app.use("/api/financial", financialRouter);
app.use("/api/sales", SalesRouter);
app.use("/api/loans", loanRouter);
app.use("/api/purchases", purchaseRouter);
app.use("/api/reports", reportRouter);
app.use("/api/vendors", VendorRouter);
app.use("/api/expenses", expenseRoutes);
app.use("/api/receivables", accountsReceivableRoutes);

// ==========================
// START SERVER (LOCAL ONLY)
// ==========================
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(
      `CORS Origin: ${
        process.env.NODE_ENV === "production"
          ? process.env.CORS_ORIGIN
          : "http://localhost:5173"
      }`
    );
  });
}

export default app;
