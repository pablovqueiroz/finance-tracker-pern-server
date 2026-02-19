import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import type { Currency } from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { logAudit, toAuditJson } from "../utils/auditLog.js";

//get all accounts by user
export const getAccounts = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;

    const memberships = await prisma.accountUser.findMany({
      where: { userId },
      include: { account: true },
    });

    const accounts = memberships.map((member) => member.account);

    return res.status(200).json(accounts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching accounts." });
  }
};

//get a specific account
interface AccountParams {
  accountId: string;
}
export const getAccountbyId = async (req: Request, res: Response) => {
  try {
    const accountIdParam = req.params.accountId;

    if (!accountIdParam || Array.isArray(accountIdParam)) {
      return res.status(400).json({
        message: "Invalid account ID.",
      });
    }

    const accountId: string = accountIdParam;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        users: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }
    return res.status(200).json(account);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching account." });
  }
};

//create a account
interface CreateAccountBody {
  name: string;
  description: string;
  currency?: Currency;
}

export const createAccount = async (
  req: Request<{}, {}, CreateAccountBody>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;
    const { name, description, currency } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Account name is required." });
    }

    const account = await prisma.account.create({
      data: {
        name,
        description,
        currency: currency ?? "EUR",
        users: { create: { userId, role: "OWNER" } },
      },
    });

    await logAudit({
      action: "CREATE",
      entityType: "Account",
      entityId: account.id,
      performedById: userId,
      accountId: account.id,
      newData: toAuditJson(account),
    });

    return res.status(201).json(account);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating account." });
  }
};

// update a account
interface UpadateAccountBody {
  name?: string;
  description?: string;
  currency?: Currency;
}

export const updateAccount = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = req.payload.userId;
    const { accountId } = req.params as { accountId: string };
    const { name, description, currency } = req.body;

    const membership = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId,
        },
      },
    });

    if (
      !membership ||
      (membership.role !== "OWNER" && membership.role !== "ADMIN")
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this account" });
    }

    const updateData: Prisma.AccountUpdateInput = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (currency !== undefined) updateData.currency = currency;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No data provided to update.",
      });
    }

    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
    });

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: updateData,
    });

    await logAudit({
      action: "UPDATE",
      entityType: "Account",
      entityId: updated.id,
      performedById: userId,
      accountId: updated.id,
      ...(existingAccount && { oldData: toAuditJson(existingAccount) }),
      newData: toAuditJson(updated),
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating account." });
  }
};

//delete a account
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;
    const { accountId } = req.params as { accountId: string };

    const membership = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId,
        },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      return res.status(403).json({
        message: "Only the OWNER can delete this account.",
      });
    }

    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
    });

    await prisma.account.delete({
      where: { id: accountId },
    });

    if (existingAccount) {
      await logAudit({
        action: "DELETE",
        entityType: "Account",
        entityId: existingAccount.id,
        performedById: userId,
        accountId: existingAccount.id,
        oldData: toAuditJson(existingAccount),
      });
    }

    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error deleting account.",
    });
  }
};
