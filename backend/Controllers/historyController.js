import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

export const getMyDailySales = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const formattedDate = dayjs().startOf('day').toDate();

    const history = await prisma.history.findFirst({
      where: { userId, date: formattedDate },
      include: { products: true }
    });

    if (!history || history.products.length === 0) {
      return res.status(404).json({ message: "No sales found for today" });
    }

    res.status(200).json({
      message: "Daily sales fetched successfully",
      date: formattedDate,
      products: history.products,
    });
  } catch (error) {
    console.error("Error in getMyDailySales:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllUserSaleHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const historyRecords = await prisma.history.findMany({
      where: { userId },
      include: { products: true, liabilities: true }
    });

    if (!historyRecords || historyRecords.length === 0) {
      return res.status(404).json({ message: "No sales history found for this user" });
    }

    res.status(200).json({
      message: "User sales history fetched successfully",
      history: historyRecords,
    });
  } catch (error) {
    console.error("Error in getAllUserSaleHistory:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSingleUserHistoryByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;
    const formattedDate = dayjs(date).startOf('day').toDate();

    const historyRecord = await prisma.history.findFirst({
      where: { userId, date: formattedDate },
      include: { products: true, liabilities: true }
    });

    if (!historyRecord) {
      return res.status(404).json({ message: "No sales history found for this user on the specified date." });
    }

    res.status(200).json({
      message: "Sales history fetched successfully.",
      history: historyRecord,
      date: formattedDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsSoldByDate = async (req, res) => {
  try {
    const { date } = req.params;
    if (!date) return res.status(400).json({ message: "Date parameter is required." });

    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();

    const historyRecords = await prisma.history.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: { products: true, user: { select: { username: true } } }
    });

    if (!historyRecords.length) {
      return res.status(404).json({ message: `No products sold on ${date}.` });
    }

    const allProducts = historyRecords.flatMap(record =>
      record.products.map(product => ({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        user: record.user?.username || "Unknown User",
        soldAt: record.date,
      }))
    );

    res.status(200).json({ message: `Products sold on ${date} fetched successfully.`, data: allProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLiabilityByDate = async (req, res) => {
  try {
    const { date } = req.params;
    if (!date) return res.status(400).json({ message: "Date parameter is required." });

    const startOfDay = dayjs(date).startOf("day").toDate();
    const endOfDay = dayjs(date).endOf("day").toDate();

    const historyRecords = await prisma.history.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: { liabilities: true, user: { select: { username: true } } }
    });

    if (!historyRecords || historyRecords.length === 0) {
      return res.status(404).json({ message: `No liabilities found on ${date}.` });
    }

    const allLiabilities = historyRecords.flatMap(record =>
      record.liabilities.map(liability => ({
        name: liability.name,
        description: liability.description,
        price: liability.price,
        quantity: liability.quantity || 1,
        user: record.user?.username || "Unknown User",
        soldAt: record.date,
      }))
    );

    res.status(200).json({ message: "Liabilities fetched successfully.", data: allLiabilities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsersHistory = async (req, res) => {
  try {
    const historyRecord = await prisma.history.findMany({
      orderBy: { date: 'desc' },
      include: { user: { select: { username: true } }, products: true, liabilities: true }
    });

    if (!historyRecord || historyRecord.length === 0) {
      return res.status(404).json({ message: "No sales history found for all users." });
    }

    res.status(200).json({ message: "Sales history fetched successfully.", history: historyRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserHistory = async (req, res) => {
  try {
    const { userId, date } = req.params;
    const formattedDate = dayjs(date).startOf('day').toDate();

    const record = await prisma.history.findFirst({ where: { userId, date: formattedDate } });
    if (!record) return res.status(404).json({ message: "History not found" });

    await prisma.$transaction(async (tx) => {
      await tx.historyProduct.deleteMany({ where: { historyId: record.id } });
      await tx.historyLiability.deleteMany({ where: { historyId: record.id } });
      await tx.history.delete({ where: { id: record.id } });
    });

    res.status(200).json({ message: "User history deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllHistory = async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.historyProduct.deleteMany({}),
      prisma.historyLiability.deleteMany({}),
      prisma.history.deleteMany({})
    ]);
    res.status(200).json({ message: "All history deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
