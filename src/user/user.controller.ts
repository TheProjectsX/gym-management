import { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserModel } from "../models/user.js";
import { genHash, genToken, hashMatched } from "../utils/index.js";

export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? ("none" as "none")
            : ("strict" as "strict"),
};

export const registerUser = async (req: Request, res: Response) => {
    const body = req.body;

    const hashedPassword = genHash(body.password);
    const doc = {
        name: body.name,
        email: body.email,
        password: hashedPassword,
    };

    try {
        const newUser = new UserModel(doc);
        const response = (await newUser.save()).toObject();

        const { password: _, ...userData } = response;

        const token = genToken({
            id: userData._id,
            email: userData.email,
            role: userData.role,
        });

        res.cookie("access_token", token, cookieOptions)
            .status(StatusCodes.CREATED)
            .json({
                success: true,
                message: "Registration Successful!",
                ...userData,
            });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const targetUser = await UserModel.findOne({ email });
        if (!targetUser)
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid Credentials",
            });

        const matched = hashMatched(password, targetUser.password);
        if (!matched)
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid Credentials",
            });

        const { password: _, ...userData } = targetUser.toObject();

        const token = genToken({
            id: userData._id,
            email: userData.email,
            role: userData.role,
        });

        res.cookie("access_token", token, cookieOptions)
            .status(StatusCodes.CREATED)
            .json({
                success: true,
                message: "Login Successful!",
                ...userData,
            });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    res.clearCookie("access_token", cookieOptions)
        .status(StatusCodes.OK)
        .json({ success: true, message: "Logout Successful" });
};
