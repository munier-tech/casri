import { prisma } from "../lib/prisma.js";

/* ======================================================
   GET ALL ACCOUNTS RECEIVABLE
====================================================== */
export const getAccountsReceivable = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = "all",
      paymentMethod = "all",
      search = "",
      sortBy = "dueDate",
      sortOrder = "asc",
    } = req.query;

    const userId = req.user.id;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      userId,
      remainingBalance: { gt: 0 },
      status: {
        in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"],
      },
    };

    if (status !== "all") {
      where.status = status.toUpperCase();
    }

    if (paymentMethod !== "all") {
      where.paymentMethod = paymentMethod.toUpperCase();
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { saleNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const receivables = await prisma.sale.findMany({
      where,
      include: {
        user: { select: { username: true } },
      },
      skip,
      take: Number(limit),
      orderBy: {
        [sortBy]: sortOrder === "desc" ? "desc" : "asc",
      },
    });

    const totalCount = await prisma.sale.count({ where });

    const summary = await prisma.sale.aggregate({
      where,
      _sum: {
        remainingBalance: true,
        amountDue: true,
        amountPaid: true,
      },
      _avg: {
        remainingBalance: true,
      },
    });

    res.status(200).json({
      success: true,
      data: receivables,
      summary,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalItems: totalCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   COLLECT PAYMENT
====================================================== */
export const collectReceivablePayment = async (req, res) => {
  try {
    const { amount, paymentMethod = "CASH", notes } = req.body;
    const saleId = req.params.id;
    const userId = req.user.id;

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale)
      return res.status(404).json({ success: false, error: "Sale not found" });

    if (sale.remainingBalance <= 0)
      return res.status(400).json({
        success: false,
        error: "Sale already paid",
      });

    const paymentAmount = Number(amount);

    if (paymentAmount > sale.remainingBalance)
      return res.status(400).json({
        success: false,
        error: "Payment exceeds remaining balance",
      });

    const newAmountPaid = sale.amountPaid + paymentAmount;
    const newRemaining = sale.amountDue - newAmountPaid;

    const [updatedSale] = await prisma.$transaction([
      prisma.sale.update({
        where: { id: saleId },
        data: {
          amountPaid: newAmountPaid,
          remainingBalance: newRemaining,
          status:
            newRemaining <= 0 ? "COMPLETED" : "PARTIALLY_PAID",
          hasDebt: newRemaining > 0,
        },
      }),
      prisma.paymentHistory.create({
        data: {
          amount: paymentAmount,
          paymentMethod: paymentMethod.toUpperCase(),
          notes,
          saleId,
          collectedById: userId,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Payment collected successfully",
      data: updatedSale,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   GET RECEIVABLE DETAILS
====================================================== */
export const getReceivableDetails = async (req, res) => {
  try {
    const saleId = req.params.id;

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        user: true,
        products: {
          include: { product: true },
        },
        paymentHistory: {
          include: { collectedBy: true },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!sale)
      return res.status(404).json({ success: false, error: "Sale not found" });

    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   UPDATE RECEIVABLE
====================================================== */
export const updateReceivable = async (req, res) => {
  try {
    const saleId = req.params.id;
    const { dueDate, notes, status } = req.body;

    const updated = await prisma.sale.update({
      where: { id: saleId },
      data: {
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        status: status ? status.toUpperCase() : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: "Receivable updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   RECEIVABLE SUMMARY (Advanced Prisma Version)
====================================================== */
export const getReceivableSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const baseWhere = {
      userId,
      remainingBalance: { gt: 0 },
      status: {
        in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"],
      },
    };

    const totals = await prisma.sale.aggregate({
      where: baseWhere,
      _sum: {
        remainingBalance: true,
        amountDue: true,
        amountPaid: true,
      },
      _avg: {
        remainingBalance: true,
      },
      _min: {
        remainingBalance: true,
      },
      _max: {
        remainingBalance: true,
      },
      _count: true,
    });

    const byStatus = await prisma.sale.groupBy({
      by: ["status"],
      where: baseWhere,
      _sum: { remainingBalance: true },
      _count: true,
    });

    const byPaymentMethod = await prisma.sale.groupBy({
      by: ["paymentMethod"],
      where: baseWhere,
      _sum: { remainingBalance: true },
      _count: true,
    });

    const oldestReceivable = await prisma.sale.findFirst({
      where: baseWhere,
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({
      success: true,
      data: {
        totals,
        byStatus,
        byPaymentMethod,
        oldestReceivable,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   SEARCH RECEIVABLES
====================================================== */
export const searchReceivablesByCustomer = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.id;

    if (!search)
      return res.status(400).json({
        success: false,
        error: "Search query required",
      });

    const results = await prisma.sale.findMany({
      where: {
        userId,
        remainingBalance: { gt: 0 },
        status: {
          in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"],
        },
        OR: [
          { customerName: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search, mode: "insensitive" } },
          { saleNumber: { contains: search, mode: "insensitive" } },
        ],
      },
      orderBy: { dueDate: "asc" },
      take: 20,
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   TEST ENDPOINT
====================================================== */
export const testReceivables = async (req, res) => {
  try {
    const totalSales = await prisma.sale.count();

    const salesWithBalance = await prisma.sale.findMany({
      where: { remainingBalance: { gt: 0 } },
      take: 5,
    });

    res.status(200).json({
      success: true,
      debug: {
        totalSales,
        salesWithBalance,
        userId: req.user?.id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
