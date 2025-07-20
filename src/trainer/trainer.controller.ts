import type { NextFunction, Request, Response } from "express";
import { ClassScheduleModel } from "../models/classSchedule.js";
import { StatusCodes } from "http-status-codes";
import { getBST } from "../utils/index.js";

export const getSchedules = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;

    try {
        const today = getBST();
        today.setHours(0, 0, 0, 0);

        const schedules = await ClassScheduleModel.find({
            startTime: { $gte: today },
            trainer: userId,
        });

        res.status(StatusCodes.OK).json({
            success: true,
            statusCode: StatusCodes.OK,
            message: "Schedules Parsed",
            data: [...schedules],
        });
    } catch (e) {
        const error = new Error("Failed to Parse Schedules");
        next(error);
    }
};
