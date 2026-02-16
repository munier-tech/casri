import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

// ========== HELPER FUNCTIONS ==========
const MAP_PAYMENT_METHOD = {
  'cash': 'CASH',
  'zaad': 'ZAAD',
  'edahab': 'EDAHAB',
  'credit': 'CREDIT'
};

const MAP_SALE_STATUS = {
  'pending': 'PENDING',
  'completed': 'COMPLETED',
  'partially_paid': 'PARTIALLY_PAID',
  'cancelled': 'CANCELLED',
  'refunded': 'REFUNDED',
  'overdue': 'OVERDUE'
};

const validatePaymentMethod = (paymentMethod) => {
  const validPaymentMethods = ['cash', 'zaad', 'edahab', 'credit'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    throw new Error(`Invalid payment method '${paymentMethod}'. Valid options: ${validPaymentMethods.join(', ')}`);
  }
  return true;
};

// Calculate totals
const calculateSaleTotals = (products, discountPercentage = 0, discountAmount = 0) => {
  const subtotal = products.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const discountTotal = discountPercentage > 0
    ? (discountPercentage / 100) * subtotal
    : discountAmount;
  const grandTotal = subtotal - discountTotal;

  return { subtotal, discountTotal, grandTotal };
};

// Generate unique sale number
const generateSaleNumber = () => {
  return `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const determineSaleStatus = (paid, due) => {
  if (paid >= due) return 'COMPLETED';
  if (paid > 0) return 'PARTIALLY_PAID';
  return 'PENDING';
};

// ========== MAIN SALE FUNCTIONS ==========

// ✅ Create Multiple Products Sale (New System with amountDue and amountPaid)
export const createMultipleProductsSale = async (req, res) => {
  try {
    const {
      products,
      discountPercentage = 0,
      discountAmount = 0,
      paymentMethod = 'cash',
      amountDue, // Total amount customer owes
      amountPaid, // Amount customer actually paid
      saleDate,
      customerName,
      customerPhone,
      notes,
      dueDate // Optional due date for credit sales
    } = req.body;

    // Validate input
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, error: "At least one product is required" });
    }

    // Validate payment method
    try { validatePaymentMethod(paymentMethod); } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const dueAmt = parseFloat(amountDue);
    const paidAmt = parseFloat(amountPaid);

    // Validate amounts
    if (isNaN(dueAmt) || dueAmt <= 0) {
      return res.status(400).json({ success: false, error: "Amount due is required and must be greater than 0" });
    }
    if (isNaN(paidAmt) || paidAmt < 0) {
      return res.status(400).json({ success: false, error: "Amount paid cannot be negative" });
    }
    if (paidAmt > dueAmt) {
      return res.status(400).json({ success: false, error: "Amount paid cannot exceed amount due" });
    }

    const validatedProducts = [];
    const stockUpdates = [];
    let totalQuantity = 0;

    // Validate each product and check stock
    for (const item of products) {
      const { productId, quantity, sellingPrice, discount = 0 } = item;
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(404).json({ success: false, error: `Product not found for ID: ${productId}` });
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      const itemTotal = sellingPrice * quantity;
      const itemDiscount = (discount / 100) * itemTotal;
      const itemNet = itemTotal - itemDiscount;

      validatedProducts.push({
        productId,
        name: product.name,
        quantity,
        sellingPrice,
        discount,
        itemTotal,
        itemDiscount,
        itemNet
      });

      stockUpdates.push({ productId, quantity });
      totalQuantity += quantity;
    }

    // Calculate totals
    const { subtotal, discountTotal, grandTotal } = calculateSaleTotals(validatedProducts, discountPercentage, discountAmount);

    // Determine status
    let status = determineSaleStatus(paidAmt, dueAmt);

    // Transactional Create
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Update stock
      for (const update of stockUpdates) {
        await tx.product.update({
          where: { id: update.productId },
          data: { stock: { decrement: update.quantity } }
        });
      }

      // 2. Create Sale
      return tx.sale.create({
        data: {
          saleNumber: generateSaleNumber(),
          subtotal,
          discountPercentage,
          discountAmount: discountTotal,
          grandTotal,
          amountDue: dueAmt,
          amountPaid: paidAmt,
          remainingBalance: Math.max(0, dueAmt - paidAmt),
          changeAmount: paidAmt > dueAmt ? paidAmt - dueAmt : 0,
          paymentMethod: MAP_PAYMENT_METHOD[paymentMethod],
          totalQuantity,
          userId: req.user.id || req.user._id,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          notes: notes || null,
          status: status,
          dueDate: dueDate ? new Date(dueDate) : null,
          createdAt: saleDate ? new Date(saleDate) : new Date(),
          products: {
            create: validatedProducts.map(p => ({
              productId: p.productId,
              name: p.name,
              quantity: p.quantity,
              sellingPrice: p.sellingPrice,
              discount: p.discount,
              itemTotal: p.itemTotal,
              itemDiscount: p.itemDiscount,
              itemNet: p.itemNet
            }))
          },
          paymentHistory: {
            create: {
              amount: paidAmt,
              paymentMethod: MAP_PAYMENT_METHOD[paymentMethod],
              collectedById: req.user.id || req.user._id,
              notes: paidAmt >= dueAmt ? 'Full payment' : 'Partial payment'
            }
          }
        },
        include: { products: true, paymentHistory: true }
      });
    });

    res.status(201).json({
      success: true,
      message: amountPaid >= amountDue ? "Sale completed successfully" : "Sale recorded with partial payment",
      data: sale
    });

  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Create Sale By Date
export const createSaleByDate = async (req, res) => {
  try {
    const {
      products,
      discountPercentage = 0,
      discountAmount = 0,
      paymentMethod = 'cash',
      amountDue,
      amountPaid,
      saleDate,
      customerName,
      customerPhone,
      notes,
      dueDate
    } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, error: "At least one product is required" });
    }

    const saleDateTime = dayjs(saleDate);
    if (!saleDateTime.isValid()) {
      return res.status(400).json({ success: false, error: "Invalid sale date format. Use YYYY-MM-DD" });
    }

    if (saleDateTime.isAfter(dayjs(), 'day')) {
      return res.status(400).json({ success: false, error: "Sale date cannot be in the future" });
    }

    const dueAmt = parseFloat(amountDue);
    const paidAmt = parseFloat(amountPaid);

    if (isNaN(dueAmt) || dueAmt <= 0) {
      return res.status(400).json({ success: false, error: "Amount due is required and must be greater than 0" });
    }
    if (isNaN(paidAmt) || paidAmt < 0) {
      return res.status(400).json({ success: false, error: "Amount paid cannot be negative" });
    }
    if (paidAmt > dueAmt) {
      return res.status(400).json({ success: false, error: "Amount paid cannot exceed amount due" });
    }

    const validatedProducts = [];
    const stockUpdates = [];
    let totalQuantity = 0;

    for (const item of products) {
      const { productId, quantity, sellingPrice, discount = 0 } = item;
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(404).json({ success: false, error: `Product not found for ID: ${productId}` });
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      const itemTotal = sellingPrice * quantity;
      const itemDiscount = (discount / 100) * itemTotal;
      const itemNet = itemTotal - itemDiscount;

      validatedProducts.push({
        productId,
        name: product.name,
        quantity,
        sellingPrice,
        discount,
        itemTotal,
        itemDiscount,
        itemNet
      });

      stockUpdates.push({ productId, quantity });
      totalQuantity += quantity;
    }

    const { subtotal, discountTotal, grandTotal } = calculateSaleTotals(validatedProducts, discountPercentage, discountAmount);

    let status = determineSaleStatus(paidAmt, dueAmt);

    const sale = await prisma.$transaction(async (tx) => {
      for (const update of stockUpdates) {
        await tx.product.update({
          where: { id: update.productId },
          data: { stock: { decrement: update.quantity } }
        });
      }

      return tx.sale.create({
        data: {
          saleNumber: generateSaleNumber(),
          subtotal,
          discountPercentage,
          discountAmount: discountTotal,
          grandTotal,
          amountDue: dueAmt,
          amountPaid: paidAmt,
          remainingBalance: Math.max(0, dueAmt - paidAmt),
          changeAmount: paidAmt > dueAmt ? paidAmt - dueAmt : 0,
          paymentMethod: MAP_PAYMENT_METHOD[paymentMethod],
          totalQuantity,
          userId: req.user.id || req.user._id,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          notes: notes || null,
          status: status,
          dueDate: dueDate ? new Date(dueDate) : null,
          createdAt: saleDateTime.toDate(),
          products: {
            create: validatedProducts.map(p => ({
              productId: p.productId,
              name: p.name,
              quantity: p.quantity,
              sellingPrice: p.sellingPrice,
              discount: p.discount,
              itemTotal: p.itemTotal,
              itemDiscount: p.itemDiscount,
              itemNet: p.itemNet
            }))
          },
          paymentHistory: {
            create: {
              amount: paidAmt,
              paymentMethod: MAP_PAYMENT_METHOD[paymentMethod],
              collectedById: req.user.id || req.user._id,
              notes: paidAmt >= dueAmt ? 'Full payment' : 'Partial payment'
            }
          }
        },
        include: { products: true, paymentHistory: true }
      });
    });

    res.status(201).json({
      success: true,
      message: `Sale for ${saleDateTime.format('MMM D, YYYY')} ${amountPaid >= amountDue ? 'completed' : 'recorded with partial payment'}`,
      data: sale
    });

  } catch (error) {
    console.error("Error creating sale by date:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Quick Product Search for Sales
export const searchProductsForSale = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        cost: true,
        price: true,
        stock: true,
        lowStockThreshold: true,
        expiryDate: true,
        description: true
      },
      orderBy: { name: 'asc' },
      take: 20
    });

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      cost: product.cost,
      price: product.price || product.cost,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 5,
      expiryDate: product.expiryDate,
      inStock: product.stock > 0,
      stockStatus: product.stock === 0 ? 'out' :
        product.stock <= (product.lowStockThreshold || 5) ? 'low' : 'high'
    }));

    res.status(200).json({ success: true, count: formattedProducts.length, products: formattedProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get All Sales (updated to include amountDue and amountPaid)
export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate, paymentMethod, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id || req.user._id };

    if (startDate && endDate) {
      where.createdAt = {
        gte: dayjs(startDate).startOf('day').toDate(),
        lte: dayjs(endDate).endOf('day').toDate()
      };
    }

    if (paymentMethod && paymentMethod !== 'all') {
      where.paymentMethod = MAP_PAYMENT_METHOD[paymentMethod.toLowerCase()];
    }

    if (status && status !== 'all') {
      where.status = MAP_SALE_STATUS[status.toLowerCase()];
    }

    const [sales, totalSales, totals, paymentStats, statusStats] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          user: { select: { username: true, role: true } },
          products: { include: { product: { select: { name: true, cost: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.sale.count({ where }),
      prisma.sale.aggregate({
        where,
        _sum: {
          amountDue: true,
          amountPaid: true,
          remainingBalance: true,
          grandTotal: true
        }
      }),
      prisma.sale.groupBy({
        where,
        by: ['paymentMethod'],
        _count: { _all: true },
        _sum: { amountDue: true, amountPaid: true },
        _avg: { amountDue: true }
      }),
      prisma.sale.groupBy({
        where,
        by: ['status'],
        _count: { _all: true },
        _sum: { amountDue: true, amountPaid: true, remainingBalance: true }
      })
    ]);

    res.status(200).json({
      success: true,
      data: sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSales / limit),
        totalSales,
        totals: {
          totalAmountDue: totals._sum.amountDue || 0,
          totalAmountPaid: totals._sum.amountPaid || 0,
          totalRemainingBalance: totals._sum.remainingBalance || 0,
          totalSalesValue: totals._sum.grandTotal || 0
        }
      },
      stats: {
        paymentMethods: paymentStats.map(s => ({
          _id: s.paymentMethod.toLowerCase(),
          count: s._count._all,
          totalAmountDue: s._sum.amountDue,
          totalAmountPaid: s._sum.amountPaid,
          avgSale: s._avg.amountDue
        })),
        statuses: statusStats.map(s => ({
          _id: s.status.toLowerCase(),
          count: s._count._all,
          totalAmountDue: s._sum.amountDue,
          totalAmountPaid: s._sum.amountPaid,
          totalRemainingBalance: s._sum.remainingBalance
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Sale by ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { username: true, role: true } },
        products: { include: { product: { select: { name: true, cost: true, price: true, stock: true } } } },
        paymentHistory: { include: { collectedBy: { select: { username: true } } } }
      }
    });

    if (!sale) return res.status(404).json({ success: false, error: "Sale not found" });

    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Update Sale
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      discountPercentage,
      discountAmount,
      paymentMethod,
      amountDue,
      amountPaid,
      notes,
      status,
      dueDate
    } = req.body;

    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) return res.status(404).json({ success: false, error: "Sale not found" });

    if (sale.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: "Completed sales cannot be modified. Create a refund instead." });
    }

    const data = {};
    if (discountPercentage !== undefined) data.discountPercentage = discountPercentage;
    if (discountAmount !== undefined) data.discountAmount = discountAmount;
    if (paymentMethod) data.paymentMethod = MAP_PAYMENT_METHOD[paymentMethod.toLowerCase()];
    if (amountDue !== undefined) data.amountDue = amountDue;
    if (amountPaid !== undefined) data.amountPaid = amountPaid;
    if (notes !== undefined) data.notes = notes;
    if (status) data.status = MAP_SALE_STATUS[status.toLowerCase()];
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    if (amountDue !== undefined || amountPaid !== undefined) {
      const currentDue = amountDue !== undefined ? amountDue : sale.amountDue;
      const currentPaid = amountPaid !== undefined ? amountPaid : sale.amountPaid;
      data.remainingBalance = Math.max(0, currentDue - currentPaid);
      data.changeAmount = currentPaid > currentDue ? currentPaid - currentDue : 0;
    }

    const updatedSale = await prisma.sale.update({
      where: { id },
      data,
      include: { products: true }
    });

    res.status(200).json({ success: true, message: "Sale updated successfully", data: updatedSale });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete Sale (with stock restoration)
export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { products: true }
    });

    if (!sale) return res.status(404).json({ success: false, error: "Sale not found" });

    await prisma.$transaction(async (tx) => {
      // 1. Restore product stocks
      for (const item of sale.products) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      // 2. Delete payment history and sale products first (Prisma delete handles this via Cascade if configured, but let's be explicit if not)
      await tx.paymentHistory.deleteMany({ where: { saleId: id } });
      await tx.saleProduct.deleteMany({ where: { saleId: id } });
      await tx.sale.delete({ where: { id } });
    });

    res.status(200).json({ success: true, message: "Sale deleted and stock restored successfully", deletedSaleId: id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Daily Sales Summary
export const getDailySalesSummary = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        userId: req.user.id || req.user._id
      },
      include: { user: { select: { username: true } } }
    });

    const summary = {
      totalSales: sales.length,
      totalAmountDue: sales.reduce((sum, sale) => sum + sale.amountDue, 0),
      totalAmountPaid: sales.reduce((sum, sale) => sum + sale.amountPaid, 0),
      totalRemainingBalance: sales.reduce((sum, sale) => sum + sale.remainingBalance, 0),
      totalItems: sales.reduce((sum, sale) => sum + sale.totalQuantity, 0),
      totalDiscount: sales.reduce((sum, sale) => sum + sale.discountAmount, 0),
      salesByPaymentMethod: sales.reduce((acc, sale) => {
        const method = sale.paymentMethod.toLowerCase();
        if (!acc[method]) acc[method] = { count: 0, amountDue: 0, amountPaid: 0, remainingBalance: 0 };
        acc[method].count += 1;
        acc[method].amountDue += sale.amountDue;
        acc[method].amountPaid += sale.amountPaid;
        acc[method].remainingBalance += sale.remainingBalance;
        return acc;
      }, {}),
      salesByStatus: sales.reduce((acc, sale) => {
        const status = sale.status.toLowerCase();
        if (!acc[status]) acc[status] = { count: 0, amountDue: 0, amountPaid: 0, remainingBalance: 0 };
        acc[status].count += 1;
        acc[status].amountDue += sale.amountDue;
        acc[status].amountPaid += sale.amountPaid;
        acc[status].remainingBalance += sale.remainingBalance;
        return acc;
      }, {}),
      recentSales: sales.slice(0, 10)
    };

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Sales by Date Range
export const getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const start = dayjs(startDate).startOf('day').toDate();
    const end = dayjs(endDate).endOf('day').toDate();

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'COMPLETED'
      },
      include: {
        user: { select: { username: true, role: true } },
        products: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = {
      sales,
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.grandTotal, 0),
      totalItems: sales.reduce((sum, sale) => sum + sale.totalQuantity, 0),
      totalDiscount: sales.reduce((sum, sale) => sum + sale.discountAmount, 0),
      salesByPaymentMethod: sales.reduce((acc, sale) => {
        const method = sale.paymentMethod.toLowerCase();
        if (!acc[method]) acc[method] = { count: 0, revenue: 0 };
        acc[method].count += 1;
        acc[method].revenue += sale.grandTotal;
        return acc;
      }, {}),
      dateRange: { start: startDate, end: endDate }
    };

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== DAILY SALES FUNCTIONS ==========

// ✅ Get Today's Sales
export const getDailySales = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: {
        products: true,
        user: { select: { username: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.totalQuantity, 0);
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod.toLowerCase();
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      sales,
      total,
      totalQuantity,
      salesByPaymentMethod,
      count: sales.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get logged-in user's sales for today
export const getMyDailySales = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await prisma.sale.findMany({
      where: {
        userId,
        createdAt: { gte: start, lte: end },
      },
      include: { products: true, user: { select: { username: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const total = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod.toLowerCase();
      if (!acc[method]) acc[method] = { count: 0, revenue: 0 };
      acc[method].count += 1;
      acc[method].revenue += sale.grandTotal;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: "Today's sales fetched",
      sales,
      total,
      salesByPaymentMethod
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all users' sales for today
export const getUsersDailySales = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { user: { select: { id: true, username: true, role: true } }, products: true }
    });

    const grouped = sales.reduce((acc, sale) => {
      const userId = sale.userId || "unknown";
      if (!acc[userId]) {
        acc[userId] = {
          username: sale.user?.username || "Unknown",
          role: sale.user?.role || "N/A",
          sales: [],
          total: 0,
          paymentMethods: {}
        };
      }
      acc[userId].sales.push(sale);
      acc[userId].total += sale.grandTotal;
      const method = sale.paymentMethod.toLowerCase();
      if (!acc[userId].paymentMethods[method]) acc[userId].paymentMethods[method] = { count: 0, revenue: 0 };
      acc[userId].paymentMethods[method].count += 1;
      acc[userId].paymentMethods[method].revenue += sale.grandTotal;
      return acc;
    }, {});

    res.status(200).json({ success: true, message: "Daily sales fetched", data: Object.values(grouped) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get sales by specific date
export const getSalesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { products: true },
      orderBy: { createdAt: 'desc' }
    });

    const total = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod.toLowerCase();
      if (!acc[method]) acc[method] = { count: 0, revenue: 0 };
      acc[method].count += 1;
      acc[method].revenue += sale.grandTotal;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: `Sales for ${date} fetched`,
      sales,
      total,
      salesByPaymentMethod
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all users' sales by date
export const getAllUsersSalesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const start = dayjs(date).startOf('day').toDate();
    const end = dayjs(date).endOf('day').toDate();

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { user: { select: { id: true, username: true, role: true } }, products: true }
    });

    const grouped = sales.reduce((acc, sale) => {
      const userId = sale.userId || "unknown";
      if (!acc[userId]) {
        acc[userId] = {
          username: sale.user?.username || "Unknown",
          role: sale.user?.role || "N/A",
          sales: [],
          total: 0,
        };
      }
      acc[userId].sales.push(sale);
      acc[userId].total += sale.grandTotal;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: `Sales for ${dayjs(date).format("MM-DD-YYYY")} fetched`,
      data: Object.values(grouped),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ✅ SIMPLE VERSION - Get all accounts receivable
export const getAccountsReceivable = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const sales = await prisma.sale.findMany({
      where: {
        userId,
        OR: [
          { remainingBalance: { gt: 0 } },
          { amountPaid: { lt: prisma.sale.fields.amountDue } } // Prisma doesn't support field comparison in where easily without raw or specific logic
        ]
      },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });

    // Actually, safest is to fetch and filter if OR field comparison is tricky
    const allSales = await prisma.sale.findMany({
      where: { userId },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const receivables = allSales.filter(sale => sale.remainingBalance > 0 || sale.amountPaid < sale.amountDue);

    const formattedData = receivables.map(sale => ({
      saleId: sale.id,
      saleNumber: sale.saleNumber,
      customer: sale.customerName || 'Walk-in Customer',
      total: sale.amountDue,
      paid: sale.amountPaid,
      balance: sale.remainingBalance,
      status: sale.status.toLowerCase(),
      paymentMethod: sale.paymentMethod.toLowerCase()
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      summary: {
        totalReceivables: formattedData.length,
        totalBalance: formattedData.reduce((sum, item) => sum + item.balance, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Add Payment to Sale (Collect Payment)
export const addPaymentToSale = async (req, res) => {
  try {
    const { amount, paymentMethod = 'cash', notes } = req.body;
    const saleId = req.params.id;

    if (!amount || amount <= 0) return res.status(400).json({ success: false, error: "Valid payment amount is required" });

    const sale = await prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale) return res.status(404).json({ success: false, error: "Sale not found" });

    if (sale.status === 'COMPLETED' || sale.remainingBalance <= 0) {
      return res.status(400).json({ success: false, error: "Sale is already paid in full" });
    }

    if (amount > sale.remainingBalance) {
      return res.status(400).json({ success: false, error: `Payment amount exceeds remaining balance ($${sale.remainingBalance})` });
    }

    const newAmountPaid = sale.amountPaid + amount;
    const newRemainingBalance = Math.max(0, sale.amountDue - newAmountPaid);

    let status = 'PARTIALLY_PAID';
    if (newAmountPaid >= sale.amountDue) status = 'COMPLETED';

    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        amountPaid: newAmountPaid,
        remainingBalance: newRemainingBalance,
        status: status,
        paymentHistory: {
          create: {
            amount,
            paymentMethod: MAP_PAYMENT_METHOD[paymentMethod.toLowerCase()] || 'CASH',
            collectedById: req.user.id || req.user._id,
            notes: notes || `Payment added via ${paymentMethod}`
          }
        }
      },
      include: {
        user: { select: { username: true } },
        paymentHistory: { include: { collectedBy: { select: { username: true } } } }
      }
    });

    res.status(200).json({
      success: true,
      message: "Payment added successfully",
      data: updatedSale
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Payment Methods Statistics for Dashboard
export const getPaymentMethodsStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const today = dayjs().startOf('day').toDate();
    const last7Days = dayjs().subtract(7, 'day').startOf('day').toDate();
    const startOfMonth = dayjs().startOf('month').toDate();

    const getStatsForRange = async (rangeStart) => {
      const stats = await prisma.sale.groupBy({
        where: { userId, createdAt: { gte: rangeStart } },
        by: ['paymentMethod'],
        _count: { _all: true },
        _sum: { amountDue: true, amountPaid: true, remainingBalance: true, grandTotal: true }
      });

      const formatted = {};
      ['cash', 'zaad', 'edahab', 'credit'].forEach(m => {
        formatted[m] = { count: 0, totalAmountDue: 0, totalAmountPaid: 0, totalSales: 0, totalRemainingBalance: 0 };
      });

      stats.forEach(s => {
        const method = s.paymentMethod.toLowerCase();
        if (formatted[method]) {
          formatted[method] = {
            count: s._count._all,
            totalAmountDue: s._sum.amountDue || 0,
            totalAmountPaid: s._sum.amountPaid || 0,
            totalSales: s._sum.grandTotal || 0,
            totalRemainingBalance: s._sum.remainingBalance || 0
          };
        }
      });
      return formatted;
    };

    const [todayStats, weeklyStats, monthlyStats] = await Promise.all([
      getStatsForRange(today),
      getStatsForRange(last7Days),
      getStatsForRange(startOfMonth)
    ]);

    res.status(200).json({
      success: true,
      data: { today: todayStats, weekly: weeklyStats, monthly: monthlyStats, allPaymentMethods: ['cash', 'zaad', 'edahab', 'credit'] },
      summary: {
        todayTotal: Object.values(todayStats).reduce((sum, s) => sum + s.totalAmountPaid, 0),
        weeklyTotal: Object.values(weeklyStats).reduce((sum, s) => sum + s.totalAmountPaid, 0),
        monthlyTotal: Object.values(monthlyStats).reduce((sum, s) => sum + s.totalAmountPaid, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Payment Method Transactions (for detailed view)
export const getPaymentMethodTransactions = async (req, res) => {
  try {
    const { method, period = 'today' } = req.params;
    const userId = req.user.id || req.user._id;

    let dateFilter = {};
    const now = dayjs();
    if (period === 'week') dateFilter = { gte: now.subtract(7, 'day').startOf('day').toDate() };
    else if (period === 'month') dateFilter = { gte: now.startOf('month').toDate() };
    else dateFilter = { gte: now.startOf('day').toDate() };

    const transactions = await prisma.sale.findMany({
      where: {
        userId,
        paymentMethod: MAP_PAYMENT_METHOD[method.toLowerCase()],
        createdAt: dateFilter
      },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const totals = transactions.reduce((acc, t) => ({
      totalAmountDue: acc.totalAmountDue + t.amountDue,
      totalAmountPaid: acc.totalAmountPaid + t.amountPaid,
      totalRemainingBalance: acc.totalRemainingBalance + t.remainingBalance,
      count: acc.count + 1
    }), { totalAmountDue: 0, totalAmountPaid: 0, totalRemainingBalance: 0, count: 0 });

    res.status(200).json({
      success: true,
      data: { method, period, transactions, totals, count: transactions.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};