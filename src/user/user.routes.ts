import express from "express";
import { loginUser, logoutUser, registerUser } from "./user.controller.js";
import {
    validateUserLogin,
    validateUserRegister,
} from "../middlewares/validate.middleware.js";
import { checkUserAuthentication } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Register new User
router.post("/register", validateUserRegister, registerUser);

// Login User
router.post("/login", validateUserLogin, loginUser);

// Logout User
router.get("/logout", checkUserAuthentication, logoutUser);

export default router;
