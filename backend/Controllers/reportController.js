import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

const buildPaymentBreakdown = (sales) => {
  const breakdown = { cash: 0, zaad: 0, edahab: 0, credit: 0 };

  sales.forEach((sale) => {
    const method = sale.paymentMethod?.toString()?.toUpperCase() || "CASH";
    const key = method === "ZAAD" ? "zaad" : method === "EDAHAB" ? "edahab" : method === "CREDIT" ? "credit" : "cash";
    breakdown[key] = parseFloat((breakdown[key] + sale.grandTotal).toFixed(2));
  });

  return breakdown;
};

const aggregateProducts = (sales) => {
  const map = {};

  sales.forEach((sale) => {
    if (!Array.isArray(sale.products)) return;

    sale.products.forEach((item) => {
      const key = item.productId || item.name || `${item.name}-${item.sellingPrice}`;
      if (!map[key]) {
        map[key] = {
          productId: item.productId || null,
          productName: item.name,
          quantity: 0,
          revenue: 0,
          unitPrice: item.sellingPrice,
        };
      }
      map[key].quantity += item.quantity;
      map[key].revenue += item.itemNet;
    });
  });

  return Object.values(map)
    .map((entry) => ({
      ...entry,
      revenue: parseFloat(entry.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

const fetchSalesData = async (start, end) => {
  return prisma.sale.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true } },
      products: true,
    },
  });
};

const buildReportPayload = (sales) => {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
  const totalPaid = sales.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
  const totalDue = sales.reduce((sum, sale) => sum + (sale.remainingBalance || 0), 0);
  const totalSales = sales.length;
  const totalProductsSold = sales.reduce((sum, sale) => {
    if (!Array.isArray(sale.products)) return sum;
    return sum + sale.products.reduce((s, item) => s + item.quantity, 0);
  }, 0);
  const averageSale = totalSales ? totalRevenue / totalSales : 0;

  return {
    productRevenue: aggregateProducts(sales),
    paymentMethodBreakdown: buildPaymentBreakdown(sales),
    totals: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      totalDue: parseFloat(totalDue.toFixed(2)),
      totalSales,
      totalProductsSold,
      averageSale: parseFloat(averageSale.toFixed(2)),
    },
  };
};

const buildMonthlySummary = (sales, year) => {
  return Array.from({ length: 12 }, (_, index) => {
    const monthSales = sales.filter((sale) => dayjs(sale.createdAt).year() === year && dayjs(sale.createdAt).month() === index);
    const revenue = monthSales.reduce((sum, sale) => sum + sale.grandTotal, 0);

    return {
      month: index + 1,
      monthName: dayjs().month(index).format("MMMM"),
      revenue: parseFloat(revenue.toFixed(2)),
      salesCount: monthSales.length,
    };
  });
};

export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.params;
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    const sales = await fetchSalesData(start, end);
    const payload = buildReportPayload(sales);

    res.status(200).json({
      message: `Daily report for ${date} fetched successfully`,
      period: "daily",
      date,
      ...payload,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;
    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();

    const sales = await fetchSalesData(start, end);
    const payload = buildReportPayload(sales);

    res.status(200).json({
      message: `Monthly report for ${month}/${year} fetched successfully`,
      period: "monthly",
      year: Number(year),
      month: Number(month),
      monthName: dayjs().month(Number(month) - 1).format("MMMM"),
      ...payload,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.params;
    const numericYear = Number(year);
    const start = dayjs(`${year}-01-01`).startOf("year").toDate();
    const end = dayjs(`${year}-12-31`).endOf("year").toDate();

    const sales = await fetchSalesData(start, end);
    const payload = buildReportPayload(sales);
    const monthlyBreakdown = buildMonthlySummary(sales, numericYear);

    res.status(200).json({
      message: `Yearly report for ${year} fetched successfully`,
      period: "yearly",
      year: numericYear,
      monthlyBreakdown,
      ...payload,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------- GET TOP PRODUCTS --------------------

