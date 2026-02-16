import { AccountRole } from "../../generated/prisma/client.js";

export const isAdminOrOwner = (role: AccountRole) => {
  return role === "ADMIN" || role === "OWNER";
};