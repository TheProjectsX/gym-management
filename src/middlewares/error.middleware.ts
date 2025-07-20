import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const globalErrorHandler = (
    err: Error & {
        statusCode?: number;
        errorDetails?: any;
    },
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || "Internal Server Error",
        ...(err.errorDetails ? { errorDetails: err.errorDetails } : {}),
    });
};
