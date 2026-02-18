import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import crypto from "crypto";


//expired invites
export const expirePendingInvites = async (where: {
  email?: string;
  invitedById?: string;
}) => {
  await prisma.accountInvite.updateMany({
    where: {
      ...where,
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
};

//send invite
export const sendInvite = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { email, accountId, role } = req.body;
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
      return res.status(403).json({ message: "Not allowed." });
    }

    // check if has already invites sent
    const existingInvite = await prisma.accountInvite.findFirst({
      where: {
        email,
        accountId,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return res.status(400).json({ message: "Invite already exists." });
    }

    //generate random token
    const token = crypto.randomBytes(32).toString("hex");

    const invite = await prisma.accountInvite.create({
      data: {
        email,
        accountId,
        role,
        token,
        invitedById: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(201).json(invite);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending invite." });
  }
};

//get received invites
export const getReceivedInvites = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userEmail = req.payload.email;

    await expirePendingInvites({ email: userEmail });

    const invites = await prisma.accountInvite.findMany({
      where: {
        email: userEmail,
        status: "PENDING",
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        invitedBy: {
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

    return res.status(200).json(invites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching invites." });
  }
};

//get all invites sent
export const getSentInvites = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;

    await expirePendingInvites({ invitedById: userId });

    const invites = await prisma.accountInvite.findMany({
      where: {
        invitedById: userId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(invites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching sent invites." });
  }
};

//get expired invites sent by current user
export const getExpiredInvites = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload.userId;

    await expirePendingInvites({ invitedById: userId });

    const invites = await prisma.accountInvite.findMany({
      where: {
        invitedById: userId,
        status: "EXPIRED",
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json(invites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching expired invites." });
  }
};

//accept invite
export const acceptInvite = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { token } = req.params as { token: string };
    const userId = req.payload.userId;
    const userEmail = req.payload.email;

    const invite = await prisma.accountInvite.findUnique({ where: { token } });

    if (!invite || invite.status !== "PENDING") {
      return res.status(400).json({ message: "Invalid invite." });
    }
    if (invite.email !== userEmail) {
      return res.status(403).json({ message: "This invite is not yours." });
    }
    if (invite.expiresAt < new Date()) {
      await prisma.accountInvite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return res.status(400).json({ message: "Invite expired." });
    }

    const existingMembership = await prisma.accountUser.findUnique({
      where: {
        userId_accountId: {
          userId,
          accountId: invite.accountId,
        },
      },
    });

    if (existingMembership) {
      return res.status(400).json({ message: "Already a member." });
    }

    await prisma.$transaction([
      prisma.accountUser.create({
        data: { userId, accountId: invite.accountId, role: invite.role },
      }),
      prisma.accountInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    return res.status(200).json({ message: "Invite accepted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error accepting invite." });
  }
};

//expire invite manually
export const expireInvite = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { inviteId } = req.params as { inviteId: string };
    const userId = req.payload.userId;

    const invite = await prisma.accountInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return res.status(404).json({ message: "Invite not found." });
    }

    if (invite.invitedById !== userId) {
      return res.status(403).json({ message: "Not allowed." });
    }

    if (invite.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending invites can be expired.",
      });
    }

    await prisma.accountInvite.update({
      where: { id: inviteId },
      data: { status: "EXPIRED" },
    });

    return res.status(200).json({ message: "Invite expired." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error expiring invite." });
  }
};

//reject invite
export const rejectInvite = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { token } = req.params as { token: string };
    const userEmail = req.payload.email;

    const invite = await prisma.accountInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.email !== userEmail) {
      return res.status(403).json({ message: "Not alloweds." });
    }

    await prisma.accountInvite.update({
      where: { id: invite.id },
      data: { status: "CANCELLED" },
    });
    return res.status(200).json({ message: "Invite rejected" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error rejecting invite." });
  }
};

//cancel invite
export const cancelInvite = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { inviteId } = req.params as { inviteId: string };
    const userId = req.payload.userId;

    const invite = await prisma.accountInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.invitedById !== userId) {
      return res.status(403).json({ message: "Not allowed." });
    }

    await prisma.accountInvite.update({
      where: { id: inviteId },
      data: { status: "CANCELLED" },
    });

    return res.status(200).json({ message: "Invite cancelled." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error cancelling invite." });
  }
};
