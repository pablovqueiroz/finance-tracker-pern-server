import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionsById,
  updateTransaction,
  deleteTransaction,
  getAccountSummary,
  getCategoryAnalytics,
  getDashboardData,
} from "../controller/transaction.controller.js";

import { isAuthenticated } from "../middlewares/jwt.middleware.js";

const router = Router();

// CREATE transaction
router.post("/", isAuthenticated, createTransaction);

// GET all transactions per account
router.get("/account/:accountId", isAuthenticated, getTransactions);

// GET account summary (income, expense, balance)
router.get("/summary/:accountId", isAuthenticated, getAccountSummary);

// GET analytics by category (expenses breakdown)
router.get("/analytics/:accountId", isAuthenticated, getCategoryAnalytics);

// GET dashboard data (summary + analytics + latest transactions)
router.get("/dashboard/:accountId", isAuthenticated, getDashboardData);

// GET single transaction by ID
router.get("/:id", isAuthenticated, getTransactionsById);

// UPDATE transaction by ID
router.put("/:id", isAuthenticated, updateTransaction);

// DELETE transaction by ID
router.delete("/:id", isAuthenticated, deleteTransaction);

export default router;