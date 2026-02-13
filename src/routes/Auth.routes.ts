import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import { createUser, login } from "../controller/user.controller.js";

const router = Router();

// register (user.controller.ts)
router.post("/register", upload.single("image"), createUser);

// login (user.controller.ts)
router.post("/login", login);

export default router;