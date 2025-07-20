import type { NextFunction, Request, Response } from "express";
import {
    validateLogin,
    validateRegister,
    validateSchedule,
} from "../validators/index.js";
import { StatusCodes } from "http-status-codes";
import { createError } from "../utils/index.js";

export const validateUserRegister = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const body = req.body;

    const validation = validateRegister(body);

    if (!validation.success) {
        return next(
            createError(
                "Validation error occurred",
                StatusCodes.BAD_REQUEST,
                validation.errorDetails
            )
        );
    }
    next();
};

export const validateUserLogin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const body = req.body;
    const validation = validateLogin(body);

    if (!validation.success) {
        return next(
            createError("Invalid Credentials", StatusCodes.UNAUTHORIZED)
        );
    }

    next();
};

export const validateNewSchedule = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const body = req.body;
    const validation = validateSchedule(body);

    if (!validation.success) {
        return next(
            createError(
                "Validation error occurred",
                StatusCodes.BAD_REQUEST,
                validation.errorDetails
            )
        );
    }
    next();
};
