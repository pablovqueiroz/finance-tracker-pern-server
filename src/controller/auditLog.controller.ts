import type { Request, Response } from "express";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

//get all audit logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params as { accountId: string };
    const { action, entityType, startDate, endDate } = req.query;

    const where: Prisma.AuditLogWhereInput = {
      accountId,
    };

    if (action) {
      where.action = action as any;
    }

    if (entityType) {
      where.entityType = String(entityType);
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(String(startDate));
      }
      if (endDate) {
        where.createdAt.lte = new Date(String(endDate));
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching audit logs" });
  }
};

//get a specific logs 
export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const { id, accountId } = req.params as { id: string; accountId: string };

    const log = await prisma.auditLog.findFirst({
      where: {
        id,
        accountId,
      },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    return res.status(200).json(log);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching audit log" });
  }
};
