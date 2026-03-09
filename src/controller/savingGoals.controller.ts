import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import {
  Category,
  Prisma,
  TransactionType,
} from "../../generated/prisma/client.js";
import { logAudit, toAuditJson } from "../utils/auditLog.js";

//create a saving goals
interface createSavingGoalBody {
  title: string;
  targetAmount: number;
  deadline: string;
  notes?: string;
  accountId: string;
  createdById: string;
}

export const createSavingGoal = async (
  req: Request<{}, {}, createSavingGoalBody>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;

    const { title, targetAmount, deadline, notes, accountId } = req.body;

    if (!title || targetAmount == null || !accountId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const data = {
      title,
      targetAmount: new Prisma.Decimal(targetAmount),
      deadline: deadline ? new Date(deadline) : null,
      notes: notes ?? null,
      accountId,
      createdById: userId,
    };

    const membership = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: "Access denied." });
    }
    const savingGoal = await prisma.savingGoal.create({ data });

    await logAudit({
      action: "CREATE",
      entityType: "SavingGoal",
      entityId: savingGoal.id,
      performedById: userId,
      accountId: savingGoal.accountId,
      newData: toAuditJson(savingGoal),
    });

    return res.status(201).json(savingGoal);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating saving goal" });
  }
};

//get all saving goals per account
export const getSavingGoals = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;
    const { accountId } = req.params as { accountId: string };

    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId,
        },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied." });
    }
    const savingGoals = await prisma.savingGoal.findMany({
      where: { accountId },
      orderBy: { deadline: "desc" },
    });
    return res.status(200).json(savingGoals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching Saving Goals" });
  }
};

//get savingGoal by id
export const getSavingGoalById = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;
    const { id } = req.params as { id: string };

    const savingGoal = await prisma.savingGoal.findUnique({
      where: { id },
    });

    if (!savingGoal) {
      return res.status(404).json({ message: "Saving goal not found." });
    }

    const accountUser = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId: savingGoal.accountId,
        },
      },
    });

    if (!accountUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(savingGoal);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching saving goal." });
  }
};

//move money to saving goal
interface MoveMoneyBody {
  amount: number;
  type: "ADD" | "REMOVE";
}

export const moveMoneyOnSavingGoal = async (
  req: Request<{ id: string }, {}, MoveMoneyBody>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;
    const { id } = req.params;
    const { amount, type } = req.body;

    if (amount == null || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero.",
      });
    }

    if (type !== "ADD" && type !== "REMOVE") {
      return res.status(400).json({
        message: "Invalid operation type.",
      });
    }

    const savingGoal = await prisma.savingGoal.findFirst({
      where: {
        id,
        account: {
          users: {
            some: { userId },
          },
        },
      },
    });

    if (!savingGoal) {
      return res.status(404).json({
        message: "Saving goal not found.",
      });
    }

    if (type === "REMOVE" && savingGoal.currentAmount.lt(amount)) {
      return res.status(400).json({
        message: "Insufficient funds.",
      });
    }

    const accountTransactions = await prisma.transaction.groupBy({
      by: ["type"],
      where: { accountId: savingGoal.accountId },
      _sum: { amount: true },
    });

    let accountIncome = 0;
    let accountExpense = 0;

    accountTransactions.forEach((item) => {
      const value = Number(item._sum.amount ?? 0);
      if (item.type === TransactionType.INCOME) {
        accountIncome = value;
      } else if (item.type === TransactionType.EXPENSE) {
        accountExpense = value;
      }
    });

    const accountBalance = accountIncome - accountExpense;

    if (type === "ADD") {
      const newAmount = savingGoal.currentAmount.add(amount);
      if (newAmount.gt(savingGoal.targetAmount)) {
        return res.status(400).json({
          message: "Target amount exceeded.",
        });
      }

      if (accountBalance < amount) {
        return res.status(400).json({
          message: "Insufficient account balance.",
        });
      }
    }

    const updatedGoal = await prisma.$transaction(async (tx) => {
      const goal = await tx.savingGoal.update({
        where: { id },
        data: {
          currentAmount:
            type === "ADD" ? { increment: amount } : { decrement: amount },
          updatedById: userId,
        },
      });

      await tx.transaction.create({
        data: {
          title:
            type === "ADD"
              ? `Transfer to saving goal: ${savingGoal.title}`
              : `Transfer from saving goal: ${savingGoal.title}`,
          amount: new Prisma.Decimal(amount),
          type:
            type === "ADD"
              ? TransactionType.EXPENSE
              : TransactionType.INCOME,
          category: Category.OTHERS,
          notes:
            type === "ADD"
              ? "Debit from account to saving goal"
              : "Credit from saving goal to account",
          accountId: savingGoal.accountId,
          createdById: userId,
        },
      });

      return goal;
    });

    await logAudit({
      action: "UPDATE",
      entityType: "SavingGoal",
      entityId: updatedGoal.id,
      performedById: userId,
      accountId: updatedGoal.accountId,
      oldData: toAuditJson(savingGoal),
      newData: toAuditJson(updatedGoal),
    });

    return res.status(200).json(updatedGoal);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error processing saving goal movement.",
    });
  }
};

//update saving goal
interface updateSavingGoalBody {
  title?: string;
  targetAmount?: number;
  deadline?: string;
  notes?: string;
}

export const updateSavingGoal = async (
  req: Request<{ id: string }, {}, updateSavingGoalBody>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;
    const { id } = req.params;

    const existing = await prisma.savingGoal.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Saving goal not found" });
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

    const { title, targetAmount, deadline, notes } = req.body;

    const data: Prisma.SavingGoalUpdateInput = {
      ...(title !== undefined && { title }),
      ...(targetAmount !== undefined && {
        targetAmount: new Prisma.Decimal(targetAmount),
      }),
      ...(deadline !== undefined && {
        deadline: deadline ? new Date(deadline) : null,
      }),
      ...(notes !== undefined && {
        notes: notes ?? null,
      }),
      updatedBy: {
        connect: { id: userId },
      },
    };

    const updated = await prisma.savingGoal.update({
      where: { id },
      data,
    });

    await logAudit({
      action: "UPDATE",
      entityType: "SavingGoal",
      entityId: updated.id,
      performedById: userId,
      accountId: updated.accountId,
      oldData: toAuditJson(existing),
      newData: toAuditJson(updated),
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating saving goal" });
  }
};

//delete saving goal
export const deleteSavingGoal = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const existing = await prisma.savingGoal.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Saving goal not found" });
    }

    const userId = req.payload.userId;

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

    await prisma.savingGoal.delete({
      where: { id },
    });

    await logAudit({
      action: "DELETE",
      entityType: "SavingGoal",
      entityId: existing.id,
      performedById: userId,
      accountId: existing.accountId,
      oldData: toAuditJson(existing),
    });

    return res.json({ message: "Saving goal deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting saving goal" });
  }
};
