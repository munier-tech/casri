import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// CORS CONFIG
// ==========================
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? process.env.CORS_ORIGIN || "https://your-frontend.vercel.app"
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
// DYNAMIC ROUTE IMPORTS
// ==========================
async function loadRoutes() {
  const authRouter = (await import("./Routes/authRoute.js")).default;
  const userRouter = (await import("./Routes/userRoute.js")).default;
  const productRouter = (await import("./Routes/productsRouter.js")).default;
  const historyRouter = (await import("./Routes/historyRoute.js")).default;
  const liabilityRouter = (await import("./Routes/LiabilityRoute.js")).default;
  const financialRouter = (await import("./Routes/financialRoute.js")).default;
  const categoryRouter = (await import("./Routes/categoryRoute.js")).default;
  const SalesRouter = (await import("./Routes/salesRoute.js")).default;
  const uploadRouter = (await import("./Routes/uploadRoute.js")).default;
  const loanRouter = (await import("./Routes/loanRoute.js")).default;
  const accountsReceivableRoutes = (await import("./Routes/accountReceivableRouter.js")).default;
  const purchaseRouter = (await import("./Routes/purchaseRoute.js")).default;
  const VendorRouter = (await import("./Routes/vendorRoute.js")).default;
  const reportRouter = (await import("./Routes/ReportsRoute.js")).default;
  const expenseRoutes = (await import("./Routes/expenseRoute.js")).default;

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
}

// Load routes
await loadRoutes();

// ==========================
// DIAGNOSTIC ROUTE
// ==========================
app.get("/api", (_req, res) => {
  res.json({
    message: "CASRI Inventory Management System API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL === "1" ? "yes" : "no",
  });
});

// ==========================
// ERROR HANDLING
// ==========================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// ==========================
// START SERVER (LOCAL ONLY)
// ==========================
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Vercel: ${process.env.VERCEL === "1" ? "yes" : "no"}`);
  });
}

export default app;