import { Router } from "express";
import {
  getAccountMembers,
  removeMember,
  updateMemberRole,
} from "../controller/accountMembers.controller.js";

const router = Router({ mergeParams: true });

// get all members
router.get("/", getAccountMembers);

// update member role
router.patch("/:memberId", updateMemberRole);

// remove member
router.delete("/:memberId", removeMember);

export default router;
