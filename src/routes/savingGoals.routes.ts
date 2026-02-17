import { Router } from "express";
import { isAuthenticated } from "../middlewares/jwt.middleware.js";
import {
  createSavingGoal,
  deleteSavingGoal,
  getSavingGoalById,
  getSavingGoals,
  moveMoneyOnSavingGoal,
  updateSavingGoal,
} from "../controller/savingGoals.controller.js";

const router = Router();

//get all savingGoals
router.get("/account/:accountId", isAuthenticated, getSavingGoals);

//get a savingGoal by id
router.get("/:id", isAuthenticated, getSavingGoalById);

//create a savingGoal
router.post("/", isAuthenticated, createSavingGoal);

//move money
router.post("/:id/move-money", isAuthenticated, moveMoneyOnSavingGoal);

//update a savingGoal
router.put("/:id", isAuthenticated, updateSavingGoal);

//delete a savingGoal
router.delete("/:id", isAuthenticated, deleteSavingGoal);

export default router;
