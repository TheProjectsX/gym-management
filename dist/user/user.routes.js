import express from "express";
import { StatusCodes } from "http-status-codes";
import { validateUser } from "../validators/index.js";
import { UserModel } from "../models/user.js";
import { genHash, genToken } from "../utils/index.js";
const router = express.Router();
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production"
        ? "none"
        : "strict",
};
// Register new User
router.post("/register", async (req, res) => {
    const body = req.body;
    const validation = validateUser(body);
    if (!validation.success)
        return res.status(StatusCodes.BAD_REQUEST).json(validation);
    const hashedPassword = genHash(body.password);
    const doc = {
        name: body.name,
        email: body.email,
        password: hashedPassword,
    };
    try {
        const newUser = new UserModel(doc);
        const response = await newUser.save();
        const token = genToken({
            id: response._id,
            email: response.email,
            role: response.role,
        });
        res.cookie("access_token", token, cookieOptions)
            .status(StatusCodes.CREATED)
            .json({ success: true, message: "Registration Successful!" });
    }
    catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
export default router;
