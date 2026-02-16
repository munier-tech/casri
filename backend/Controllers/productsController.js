import { prisma } from "../lib/prisma.js";

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

      createdProducts.push({
        name: name.trim(),
        description: description ? description.trim() : "",
        cost: parseFloat(cost),
        price: price ? parseFloat(price) : parseFloat(cost),
        stock: parseInt(stock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
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

    const savedProducts = await prisma.product.createMany({
      data: createdProducts,
    });

    res.status(201).json({
      success: true,
      message:
        createdProducts.length > 1
          ? "Products created successfully."
          : "Product created successfully.",
      createdCount: savedProducts.count,
      failedCount: failedProducts.length,
      failedProducts,
    });

  } catch (error) {
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

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name ? name.trim() : undefined,
        description: description ? description.trim() : undefined,
        cost: cost !== undefined ? parseFloat(cost) : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        lowStockThreshold:
          lowStockThreshold !== undefined
            ? parseInt(lowStockThreshold)
            : undefined,
        expiryDate:
          expiryDate !== undefined ? new Date(expiryDate) : undefined,
        image: req.file
          ? `/uploads/${req.file.filename}`
          : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================
// GET ALL PRODUCTS
// ==========================
export const getProducts = async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
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
