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
            .json({
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Authentication failed!",
            });
    }

    try {
        const decrypted = verifyToken(access_token);
        req.user = decrypted as tokenPayload;
    } catch (error) {
        return res
            .clearCookie("access_token", cookieOptions)
            .status(StatusCodes.UNAUTHORIZED)
            .json({
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Authentication failed!",
            });
    }

    next();
};

export const checkAlreadyLoggedIn = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { access_token } = req.cookies;
    if (!access_token) {
        return next();
    }

    try {
        verifyToken(access_token);
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Already Logged In",
        });
    } catch (error) {
        next();
    }
};

export const checkAdminAuthorization = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (user?.role !== "admin") {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            statusCode: StatusCodes.FORBIDDEN,
            message: "Unauthorized Request",
        });
    }

    next();
};

export const checkTrainerAuthorization = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (user?.role !== "trainer") {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            statusCode: StatusCodes.FORBIDDEN,
            message: "Unauthorized Request",
        });
    }

    next();
};
