import { prisma } from "../lib/prisma.js";

// ✅ Create Loan
export const createLoan = async (req, res) => {
  try {
    const { personName, productName, amount, description, quantity } = req.body || {};

    // Validate required fields
    if (!personName || !productName || !amount) {
      return res.status(400).json({
        success: false,
        error: "Person name, product name, and amount are required"
      });
    }

    // Validate amount is positive
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0"
      });
    }

    const loan = await prisma.loan.create({
      data: {
        personName: personName.trim(),
        productName: productName.trim(),
        amount: parseFloat(amount),
        description: description ? description.trim() : "",
        quantity: parseInt(quantity) || 1,
        createdById: req.user.id || req.user._id,
      },
      include: {
        createdBy: {
          select: { username: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Loan created successfully",
      loan
    });
  } catch (error) {
    console.error("❌ Error creating loan:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Get All Loans
export const getLoans = async (req, res) => {
  try {
    const { isPaid, startDate, endDate, personName } = req.query;

    // Build filter object for Prisma
    const where = {};

    if (isPaid !== undefined) {
      where.isPaid = isPaid === 'true';
    }

    if (startDate || endDate) {
      where.loanDate = {};
      if (startDate) where.loanDate.gte = new Date(startDate);
      if (endDate) where.loanDate.lte = new Date(endDate);
    }

    if (personName) {
      where.personName = {
        contains: personName,
        mode: 'insensitive'
      };
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        createdBy: {
          select: { username: true, email: true }
        }
      },
      orderBy: { loanDate: 'desc' }
    });

    // Calculate totals
    const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const unpaidAmount = loans
      .filter(loan => !loan.isPaid)
      .reduce((sum, loan) => sum + loan.amount, 0);
    const paidAmount = loans
      .filter(loan => loan.isPaid)
      .reduce((sum, loan) => sum + loan.amount, 0);

    res.status(200).json({
      success: true,
      count: loans.length,
      totals: {
        total: totalAmount,
        unpaid: unpaidAmount,
        paid: paidAmount
      },
      loans
    });
  } catch (error) {
    console.error("❌ Error fetching loans:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Update Loan
export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { personName, productName, amount, description, quantity, isPaid } = req.body;

    const data = {};

    if (personName !== undefined) data.personName = personName.trim();
    if (productName !== undefined) data.productName = productName.trim();
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Amount must be greater than 0"
        });
      }
      data.amount = parsedAmount;
    }
    if (description !== undefined) data.description = description.trim();
    if (quantity !== undefined) data.quantity = parseInt(quantity);

    if (isPaid !== undefined) {
      data.isPaid = isPaid === true || isPaid === 'true';
      data.paidDate = data.isPaid ? new Date() : null;
    }

    const loan = await prisma.loan.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { username: true, email: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Loan updated successfully",
      loan
    });
  } catch (error) {
    console.error("❌ Error updating loan:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Delete Loan
export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await prisma.loan.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "Loan deleted successfully",
      deletedLoan: loan
    });
  } catch (error) {
    console.error("❌ Error deleting loan:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Get Loan by ID
export const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { username: true, email: true }
        }
      }
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: "Loan not found"
      });
    }

    res.status(200).json({
      success: true,
      loan
    });
  } catch (error) {
    console.error("❌ Error fetching loan:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Mark Loan as Paid
export const markLoanAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await prisma.loan.update({
      where: { id },
      data: {
        isPaid: true,
        paidDate: new Date()
      },
      include: {
        createdBy: {
          select: { username: true, email: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Loan marked as paid successfully",
      loan
    });
  } catch (error) {
    console.error("❌ Error marking loan as paid:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Get Loan Statistics
export const getLoanStats = async (req, res) => {
  try {
    const [totalStats, unpaidStats, paidStats, monthlyStats] = await Promise.all([
      // Total statistics
      prisma.loan.aggregate({
        _count: { id: true },
        _sum: { amount: true },
      }),
      // Unpaid stats
      prisma.loan.aggregate({
        where: { isPaid: false },
        _count: { id: true },
        _sum: { amount: true },
      }),
      // Paid stats
      prisma.loan.aggregate({
        where: { isPaid: true },
        _count: { id: true },
        _sum: { amount: true },
      }),
      // Monthly stats for current year
      prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM "loanDate")::int as month,
          COUNT(*)::int as count,
          SUM(amount)::float as "totalAmount",
          SUM(CASE WHEN "isPaid" = false THEN amount ELSE 0 END)::float as "unpaidAmount"
        FROM "Loan"
        WHERE EXTRACT(YEAR FROM "loanDate") = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY 1
        ORDER BY 1 ASC
      `
    ]);

    const stats = {
      totalLoans: totalStats._count.id || 0,
      totalAmount: totalStats._sum.amount || 0,
      unpaidLoans: unpaidStats._count.id || 0,
      unpaidAmount: unpaidStats._sum.amount || 0,
      paidLoans: paidStats._count.id || 0,
      paidAmount: paidStats._sum.amount || 0
    };

    res.status(200).json({
      success: true,
      stats,
      monthlyStats
    });
  } catch (error) {
    console.error("❌ Error fetching loan statistics:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};