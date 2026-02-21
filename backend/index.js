import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// VERBOSE STARTUP LOGGING
// ==========================
console.log('🚀========== SERVER STARTUP ==========');
console.log('📋 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 VERCEL:', process.env.VERCEL === '1' ? 'Yes' : 'No');
console.log('📂 Current directory:', process.cwd());
console.log('📁 __dirname:', __dirname);
console.log('💾 DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('🔑 TOKEN_SECRET_KEY exists:', !!process.env.TOKEN_SECRET_KEY);
console.log('🌐 CLIENT_URL:', process.env.CLIENT_URL);
console.log('=====================================');

// ==========================
// CORS CONFIG
// ==========================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://casri2.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

console.log('🔓 Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      console.log('📡 Request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      console.log('✅ CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for:', origin);
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
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('📦 Headers:', {
    origin: req.headers.origin,
    'content-type': req.headers['content-type'],
    cookie: req.headers.cookie ? 'present' : 'none'
  });
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
  console.log('📁 Uploads directory created');
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
// SIMPLE ROUTE TEST (BEFORE DYNAMIC IMPORTS)
// ==========================
app.get("/api/test", (req, res) => {
  console.log('✅ Test route hit');
  res.json({ message: "Test route working" });
});

app.get("/api/test-auth", (req, res) => {
  console.log('✅ Test auth route hit');
  res.json({ message: "Test auth route working" });
});

// ==========================
// DYNAMIC ROUTE IMPORTS WITH ERROR HANDLING
// ==========================
async function loadRoutes() {
  console.log('📝 Starting route imports...');
  
  try {
    // Try to import auth route first
    console.log('🔍 Attempting to import authRoute...');
    let authRouter;
    try {
      const authModule = await import("./Routes/authRoute.js");
      authRouter = authModule.default;
      console.log('✅ Auth route imported successfully');
      console.log('📋 Auth router type:', typeof authRouter);
      console.log('📋 Auth router is function:', typeof authRouter === 'function');
    } catch (err) {
      console.error('❌ Failed to import authRoute:', err);
      authRouter = express.Router();
      authRouter.get('/error', (req, res) => {
        res.status(500).json({ error: 'Auth route failed to load', details: err.message });
      });
    }

    // Register auth routes
    if (authRouter) {
      app.use("/api/auth", authRouter);
      console.log('✅ Auth routes registered at /api/auth');
    }

    // Try to import other routes
    const routes = [
      { name: 'userRoute', path: '/api/user' },
      { name: 'productsRouter', path: '/api/products' },
      { name: 'categoryRoute', path: '/api/categories' },
      { name: 'salesRoute', path: '/api/sales' },
      { name: 'vendorRoute', path: '/api/vendors' },
      { name: 'purchaseRoute', path: '/api/purchases' },
      { name: 'expenseRoute', path: '/api/expenses' }
    ];

    for (const route of routes) {
      try {
        console.log(`🔍 Importing ${route.name}...`);
        const module = await import(`./Routes/${route.name}.js`);
        if (module.default) {
          app.use(route.path, module.default);
          console.log(`✅ ${route.name} registered at ${route.path}`);
        } else {
          console.error(`❌ ${route.name} has no default export`);
        }
      } catch (err) {
        console.error(`❌ Failed to import ${route.name}:`, err.message);
      }
    }

    console.log('✅ Route loading complete');
  } catch (error) {
    console.error('❌ Fatal error in loadRoutes:', error);
  }
}

// Execute route loading
await loadRoutes();

// ==========================
// ROUTE LIST DEBUG ENDPOINT
// ==========================
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  
  function extractRoutes(stack, basePath = '') {
    if (!stack) return;
    
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push({
          path: basePath + layer.route.path,
          methods
        });
      } else if (layer.name === 'router' && layer.handle?.stack) {
        const routerPath = layer.regexp?.source
          ?.replace('\\/?(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\^/g, '')
          .replace(/\?/g, '') || '';
        
        extractRoutes(layer.handle.stack, routerPath);
      }
    });
  }
  
  extractRoutes(app._router?.stack);
  
  const apiRoutes = routes.filter(r => r.path.includes('/api/'));
  
  res.json({
    totalRoutes: apiRoutes.length,
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL === "1" ? "yes" : "no",
    routes: apiRoutes.sort((a, b) => a.path.localeCompare(b.path))
  });
});

// ==========================
// 404 HANDLER
// ==========================
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method,
    message: `Route ${req.method} ${req.path} not found`
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