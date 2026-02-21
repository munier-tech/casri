// backend/index.js
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Load environment variables FIRST
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// ENVIRONMENT CHECK
// ==========================
console.log('🚀 Starting server...');
console.log('📋 Environment:', process.env.NODE_ENV);
console.log('🔧 Vercel:', process.env.VERCEL === '1' ? 'Yes' : 'No');
console.log('💾 Database URL exists:', !!process.env.DATABASE_URL);

// ==========================
// CORS CONFIG
// ==========================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://casri2.vercel.app', // Your frontend URL
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================
// REQUEST LOGGER
// ==========================
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==========================
// UPLOADS DIRECTORY (Local only)
// ==========================
const uploadsDir = path.join(process.cwd(), "uploads");

if (!process.env.VERCEL) {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));
}

// ==========================
// HEALTH CHECK
// ==========================
app.get("/health", (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL === "1" ? "yes" : "no",
    database: process.env.DATABASE_URL ? "configured" : "missing"
  });
});

// ==========================
// DYNAMIC ROUTE IMPORTS
// ==========================
async function loadRoutes() {
  try {
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

    console.log('✅ All routes loaded successfully');
  } catch (error) {
    console.error('❌ Error loading routes:', error);
  }
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
    database: process.env.DATABASE_URL ? "connected" : "disconnected",
    routes: [
      "/api/auth",
      "/api/user",
      "/api/products",
      "/api/categories",
      "/api/sales",
      "/api/vendors",
      "/api/purchases",
      "/api/expenses"
    ]
  });
});

// ==========================
// 404 HANDLER
// ==========================
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  });
});

// ==========================
// ERROR HANDLING
// ==========================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==========================
// START SERVER (LOCAL ONLY)
// ==========================
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 CORS enabled for: ${allowedOrigins.join(', ')}`);
  });
}

export default app;