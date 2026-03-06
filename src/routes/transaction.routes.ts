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
  createManyTransactions,
} from "../controller/transaction.controller.js";

import { isAuthenticated } from "../middlewares/jwt.middleware.js";

const router = Router();

// create many transactions (bulk)
router.post("/bulk", isAuthenticated, createManyTransactions);

// create single transaction
router.post("/", isAuthenticated, createTransaction);

// get all transactions per account
router.get("/account/:accountId", isAuthenticated, getTransactions);

// get account summary (income, expense, balance)
router.get("/summary/:accountId", isAuthenticated, getAccountSummary);

// get analytics by category (expenses breakdown)
router.get("/analytics/:accountId", isAuthenticated, getCategoryAnalytics);

// get dashboard data (summary + analytics + latest transactions)
router.get("/dashboard/:accountId", isAuthenticated, getDashboardData);

// get single transaction by ID
router.get("/:id", isAuthenticated, getTransactionsById);

// update transaction by ID
router.put("/:id", isAuthenticated, updateTransaction);

// delete transaction by ID
router.delete("/:id", isAuthenticated, deleteTransaction);

export default router;
