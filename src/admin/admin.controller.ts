import type { Request, Response } from "express";
import { UserModel } from "../models/user.js";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ClassScheduleModel } from "../models/classSchedule.js";

export const upgradeToTrainer = async (req: Request, res: Response) => {
    const { id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Validation error occurred.",
            errorDetails: {
                field: "id",
                message: "Invalid ID provided",
            },
        });
    }

    try {
        const targetUser = await UserModel.findById(id);
        if (!targetUser)
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ success: false, message: "User not found" });

        if (targetUser.role === "trainer") {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Role is already Trainer",
            });
        }

        await UserModel.updateOne({ _id: id }, { $set: { role: "trainer" } });

        res.status(StatusCodes.OK).json({
            success: true,
            statusCode: StatusCodes.OK,
            message: "User upgraded to Trainer",
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to Upgrade User",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const createSchedule = async (req: Request, res: Response) => {
    const { startTime, trainerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Validation error occurred.",
            errorDetails: {
                field: "id",
                message: "Invalid ID provided",
            },
        });
    }

    // Check if already 5 Schedules Created
    try {
        const startDateTime = new Date(startTime);

        // Check if already 5 booked
        const dayStart = new Date(startDateTime.setHours(0, 0, 0, 0));
        const dayEnd = new Date(startDateTime.setHours(23, 59, 59, 999));

        const schedules = await ClassScheduleModel.find({
            startTime: {
                $gte: dayStart,
                $lt: dayEnd,
            },
        });

        if (schedules.length === 5) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Maximum number of Classes Created for the Date",
            });
        }

        // Check if Overlaps
        const isOverlap = schedules.some((schedule) => {
            const start = new Date(schedule.startTime);
            const end = new Date(schedule.endTime);

            return start <= startDateTime && end > startDateTime;
        });

        if (isOverlap) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "New Class overlaps with Other Class",
            });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to Create Schedule",
            error: error instanceof Error ? error.message : String(error),
        });
    }

    // Create Schedule
    try {
        const targetTrainer = await UserModel.findById(trainerId);
        if (!targetTrainer)
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Target trainer not found for the class schedule",
            });

        const newSchedule = new ClassScheduleModel({
            startTime,
            endTime: new Date(
                new Date(startTime).getTime() + 2 * 60 * 60 * 1000
            ).toJSON(),
            trainerId,
        });

        const response = await newSchedule.save();

        res.status(StatusCodes.CREATED).json({
            success: true,
            statusCode: StatusCodes.CREATED,
            message: "Schedule Created Successfully",
            ...response.toObject(),
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to Create Schedule",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
