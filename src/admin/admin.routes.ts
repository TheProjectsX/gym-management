import express from "express";
import {
    createSchedule,
    downgradeToTrainee,
    getSchedules,
    getUsers,
    upgradeToTrainer,
} from "./admin.controller.js";
import { validateNewSchedule } from "../middlewares/validate.middleware.js";

const router = express.Router();

// Get Users
router.get("/users", getUsers);

// Upgrade Trainee to Trainer
router.post("/trainer/upgrade", upgradeToTrainer);

// Downgrade Trainer to Trainee
router.post("/trainer/downgrade", downgradeToTrainee);

// Schedule new Class
router.post("/schedules/new", validateNewSchedule, createSchedule);

// Get Schedules
router.get("/schedules", getSchedules);

export default router;
