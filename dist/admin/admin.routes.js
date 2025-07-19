import express from "express";
import { createSchedule, upgradeToTrainer } from "./admin.controller.js";
const router = express.Router();
// Upgrade Trainee to Trainer
router.post("/trainer/upgrade", upgradeToTrainer);
// Schedule new Class
router.post("/schedules/new", createSchedule);
export default router;
