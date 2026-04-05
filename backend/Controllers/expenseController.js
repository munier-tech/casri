import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

const typeMap = {
  'Rent': 'RENT',
  'Electricity': 'ELECTRICITY',
  'Salaries and Wages': 'SALARIES_AND_WAGES',
  'Security / Guard': 'SECURITY',
  'Repairs and Maintenance': 'REPAIRS_AND_MAINTENANCE',
  'Mobile Money': 'MOBILE_MONEY',
  'Bank Charge Fees': 'BANK_CHARGE_FEES',
  'Marketing and Branding': 'MARKETING_AND_BRANDING',
  'Taxes': 'TAXES',
  'Internet': 'INTERNET',
  'Water': 'WATER',
  'Others': 'OTHERS'
};

const methodMap = {
  'Cash': 'CASH',
  'Zaad': 'ZAAD',
  'E-Dahab': 'EDAHAB'
};

const calculateStatus = (due, paid, dueDate) => {
  const balance = due - paid;
  if (balance <= 0) return 'FULLY_PAID';
  if (paid > 0) return 'PARTIALLY_PAID';
  if (dueDate && new Date() > new Date(dueDate)) return 'OVERDUE';
  return 'PENDING';
};

export const createExpense = async (req, res) => {
  try {
    const { clientName, clientPhone, amountDue, amountPaid, expenseType, paymentMethod, description, dueDate } = req.body;
    if (amountPaid > amountDue) return res.status(400).json({ success: false, error: 'Amount paid cannot exceed amount due' });

    const balance = amountDue - amountPaid;
    const status = calculateStatus(amountDue, amountPaid, dueDate);

    const expense = await prisma.expense.create({
      data: {
        clientName,
        clientPhone,
        amountDue: parseFloat(amountDue),
        amountPaid: parseFloat(amountPaid),
        expenseType: typeMap[expenseType] || 'OTHERS',
        paymentMethod: methodMap[paymentMethod] || 'CASH',
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.id || req.user._id,
        balance,
        status
      }
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, expenseType, paymentMethod, status, clientName, startDate, endDate, minAmount, maxAmount, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.id || req.user._id;

    const where = { userId };
    if (expenseType) where.expenseType = typeMap[expenseType] || expenseType;
    if (paymentMethod) where.paymentMethod = methodMap[paymentMethod] || paymentMethod;
    if (status) where.status = status.toUpperCase().replace(' ', '_');
    if (clientName) where.clientName = { contains: clientName, mode: 'insensitive' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      where.amountDue = {};
      if (minAmount) where.amountDue.gte = parseFloat(minAmount);
      if (maxAmount) where.amountDue.lte = parseFloat(maxAmount);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const expenses = await prisma.expense.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy === 'date' ? 'createdAt' : sortBy]: sortOrder }
    });

    const total = await prisma.expense.count({ where });
    const summaryAgg = await prisma.expense.aggregate({
      where,
      _sum: { amountDue: true, amountPaid: true, balance: true },
      _count: { id: true }
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      summary: {
        totalAmountDue: summaryAgg._sum.amountDue || 0,
        totalAmountPaid: summaryAgg._sum.amountPaid || 0,
        totalBalance: summaryAgg._sum.balance || 0,
        count: summaryAgg._count.id || 0
      },
      data: expenses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id || req.user._id }
    });
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { clientName, clientPhone, amountDue, amountPaid, expenseType, paymentMethod, description, dueDate } = req.body;
    const existing = await prisma.expense.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Expense not found' });

    const newDue = amountDue !== undefined ? parseFloat(amountDue) : existing.amountDue;
    const newPaid = amountPaid !== undefined ? parseFloat(amountPaid) : existing.amountPaid;
    const newDueDate = dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate;

    const balance = newDue - newPaid;
    const status = calculateStatus(newDue, newPaid, newDueDate);

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        clientName: clientName || undefined,
        clientPhone: clientPhone || undefined,
        amountDue: newDue,
        amountPaid: newPaid,
        expenseType: expenseType ? (typeMap[expenseType] || 'OTHERS') : undefined,
        paymentMethod: paymentMethod ? (methodMap[paymentMethod] || 'CASH') : undefined,
        description: description !== undefined ? description : undefined,
        dueDate: newDueDate,
        balance: parseFloat(balance.toFixed(2)),
        status
      }
    });

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id, userId: req.user.id || req.user._id }
    });
    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Expense not found' });
  }
};

export const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id || req.user._id;

    const where = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [byType, byPayment, byStatus] = await Promise.all([
      prisma.expense.groupBy({
        by: ['expenseType'],
        where,
        _sum: { amountDue: true, amountPaid: true, balance: true },
        _count: { id: true }
      }),
      prisma.expense.groupBy({
        by: ['paymentMethod'],
        where,
        _sum: { amountPaid: true },
        _count: { id: true }
      }),
      prisma.expense.groupBy({
        by: ['status'],
        where,
        _sum: { amountDue: true, amountPaid: true },
        _count: { id: true }
      })
    ]);

    // Prisma doesn't support $year/$month in groupBy easily without raw queries or computed columns
    // We'll fetch all within range and group in JS (consistent with other controllers)
    const allInRange = await prisma.expense.findMany({ where, select: { createdAt: true, amountDue: true, amountPaid: true } });
    const monthlyMap = {};
    allInRange.forEach(e => {
      const y = e.createdAt.getFullYear();
      const m = e.createdAt.getMonth() + 1;
      const key = `${y}-${m}`;
      if (!monthlyMap[key]) monthlyMap[key] = { _id: { year: y, month: m }, totalAmountDue: 0, totalAmountPaid: 0, count: 0 };
      monthlyMap[key].totalAmountDue += e.amountDue;
      monthlyMap[key].totalAmountPaid += e.amountPaid;
      monthlyMap[key].count += 1;
    });
    const monthlyTrends = Object.values(monthlyMap).sort((a, b) => (a._id.year - b._id.year) || (a._id.month - b._id.month)).slice(0, 12);

    res.status(200).json({
      success: true,
      data: {
        byType: byType.map(t => ({ _id: t.expenseType, totalAmountDue: t._sum.amountDue, totalAmountPaid: t._sum.amountPaid, totalBalance: t._sum.balance, count: t._count.id })),
        byPaymentMethod: byPayment.map(p => ({ _id: p.paymentMethod, totalAmount: p._sum.amountPaid, count: p._count.id })),
        byStatus: byStatus.map(s => ({ _id: s.status, totalAmountDue: s._sum.amountDue, totalAmountPaid: s._sum.amountPaid, count: s._count.id })),
        monthlyTrends,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};