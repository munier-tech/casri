import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

// -------------------- Helper: Somali Month Names --------------------
function getSomaliMonthName(month) {
  const somaliMonths = {
    1: "Janaayo", 2: "Febraayo", 3: "Maarso", 4: "Abriil",
    5: "Maayo", 6: "Juun", 7: "Luuliyo", 8: "Agosto",
    9: "Sebtembar", 10: "Oktoobar", 11: "Nofembar", 12: "Desembar",
  };
  return somaliMonths[month] || "Bilaash";
}

// -------------------- GET DAILY REPORT --------------------
export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.params;
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    const [sales, purchases, loans, financials] = await Promise.all([
      prisma.sale.findMany({ where: { createdAt: { gte: start, lte: end } }, include: { user: { select: { username: true, role: true } } } }),
      prisma.purchase.findMany({ where: { datePurchased: { gte: start, lte: end } }, include: { user: { select: { username: true } } } }),
      prisma.loan.findMany({ where: { loanDate: { gte: start, lte: end } }, include: { createdBy: { select: { username: true } } } }),
      prisma.financial.findMany({ where: { date: { gte: start, lte: end } } })
    ]);

    const financialIncomes = [];
    const expenses = [];

    financials.forEach((f) => {
      if (f.income) financialIncomes.push(f.income);
      if (f.expenses && Array.isArray(f.expenses)) expenses.push(...f.expenses);
      if (f.accountsAdjustments && Array.isArray(f.accountsAdjustments)) {
        expenses.push(...f.accountsAdjustments.map(a => ({ name: a.label, amount: a.value })));
      }
    });

    const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalFinancialIncome = financialIncomes.reduce((sum, f) => {
      return sum + Object.values(f).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    }, 0);

    const totalIncome = totalSales + totalLoans + totalFinancialIncome;
    const totalExpensesFromExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
    const totalExpenses = totalExpensesFromExpenses + totalPurchases;
    const balance = totalIncome - totalExpenses;

    res.status(200).json({
      message: `Daily report for ${date} fetched successfully`,
      sales, loans, purchases, financialIncomes, expenses,
      totals: { totalIncome, totalExpenses, balance },
      count: {
        sales: sales.length, loans: loans.length, purchases: purchases.length,
        financialIncomes: financialIncomes.length, expenses: expenses.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------- GET MONTHLY REPORT --------------------
export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;
    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();

    const [sales, purchases, loans, financials] = await Promise.all([
      prisma.sale.findMany({ where: { createdAt: { gte: start, lte: end } }, include: { user: { select: { username: true, role: true } } } }),
      prisma.purchase.findMany({ where: { datePurchased: { gte: start, lte: end } }, include: { user: { select: { username: true } } } }),
      prisma.loan.findMany({ where: { loanDate: { gte: start, lte: end } }, include: { createdBy: { select: { username: true } } } }),
      prisma.financial.findMany({ where: { date: { gte: start, lte: end } } })
    ]);

    const financialIncomes = [];
    const expenses = [];

    financials.forEach((f) => {
      if (f.income) financialIncomes.push(f.income);
      if (f.expenses && Array.isArray(f.expenses)) expenses.push(...f.expenses);
      if (f.accountsAdjustments && Array.isArray(f.accountsAdjustments)) {
        expenses.push(...f.accountsAdjustments.map(a => ({ name: a.label, amount: a.value })));
      }
    });

    const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalFinancialIncome = financialIncomes.reduce((sum, f) => {
      return sum + Object.values(f).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    }, 0);

    const totalIncome = totalSales + totalLoans + totalFinancialIncome;
    const totalExpensesFromExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
    const totalExpenses = totalExpensesFromExpenses + totalPurchases;
    const balance = totalIncome - totalExpenses;

    res.status(200).json({
      message: `Monthly report for ${month}-${year} fetched successfully`,
      sales, loans, purchases, financialIncomes, expenses,
      totals: { totalIncome, totalExpenses, balance },
      count: {
        sales: sales.length, loans: loans.length, purchases: purchases.length,
        financialIncomes: financialIncomes.length, expenses: expenses.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------- GET YEARLY REPORT --------------------
export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.params;
    const start = dayjs(`${year}-01-01`).startOf("year").toDate();
    const end = dayjs(`${year}-12-31`).endOf("year").toDate();

    const [sales, purchases, loans, financials, topProducts] = await Promise.all([
      prisma.sale.findMany({ where: { createdAt: { gte: start, lte: end } }, include: { user: { select: { username: true, role: true } } } }),
      prisma.purchase.findMany({ where: { datePurchased: { gte: start, lte: end } }, include: { user: { select: { username: true } } } }),
      prisma.loan.findMany({ where: { loanDate: { gte: start, lte: end } }, include: { createdBy: { select: { username: true } } } }),
      prisma.financial.findMany({ where: { date: { gte: start, lte: end } } }),
      prisma.saleProduct.groupBy({
        by: ['productId', 'name'],
        where: { sale: { createdAt: { gte: start, lte: end } } },
        _sum: { quantity: true, itemNet: true },
        orderBy: { _sum: { itemNet: 'desc' } },
        take: 10
      })
    ]);

    const financialIncomes = [];
    const expenses = [];
    financials.forEach((f) => {
      if (f.income) financialIncomes.push(f.income);
      if (f.expenses && Array.isArray(f.expenses)) expenses.push(...f.expenses);
      if (f.accountsAdjustments && Array.isArray(f.accountsAdjustments)) {
        expenses.push(...f.accountsAdjustments.map(a => ({ name: a.label, amount: a.value })));
      }
    });

    const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalFinancialIncome = financialIncomes.reduce((sum, f) => {
      return sum + Object.values(f).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    }, 0);
    const totalIncome = totalSales + totalLoans + totalFinancialIncome;

    const totalExpensesFromExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
    const totalExpenses = totalExpensesFromExpenses + totalPurchases;
    const balance = totalIncome - totalExpenses;

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthSales = sales.filter(s => dayjs(s.createdAt).month() === i);
      const monthLoans = loans.filter(l => dayjs(l.loanDate).month() === i);
      const monthFinancials = financials.filter(f => dayjs(f.date).month() === i);
      const monthPurchases = purchases.filter(p => dayjs(p.datePurchased).month() === i);

      const mFinancialIncomes = monthFinancials.map(f => f.income);
      const mExpenses = [];
      monthFinancials.forEach(f => {
        if (f.expenses && Array.isArray(f.expenses)) mExpenses.push(...f.expenses);
        if (f.accountsAdjustments && Array.isArray(f.accountsAdjustments)) mExpenses.push(...f.accountsAdjustments.map(a => ({ name: a.label, amount: a.value })));
      });

      const mTotalSales = monthSales.reduce((sum, s) => sum + s.grandTotal, 0);
      const mTotalLoans = monthLoans.reduce((sum, l) => sum + l.amount, 0);
      const mTotalFinancialIncome = mFinancialIncomes.reduce((sum, f) => sum + Object.values(f).reduce((a, b) => a + (parseFloat(b) || 0), 0), 0);
      const mTotalIncome = mTotalSales + mTotalLoans + mTotalFinancialIncome;

      const mTotalPurchases = monthPurchases.reduce((sum, p) => sum + p.total, 0);
      const mTotalExpenses = mExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) + mTotalPurchases;

      return {
        month,
        monthName: dayjs().month(i).format('MMMM'),
        monthNameSomali: getSomaliMonthName(month),
        totalIncome: mTotalIncome,
        totalExpenses: mTotalExpenses,
        balance: mTotalIncome - mTotalExpenses,
      };
    });

    res.status(200).json({
      message: `Yearly sales report for ${year} fetched successfully`,
      year: parseInt(year),
      totals: { totalIncome, totalExpenses, balance },
      monthlyBreakdown,
      topProducts: topProducts.map(p => ({
        _id: { id: p.productId, name: p.name },
        totalSold: p._sum.quantity,
        totalRevenue: p._sum.itemNet
      })),
      salesData: { totalSales, salesCount: sales.length, sales }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------- GET TOP PRODUCTS --------------------

