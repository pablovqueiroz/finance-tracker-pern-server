import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { AccountRole } from "../../generated/prisma/enums.js";
import { logAudit, toAuditJson } from "../utils/auditLog.js";

//get all members of an account
export const getAccountMembers = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { accountId } = req.params as { accountId: string };
    const userId = req.payload.userId;

    const membership = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const members = await prisma.accountUser.findMany({
      where: { accountId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(members);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching account members" });
  }
};

//update member role
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { accountId, memberId } = req.params as {
      accountId: string;
      memberId: string;
    };

    const { role } = req.body as { role: AccountRole };
    if (!Object.values(AccountRole).includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const userId = req.payload.userId;

    const currentUserMembership = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId,
        },
      },
    });

    if (!currentUserMembership || currentUserMembership.role !== "OWNER") {
      return res.status(403).json({ message: "Only OWNER can update roles." });
    }

    const memberToUpdate = await prisma.accountUser.findUnique({
      where: { id: memberId },
    });

    if (!memberToUpdate || memberToUpdate.accountId !== accountId) {
      return res.status(404).json({
        message: "Member not found in this account.",
      });
    }

    if (memberToUpdate.userId === userId && role !== "OWNER") {
      return res.status(400).json({
        message: "Owner cannot change their own role.",
      });
    }

    if (memberToUpdate.role === "OWNER" && role !== "OWNER") {
      const ownersCount = await prisma.accountUser.count({
        where: { accountId, role: "OWNER" },
      });

      if (ownersCount <= 1) {
        return res.status(400).json({
          message: "Account must have at least one owner.",
        });
      }
    }

    const updated = await prisma.accountUser.update({
      where: { id: memberId },
      data: { role },
    });

    await logAudit({
      action: "UPDATE",
      entityType: "AccountMember",
      entityId: updated.id,
      performedById: userId,
      accountId,
      oldData: toAuditJson(memberToUpdate),
      newData: toAuditJson(updated),
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating member role" });
  }
};

//remove member
export const removeMember = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { accountId, memberId } = req.params as {
      accountId: string;
      memberId: string;
    };
    const userId = req.payload.userId;

    const currentUserMembership = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId,
        },
      },
    });

    if (!currentUserMembership || currentUserMembership.role !== "OWNER") {
      return res
        .status(403)
        .json({ message: "Only OWNER can delete account members." });
    }

    const memberToRemove = await prisma.accountUser.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove || memberToRemove.accountId !== accountId) {
      return res
        .status(404)
        .json({ message: "Member not found in this account." });
    }

    if (memberToRemove.userId === userId) {
      return res.status(400).json({
        message: "Owner cannot remove themselves.",
      });
    }

    if (memberToRemove.role === "OWNER") {
      const ownersCount = await prisma.accountUser.count({
        where: {
          accountId,
          role: "OWNER",
        },
      });
      if (ownersCount <= 1) {
        return res
          .status(400)
          .json({ message: "Account must have al least one owner." });
      }
    }

    await prisma.accountUser.delete({
      where: { id: memberId },
    });

    await logAudit({
      action: "DELETE",
      entityType: "AccountMember",
      entityId: memberToRemove.id,
      performedById: userId,
      accountId,
      oldData: toAuditJson(memberToRemove),
    });

    return res.status(200).json({ message: "Member removed." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error removing account member" });
  }
};
