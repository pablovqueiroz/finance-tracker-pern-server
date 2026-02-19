import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export const toAuditJson = (value: unknown): Prisma.InputJsonValue => {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
};

interface LogAuditParams {
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityId: string;
  performedById: string;
  accountId: string;
  oldData?: Prisma.InputJsonValue;
  newData?: Prisma.InputJsonValue;
}

export const logAudit = async ({
  action,
  entityType,
  entityId,
  performedById,
  accountId,
  oldData,
  newData,
}: LogAuditParams) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        performedById,
        accountId,
        ...(oldData !== undefined && { oldData }),
        ...(newData !== undefined && { newData }),
      },
    });
  } catch (error) {
    // Audit failures must not block business operations.
    console.error(`Audit log error (${entityType}):`, error);
  }
};
