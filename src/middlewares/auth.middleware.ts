import type { Request, Response, NextFunction } from "express";
import { createError, verifyToken } from "../utils/index.js";
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
        return next(
            createError(
                "Unauthenticated Request",
                StatusCodes.UNAUTHORIZED,
                "You need to login to perform this action"
            )
        );
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
        next(createError("You are already Logged In", StatusCodes.BAD_REQUEST));
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
        return next(
            createError(
                "Unauthorized Request",
                StatusCodes.FORBIDDEN,
                "You must be an Admin to perform this action"
            )
        );
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
        return next(
            createError(
                "Unauthorized Request",
                StatusCodes.FORBIDDEN,
                "You must be an Trainer to perform this action"
            )
        );
    }

    next();
};
