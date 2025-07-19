import express from "express";
import { getSchedules } from "./trainer.controller.js";
const router = express.Router();
// Get Schedules
router.get("/schedules", getSchedules);
export default router;
