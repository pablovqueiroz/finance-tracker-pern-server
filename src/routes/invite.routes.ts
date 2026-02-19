import { Router } from "express";
import { isAuthenticated } from "../middlewares/jwt.middleware.js";
import {
  acceptInvite,
  cancelInvite,
  expireInvite,
  getExpiredInvites,
  getReceivedInvites,
  getSentInvites,
  rejectInvite,
  sendInvite,
} from "../controller/invites.controller.js";

const router = Router();

//get received invites
router.get("/received", isAuthenticated, getReceivedInvites);

//get invites sent
router.get("/sent", isAuthenticated, getSentInvites);

//get expired invites sent by current user
router.get("/expired", isAuthenticated, getExpiredInvites);

//send invites
router.post("/", isAuthenticated, sendInvite);

//accept invites
router.post("/:token/accept", isAuthenticated, acceptInvite);

//reject invites
router.post("/:token/reject", isAuthenticated, rejectInvite);

//expire invite manually
router.patch("/:inviteId/expire", isAuthenticated, expireInvite);

//cancel invite
router.post("/:inviteId", isAuthenticated, cancelInvite);
router.patch("/:inviteId/cancel", isAuthenticated, cancelInvite);
router.delete("/:inviteId", isAuthenticated, cancelInvite);

export default router;
