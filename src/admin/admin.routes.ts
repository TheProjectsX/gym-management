import express from "express";
import { upgradeToTrainer } from "./admin.controller.js";

const router = express.Router();

router.post("/trainer/upgrade", upgradeToTrainer);

export default router;
