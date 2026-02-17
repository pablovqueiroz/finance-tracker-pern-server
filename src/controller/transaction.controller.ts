import type { Request, Response } from "express";
import {
  Prisma,
  TransactionType,
  Category,
} from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { isAdminOrOwner } from "../utils/permisions.js";
import { buildDateFilter } from "../utils/dateFilter.js";

//create transaction
interface CreateTransactionBody {
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  notes?: string;
  date?: string;
  accountId: string;
}

export const createTransaction = async (
  req: Request<{}, {}, CreateTransactionBody>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.id;
    const { title, amount, type, category, notes, date, accountId } = req.body;

    if (!Object.values(TransactionType).includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (!Object.values(Category).includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: { userId, accountId },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied to this account" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: new Prisma.Decimal(amount),
        type,
        category,
        accountId,
        createdById: userId,
        ...(notes !== undefined && { notes }),
        ...(date && { date: new Date(date) }),
      },
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating transaction" });
  }
};

//get all transactions per account
export const getTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.id;
    const { accountId } = req.params as { accountId: string };

    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: { userId, accountId },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { accountId },
      orderBy: { date: "desc" },
    });
    
    return res.json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching transactions" });
  }
};

//get transaction by id
export const getTransactionsById = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.id;
    const { id } = req.params as { id: string };

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId: transaction.accountId,
        },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(transaction);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching transaction" });
  }
};

//update transaction
interface UpdateTransactionBody {
  title?: string;
  amount?: number;
  type?: TransactionType;
  category?: Category;
  notes?: string;
  date?: string;
}

export const updateTransaction = async (
  req: Request<{ id: string }, {}, UpdateTransactionBody>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.id;
    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId: existing.accountId,
        },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!isAdminOrOwner(accountUser.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { title, amount, type, category, notes, date } = req.body;

    if (
      type !== undefined &&
      !Object.values(TransactionType).includes(type as TransactionType)
    ) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (
      category !== undefined &&
      !Object.values(Category).includes(category as Category)
    ) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const data: Prisma.TransactionUpdateInput = {
      ...(title !== undefined && { title }),

      ...(amount !== undefined && {
        amount: new Prisma.Decimal(amount),
      }),

      ...(type !== undefined && { type }),

      ...(category !== undefined && { category }),

      ...(notes !== undefined && { notes }),

      ...(date && { date: new Date(date) }),

      updatedBy: {
        connect: { id: userId },
      },
    };

    const updated = await prisma.transaction.update({
      where: { id },
      data,
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating transaction" });
  }
};

//delete transaction

export const deleteTransaction = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const userId = req.payload.id;

    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId: existing.accountId,
        },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!isAdminOrOwner(accountUser.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting transaction" });
  }
};

//summary per account (with optional month/year filter)
export const getAccountSummary = async (
  req: Request<
    { accountId: string },
    {},
    {},
    { month?: string; year?: string }
  >,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.id;
    const { accountId } = req.params;
    const { month, year } = req.query;

    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: { userId, accountId },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Build date filter
    const dateFilter = buildDateFilter(month, year);

    const whereClause: Prisma.TransactionWhereInput = {
      accountId,
      ...dateFilter,
    };

    // Group by type
    const [summary, count] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["type"],
        where: whereClause,
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.count({
        where: whereClause,
      }),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    summary.forEach((item) => {
      const value = Number(item._sum.amount ?? 0);

      if (item.type === "INCOME") {
        totalIncome = value;
      } else if (item.type === "EXPENSE") {
        totalExpense = value;
      }
    });

    return res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: count,
      period: month && year ? `${month}/${year}` : "all-time",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generating summary" });
  }
};

//analytics by category (expenses only)
export const getCategoryAnalytics = async (
  req: Request<
    { accountId: string },
    {},
    {},
    { month?: string; year?: string }
  >,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.id;
    const { accountId } = req.params;
    const { month, year } = req.query;

    // validar membership
    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: { userId, accountId },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    // filtro opcional por mês
    const dateFilter = buildDateFilter(month, year);

    const whereClause: Prisma.TransactionWhereInput = {
      accountId,
      type: "EXPENSE",
      ...dateFilter,
    };

    // group by category
    const analytics = await prisma.transaction.groupBy({
      by: ["category"],
      where: whereClause,
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    });

    const totalExpenses = analytics.reduce(
      (acc, item) => acc + Number(item._sum.amount ?? 0),
      0,
    );

    const formatted = analytics.map((item) => {
      const total = Number(item._sum.amount ?? 0);

      return {
        category: item.category,
        total,
        percentage:
          totalExpenses > 0
            ? Number(((total / totalExpenses) * 100).toFixed(2))
            : 0,
      };
    });

    return res.json({
      totalExpenses,
      categories: formatted,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generating analytics" });
  }
};

// dashboard endpoint
export const getDashboardData = async (
  req: Request<
    { accountId: string },
    {},
    {},
    { month?: string; year?: string }
  >,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.id;
    const { accountId } = req.params;
    const { month, year } = req.query;

    // validar membership
    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: { userId, accountId },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    const dateFilter = buildDateFilter(month, year);

    const whereClause: Prisma.TransactionWhereInput = {
      accountId,
      ...dateFilter,
    };

    const [summaryData, count, categoryAnalytics, latestTransactions] =
      await Promise.all([
        prisma.transaction.groupBy({
          by: ["type"],
          where: whereClause,
          _sum: { amount: true },
        }),
        prisma.transaction.count({ where: whereClause }),
        prisma.transaction.groupBy({
          by: ["category"],
          where: {
            ...whereClause,
            type: "EXPENSE",
          },
          _sum: { amount: true },
          orderBy: {
            _sum: { amount: "desc" },
          },
        }),
        prisma.transaction.findMany({
          where: whereClause,
          orderBy: { date: "desc" },
          take: 5,
        }),
      ]);

    let totalIncome = 0;
    let totalExpense = 0;

    summaryData.forEach((item) => {
      const value = Number(item._sum.amount ?? 0);

      if (item.type === "INCOME") totalIncome = value;
      if (item.type === "EXPENSE") totalExpense = value;
    });

    const totalExpenses = categoryAnalytics.reduce(
      (acc, item) => acc + Number(item._sum.amount ?? 0),
      0,
    );

    const formattedCategories = categoryAnalytics.map((item) => {
      const total = Number(item._sum.amount ?? 0);
      return {
        category: item.category,
        total,
        percentage:
          totalExpenses > 0
            ? Number(((total / totalExpenses) * 100).toFixed(2))
            : 0,
      };
    });

    return res.json({
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: count,
        period: month && year ? `${month}/${year}` : "all-time",
      },
      analytics: {
        totalExpenses,
        categories: formattedCategories,
      },
      latestTransactions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generating dashboard" });
  }
};
