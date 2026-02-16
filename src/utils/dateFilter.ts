import { Prisma } from "../../generated/prisma/client.js";

export const buildDateFilter = (
  month?: string,
  year?: string,
): Prisma.TransactionWhereInput => {
  if (!month || !year) return {};

  const m = Number(month);
  const y = Number(year);

  if (isNaN(m) || isNaN(y)) return {};

  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 0, 23, 59, 59, 999);

  return {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };
};