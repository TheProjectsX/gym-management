import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/index.js";
import { StatusCodes } from "http-status-codes";
import { cookieOptions } from "../user/user.controller.js";

export type tokenPayload = {
    id: string;
    email: string;
    role: "admin" | "trainer" | "trainee";
};

declare global {
    namespace Express {
        interface Request {
            user?: tokenPayload;
        }
    }
}

export const checkUserAuthentication = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { access_token } = req.cookies;
    if (!access_token) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Authentication failed!" });
    }

    try {
        const decrypted = verifyToken(access_token);
        req.user = decrypted as tokenPayload;
    } catch (error) {
        return res
            .clearCookie("access_token", cookieOptions)
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Authentication failed!" });
    }

    next();
};
