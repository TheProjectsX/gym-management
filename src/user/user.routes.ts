import express from "express";
import {
    bookSchedule,
    cancelBooking,
    getBookings,
    getSchedules,
    loginUser,
    logoutUser,
    registerUser,
} from "./user.controller.js";
import {
    validateUserLogin,
    validateUserRegister,
} from "../middlewares/validate.middleware.js";
import {
    checkAlreadyLoggedIn,
    checkUserAuthentication,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

/* Public Routes */

// Register new User
router.post(
    "/register",
    checkAlreadyLoggedIn,
    validateUserRegister,
    registerUser
);

// Login User
router.post("/login", checkAlreadyLoggedIn, validateUserLogin, loginUser);

/* Private Routes */

// Logout User
router.get("/logout", checkUserAuthentication, logoutUser);

// Get Schedules
router.get("/me/schedules", checkUserAuthentication, getSchedules);

// Book a Schedule
router.post("/me/schedules/book", checkUserAuthentication, bookSchedule);

// Get all Bookings
router.get("/me/bookings", checkUserAuthentication, getBookings);

// Cancel a Booking
router.post("/me/bookings/cancel", checkUserAuthentication, cancelBooking);

export default router;
