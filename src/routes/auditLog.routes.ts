import { Router } from "express";
import { getAuditLogById, getAuditLogs } from "../controller/auditLog.controller.js";
import { isAuthenticated } from "../middlewares/jwt.middleware.js";
import { isAccountMember } from "../middlewares/isAccountMember.middleware.js";


const router = Router();

//get all the logs 
router.get("/accounts/:accountId/audit-logs", isAuthenticated, isAccountMember,getAuditLogs);

//get a specific logs 
router.get("/accounts/:accountId/audit-logs/:id", isAuthenticated, isAccountMember, getAuditLogById);

export default router;