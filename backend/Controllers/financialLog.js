import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

// CREATE LOG (with optional user-specified date)
export const createFinancialIncome = async (req, res) => {
  try {
    const {
      income = {},
      accountsAdjustments = [],
      expenses = [],
      date // 👈 accept date from req.body
    } = req.body;

    const incomeTotal =
      (income.zdollar || 0) +
      (income.zcash || 0) +
      (income.edahabCash || 0) +
      (income.Cash || 0) +
      (income.dollar || 0) +
      (income.account || 0);

    const adjustmentsTotal = accountsAdjustments.reduce(
      (sum, adj) => sum + (adj.value || 0),
      0
    );

    const expensesTotal = expenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );

    const combinedTotal = incomeTotal + expensesTotal;
    const balance = combinedTotal + adjustmentsTotal;

    const logDate = date ? dayjs(date).startOf('day').toDate() : dayjs().startOf('day').toDate();
    const userId = req.user.id || req.user._id;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or Create History for the date
      let history = await tx.history.findFirst({
        where: { userId, date: logDate }
      });

      if (!history) {
        history = await tx.history.create({
          data: { userId, date: logDate }
        });
      }

      // 2. Create Financial log
      return tx.financial.create({
        data: {
          date: logDate,
          income,
          accountsAdjustments,
          expenses,
          totals: {
            incomeTotal,
            adjustmentsTotal,
            combinedTotal,
            expensesTotal,
            balance
          },
          historyId: history.id
        }
      });
    });

    res.status(201).json({
      message: "Financial log created successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in creating financial log:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET LOGS BY DATE
export const getFinancialLogsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const startOfDay = dayjs(date).startOf("day").toDate();
    const endOfDay = dayjs(date).endOf("day").toDate();

    const logs = await prisma.financial.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } }
    });

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: "No data found for this specific date" });
    }

    res.status(200).json({ data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFinancialLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { income, accountsAdjustments, expenses, date } = req.body;

    const existingLog = await prisma.financial.findUnique({ where: { id } });
    if (!existingLog) return res.status(404).json({ message: "Financial log not found" });

    const updatedIncome = income || existingLog.income;
    const updatedAdjustments = accountsAdjustments || existingLog.accountsAdjustments;
    const updatedExpenses = expenses || existingLog.expenses;
    const updatedDate = date ? dayjs(date).startOf('day').toDate() : existingLog.date;

    const incomeTotal =
      (updatedIncome.zdollar || 0) +
      (updatedIncome.zcash || 0) +
      (updatedIncome.edahabCash || 0) +
      (updatedIncome.Cash || 0) +
      (updatedIncome.dollar || 0) +
      (updatedIncome.account || 0);

    const adjustmentsTotal = (updatedAdjustments || []).reduce(
      (sum, adj) => sum + (adj.value || 0),
      0
    );

    const expensesTotal = (updatedExpenses || []).reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );

    const combinedTotal = incomeTotal + expensesTotal;
    const balance = combinedTotal + adjustmentsTotal;

    const updatedLog = await prisma.financial.update({
      where: { id },
      data: {
        income: updatedIncome,
        accountsAdjustments: updatedAdjustments,
        expenses: updatedExpenses,
        date: updatedDate,
        totals: {
          incomeTotal,
          adjustmentsTotal,
          expensesTotal,
          combinedTotal,
          balance
        }
      }
    });

    res.status(200).json({
      message: "Financial log successfully updated.",
      data: updatedLog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

