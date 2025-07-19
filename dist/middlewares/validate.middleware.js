import { validateLogin, validateRegister, validateSchedule, } from "../validators/index.js";
import { StatusCodes } from "http-status-codes";
export const validateUserRegister = (req, res, next) => {
    const body = req.body;
    const validation = validateRegister(body);
    if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json(validation);
    }
    else {
        next();
    }
};
export const validateUserLogin = (req, res, next) => {
    const body = req.body;
    const validation = validateLogin(body);
    if (!validation.success) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Invalid Credentials",
        });
    }
    else {
        next();
    }
};
export const validateNewSchedule = (req, res, next) => {
    const body = req.body;
    const validation = validateSchedule(body);
    if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json(validation);
    }
    else {
        next();
    }
};
