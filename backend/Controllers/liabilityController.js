import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

export const addLiabilityToDailySales = async (req, res) => {
  try {
    const { name, price, description, quantity } = req.body || {};
    const userId = req.user.id || req.user._id;

    if (!name || price === undefined || !description || !quantity) {
      return res.status(400).json({ message: "All product fields are required." });
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number." });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Liability
      const newLiability = await tx.liability.create({
        data: {
          name,
          price: parseFloat(price),
          description,
          quantity: parsedQuantity,
          userId,
          soldAt: dayjs().startOf('day').toDate(),
          isPaid: false
        }
      });

      // 2. Find or Create History for today
      let history = await tx.history.findFirst({
        where: {
          userId,
          date: dayjs().startOf('day').toDate()
        }
      });

      if (!history) {
        history = await tx.history.create({
          data: {
            userId,
            date: dayjs().startOf('day').toDate()
          }
        });
      }

      // 3. Add to HistoryLiability
      await tx.historyLiability.create({
        data: {
          historyId: history.id,
          name: newLiability.name,
          productId: newLiability.id, // linked to Liability
          price: newLiability.price,
          quantity: newLiability.quantity,
          description: newLiability.description
        }
      });

      return newLiability;
    });

    res.status(201).json({ message: "Liability added successfully to daily liabilities.", product: result });
  } catch (error) {
    console.error("Error adding Liability:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllLiabilities = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const liabilities = await prisma.liability.findMany({ where: { userId } });

    if (!liabilities || liabilities.length === 0) {
      return res.status(404).json({ message: "No liabilities found." });
    }

    res.status(200).json({ message: "All liabilities fetched successfully.", liabilities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markLiabilityAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.liability.update({
      where: { id },
      data: { isPaid: true, paidAt: new Date() }
    });

    res.status(200).json({ message: "Liability marked as paid", liability: updated });
  } catch (error) {
    res.status(404).json({ message: "Liability not found or error marking as paid" });
  }
};

export const getDailyLiability = async (req, res) => {
  try {
    const startOfDay = dayjs().startOf('day').toDate();
    const endOfDay = dayjs().endOf('day').toDate();

    const liabilities = await prisma.liability.findMany({
      where: {
        isPaid: false,
        soldAt: { gte: startOfDay, lte: endOfDay },
        userId: req.user.id || req.user._id
      }
    });

    if (liabilities.length === 0) {
      return res.status(404).json({ message: "No liabilities were sold today" });
    }

    res.status(200).json({ message: "Today's liabilities fetched successfully", liabilities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLiability = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Also delete from historyLiability if needed, but usually history is for records.
    // The schema shows historyLiability has a relation to Liability (productId).
    // If we delete the liability, we might need to delete history records too or rely on cascading.

    await prisma.$transaction(async (tx) => {
      await tx.historyLiability.deleteMany({ where: { productId: id } });
      await tx.liability.delete({ where: { id } });
    });

    res.status(200).json({ message: "Liability deleted successfully." });
  } catch (error) {
    res.status(404).json({ message: "Liability not found or error deleting." });
  }
};




