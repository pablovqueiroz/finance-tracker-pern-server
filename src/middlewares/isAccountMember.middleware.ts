import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const isAccountMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = req.payload.userId;

    const accountIdParam = req.params.accountId;

    if (!accountIdParam || Array.isArray(accountIdParam)) {
      return res.status(400).json({
        message: "Invalid account ID.",
      });
    }

    const accountId = accountIdParam;

    const membership = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You do not have access to this account.",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error verifying account membership.",
    });
  }
};
