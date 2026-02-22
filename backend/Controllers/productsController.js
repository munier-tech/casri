import { prisma } from "../lib/prisma.js";

const normalizeBarcode = (value) => {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
};

const INT32_MAX = 2147483647;

const parseNonNegativeInt = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    return { error: "must be a non-negative integer" };
  }
  if (parsed > INT32_MAX) {
    return { error: `must be <= ${INT32_MAX}` };
  }
  return parsed;
};

const isBarcodeUnsupportedError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.code === "P2022" ||
    (message.includes("barcode") && message.includes("column")) ||
    (message.includes("unknown argument") && message.includes("barcode")) ||
    (message.includes("barcode") && message.includes("out of range") && message.includes("integer"))
  );
};

// ==========================
// CREATE PRODUCT (Single or Bulk)
// ==========================
export const createProduct = async (req, res) => {
  try {
    const body = req.body || {};
    const products = Array.isArray(body.products) ? body.products : [body];

    if (!products.length) {
      return res.status(400).json({
        success: false,
        error: "Please send at least one product to create.",
      });
    }

    const createdProducts = [];
    const failedProducts = [];

    for (const item of products) {
      const {
        name,
        barcode,
        description,
        cost,
        stock,
        lowStockThreshold,
        price,
        expiryDate,
      } = item || {};

      if (!name || !cost) {
        failedProducts.push({
          ...item,
          reason: "Product name and cost are required",
        });
        continue;
      }

      const parsedStock = parseNonNegativeInt(stock, 0);
      if (typeof parsedStock === "object" && parsedStock.error) {
        failedProducts.push({
          ...item,
          reason: `Invalid stock: ${parsedStock.error}`,
        });
        continue;
      }

      const parsedLowStock = parseNonNegativeInt(lowStockThreshold, 5);
      if (typeof parsedLowStock === "object" && parsedLowStock.error) {
        failedProducts.push({
          ...item,
          reason: `Invalid lowStockThreshold: ${parsedLowStock.error}`,
        });
        continue;
      }

      createdProducts.push({
        name: name.trim(),
        barcode: normalizeBarcode(barcode),
        description: description ? description.trim() : "",
        cost: parseFloat(cost),
        price: price ? parseFloat(price) : parseFloat(cost),
        stock: parsedStock,
        lowStockThreshold: parsedLowStock,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        image: req.file ? `/uploads/${req.file.filename}` : "",
      });
    }

    if (createdProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found to create.",
        failedProducts,
      });
    }

    const isBulk = createdProducts.length > 1 || Array.isArray(body.products);
    let createdCount = 0;
    let createdProduct = null;

    if (isBulk) {
      try {
        const result = await prisma.product.createMany({
          data: createdProducts,
        });
        createdCount = result.count;
      } catch (error) {
        if (!isBarcodeUnsupportedError(error)) throw error;

        const fallbackData = createdProducts.map(({ barcode, ...rest }) => rest);
        const fallbackResult = await prisma.product.createMany({
          data: fallbackData,
        });
        createdCount = fallbackResult.count;
      }
    } else {
      const singleData = createdProducts[0];
      try {
        createdProduct = await prisma.product.create({
          data: singleData,
        });
      } catch (error) {
        if (!isBarcodeUnsupportedError(error)) throw error;
        const { barcode, ...fallbackData } = singleData;
        createdProduct = await prisma.product.create({
          data: fallbackData,
        });
      }
      createdCount = createdProduct ? 1 : 0;
    }

    res.status(201).json({
      success: true,
      message: isBulk ? "Products created successfully." : "Product created successfully.",
      product: createdProduct,
      createdCount,
      failedCount: failedProducts.length,
      failedProducts,
    });

  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Barcode already exists. Please use a unique barcode.",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================
// UPDATE PRODUCT
// ==========================
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      barcode,
      description,
      cost,
      stock,
      lowStockThreshold,
      price,
      expiryDate,
    } = req.body || {};

    const existingProduct = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    const updateData = {
      name: name ? name.trim() : undefined,
      barcode: normalizeBarcode(barcode),
      description: description ? description.trim() : undefined,
      cost: cost !== undefined ? parseFloat(cost) : undefined,
      price: price !== undefined ? parseFloat(price) : undefined,
      stock: undefined,
      lowStockThreshold:
        undefined,
      expiryDate:
        expiryDate !== undefined ? new Date(expiryDate) : undefined,
      image: req.file
        ? `/uploads/${req.file.filename}`
        : undefined,
    };

    if (stock !== undefined) {
      const parsedStock = parseNonNegativeInt(stock, 0);
      if (typeof parsedStock === "object" && parsedStock.error) {
        return res.status(400).json({
          success: false,
          error: `Invalid stock: ${parsedStock.error}`,
        });
      }
      updateData.stock = parsedStock;
    }

    if (lowStockThreshold !== undefined) {
      const parsedLowStock = parseNonNegativeInt(lowStockThreshold, 5);
      if (typeof parsedLowStock === "object" && parsedLowStock.error) {
        return res.status(400).json({
          success: false,
          error: `Invalid lowStockThreshold: ${parsedLowStock.error}`,
        });
      }
      updateData.lowStockThreshold = parsedLowStock;
    }

    let updatedProduct;
    try {
      updatedProduct = await prisma.product.update({
        where: { id: req.params.id },
        data: updateData,
      });
    } catch (error) {
      if (!isBarcodeUnsupportedError(error)) throw error;
      const { barcode, ...fallbackData } = updateData;
      updatedProduct = await prisma.product.update({
        where: { id: req.params.id },
        data: fallbackData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Barcode already exists. Please use a unique barcode.",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================
// GET ALL PRODUCTS
// ==========================
export const getProducts = async (_req, res) => {
  try {
    const search = (_req.query?.search || "").trim();
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { barcode: { contains: search } },
          ],
        }
      : undefined;

    let products;
    try {
      products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      if (!isBarcodeUnsupportedError(error)) throw error;

      const fallbackWhere = { ...where };
      if (Array.isArray(fallbackWhere.OR)) {
        fallbackWhere.OR = fallbackWhere.OR.filter((cond) => !Object.prototype.hasOwnProperty.call(cond, "barcode"));
      }

      products = await prisma.product.findMany({
        where: fallbackWhere,
        orderBy: { createdAt: "desc" },
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================
// SEARCH PRODUCTS (for vendor + general search)
// ==========================
export const searchProducts = async (req, res) => {
  try {
    const q = (req.query?.q || "").trim();
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    let products;
    try {
      products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q } },
          ],
        },
        orderBy: { name: "asc" },
        take: 20,
      });
    } catch (error) {
      if (!isBarcodeUnsupportedError(error)) throw error;
      products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { name: "asc" },
        take: 20,
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================
// DELETE PRODUCT
// ==========================
export const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Alaab Lama helin",
      });
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: "ALaabta si guul leh ayaa la tirtiray",
      deletedProduct: product,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================
// GET PRODUCT BY ID
// ==========================
export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Alaab Lama helin",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================
// GET LOW STOCK PRODUCTS
// ==========================
export const getLowStockProducts = async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.lowStockThreshold,
        },
      },
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
