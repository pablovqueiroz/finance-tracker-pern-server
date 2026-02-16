import { Router } from "express";
import { isAuthenticated } from "../middlewares/jwt.middleware.js";
import { isAccountMember } from "../middlewares/isAccountMember.middleware.js";
import { getAccountbyId } from "../controller/account.controller.js";

const router = Router();

router.get("/:accountId", isAuthenticated, isAccountMember, getAccountbyId);

export default router;
