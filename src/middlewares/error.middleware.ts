import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const globalErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || "Internal Server Error",
    });
};
