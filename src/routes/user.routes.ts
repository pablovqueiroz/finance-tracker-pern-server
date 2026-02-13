import { Router } from "express";
import { isAuthenticated } from "../middlewares/jwt.middleware.js";
import {
  deleteUser,
  getCurrentUser,
  updateUser,
} from "../controller/user.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

//get profile
router.get("/me", isAuthenticated, getCurrentUser);

export default router;

//upadate profile
router.put("/me", isAuthenticated, upload.single("image"), updateUser);

//delete profile
router.delete("/me", isAuthenticated, deleteUser);
