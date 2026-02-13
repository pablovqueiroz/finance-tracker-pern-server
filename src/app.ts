import dotenv from "dotenv";
import express from "express";
import config from "../config/index.js";
import authRoutes from "./routes/Auth.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

config(app);

// Auth.routes.ts
app.use("/auth", authRoutes);

// User.routes.ts
app.use("/users", userRoutes);

export default app;
