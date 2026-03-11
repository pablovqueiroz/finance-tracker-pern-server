import "./utils/env.js";
import express from "express";
import config from "../config/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import savingGoalsRoutes from "./routes/savingGoals.routes.js";
import inviteRoutes from "./routes/invite.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

config(app);

// auth.routes.ts
app.use("/api/auth", authRoutes);

// user.routes.ts
app.use("/api/users", userRoutes);

//account.routes.ts
app.use("/api/accounts", accountRoutes);

//transaction.routes.ts
app.use("/api/transactions", transactionRoutes);

//savingGoals.routes.ts
app.use("/api/saving-goals", savingGoalsRoutes);

//invites.routes.ts
app.use("/api/invites", inviteRoutes);

//auditLog.routes.js
app.use("/api", auditLogRoutes);

//error handler (must be after routes)
app.use(errorHandler);

export default app;
