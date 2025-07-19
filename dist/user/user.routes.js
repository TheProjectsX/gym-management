import express from "express";
import { bookSchedule, cancelBooking, getSchedules, loginUser, logoutUser, registerUser, } from "./user.controller.js";
import { validateUserLogin, validateUserRegister, } from "../middlewares/validate.middleware.js";
import { checkUserAuthentication } from "../middlewares/auth.middleware.js";
const router = express.Router();
/* Public Routes */
// Register new User
router.post("/register", validateUserRegister, registerUser);
// Login User
router.post("/login", validateUserLogin, loginUser);
/* Private Routes */
// Logout User
router.get("/logout", checkUserAuthentication, logoutUser);
// Get Schedules
router.get("/me/schedules", checkUserAuthentication, getSchedules);
// Book a Schedule
router.post("/me/schedules/book", checkUserAuthentication, bookSchedule);
// Cancel a Schedule
router.post("/me/schedules/cancel", checkUserAuthentication, cancelBooking);
export default router;
