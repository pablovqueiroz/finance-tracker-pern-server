import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  createUser,
  googleLogin,
  login,
} from "../controller/user.controller.js";

const router = Router();

// register (user.controller.ts)
router.post("/register", upload.single("image"), createUser);

// login (user.controller.ts)
router.post("/login", login);

//login google (user.controller.ts)
router.post("/google", googleLogin);

export default router;
