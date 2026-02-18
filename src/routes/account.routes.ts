import { Router } from "express";
import { isAuthenticated } from "../middlewares/jwt.middleware.js";
import { isAccountMember } from "../middlewares/isAccountMember.middleware.js";
import {
  getAccounts,
  getAccountbyId,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../controller/account.controller.js";
import accountMemberRoutes from "../routes/accountMembers.routes.js";

const router = Router();

//  GET all accounts for logged user
router.get("/", isAuthenticated, getAccounts);

// GET specific account
router.get("/:accountId", isAuthenticated, isAccountMember, getAccountbyId);

//CREATE account
router.post("/", isAuthenticated, createAccount);

// UPDATE account
router.put("/:accountId", isAuthenticated, isAccountMember, updateAccount);

// DELETE account
router.delete("/:accountId", isAuthenticated, isAccountMember, deleteAccount);

//manage members
router.use(
  "/:accountId/members",
  isAuthenticated,
  isAccountMember,
  accountMemberRoutes,
);

export default router;
