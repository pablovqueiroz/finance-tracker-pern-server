import dotenv from "dotenv";
import express from "express";
import config from "../config/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

dotenv.config();

const app = express();

config(app);

// auth.routes.ts
app.use("/auth", authRoutes);

// user.routes.ts
app.use("/users", userRoutes);

//account.routes.ts
app.use("/accounts", accountRoutes);

//transaction.routes.ts
app.use("/transactions", transactionRoutes);

export default app;
