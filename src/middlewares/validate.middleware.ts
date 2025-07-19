import type { NextFunction, Request, Response } from "express";
import {
    validateLogin,
    validateRegister,
    validateSchedule,
} from "../validators/index.js";
import { StatusCodes } from "http-status-codes";

export const validateUserRegister = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const body = req.body;
    const validation = validateRegister(body);

    if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json(validation);
    } else {
        next();
    }
};

export const validateUserLogin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const body = req.body;
    const validation = validateLogin(body);

    if (!validation.success) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Invalid Credentials",
        });
    } else {
        next();
    }
};

export const validateNewSchedule = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const body = req.body;
    const validation = validateSchedule(body);

    if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json(validation);
    } else {
        next();
    }
};
