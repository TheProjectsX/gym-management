import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user.js";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ClassScheduleModel } from "../models/classSchedule.js";
import { getAdminSchedulePipeline } from "../db/pipelines.js";

export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await UserModel.find({}, { password: 0 });

        res.status(StatusCodes.OK).json({
            success: true,
            statusCode: StatusCodes.OK,
            message: "Users Parsed Successfully",
            data: users,
        });
    } catch (e) {
        const error = new Error("Failed to Parse Users");
        next(error);
    }
};

export const upgradeToTrainer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Validation error occurred.",
            errorDetails: {
                field: "id",
                message: "Invalid user ID provided",
            },
        });
    }

    try {
        const targetUser = await UserModel.findById(id);
        if (!targetUser)
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                statusCode: StatusCodes.NOT_FOUND,
                message: "User not found",
            });

        if (targetUser.role === "trainer") {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                statusCode: StatusCodes.CONFLICT,
                message: "User is already a Trainer",
            });
        }

        await UserModel.updateOne({ _id: id }, { $set: { role: "trainer" } });

        res.status(StatusCodes.OK).json({
            success: true,
            statusCode: StatusCodes.OK,
            message: "User upgraded to Trainer",
        });
    } catch (e) {
        const error = new Error("Failed to Upgrade User");
        next(error);
    }
};

export const downgradeToTrainee = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Validation error occurred.",
            errorDetails: {
                field: "id",
                message: "Invalid user ID provided",
            },
        });
    }

    try {
        const targetUser = await UserModel.findById(id);
        if (!targetUser)
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                statusCode: StatusCodes.NOT_FOUND,
                message: "User not found",
            });

        if (targetUser.role === "trainee") {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                statusCode: StatusCodes.CONFLICT,
                message: "User is already a Trainee",
            });
        }

        await UserModel.updateOne({ _id: id }, { $set: { role: "trainee" } });

        res.status(StatusCodes.OK).json({
            success: true,
            statusCode: StatusCodes.OK,
            message: "User downgraded to Trainee",
        });
    } catch (e) {
        const error = new Error("Failed to Downgrade User");
        next(error);
    }
};

export const createSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { startTime, trainerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Validation error occurred.",
            errorDetails: {
                field: "trainerId",
                message: "Invalid trainer ID provided",
            },
        });
    }

    // Check if Time already Passed
    if (new Date(startTime).getTime() < Date.now()) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Given time has Already Passed",
        });
    }

    try {
        const startDateTime = new Date(startTime);

        // Check if already 5 booked
        const dayStart = new Date(new Date(startDateTime).setHours(0, 0, 0, 0));
        const dayEnd = new Date(
            new Date(startDateTime).setHours(23, 59, 59, 999)
        );

        const schedules = await ClassScheduleModel.find({
            startTime: {
                $gte: dayStart,
                $lt: dayEnd,
            },
        });

        if (schedules.length === 5) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "Maximum 5 Classes already Created for the Date",
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
                statusCode: StatusCodes.BAD_REQUEST,
                message: "New Class time overlaps with Other Class",
            });
        }
    } catch (e) {
        const error = new Error("Failed to Create Schedule");
        return next(error);
    }

    // Create Schedule
    try {
        const targetTrainer = await UserModel.findById(trainerId);
        if (!targetTrainer)
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                statusCode: StatusCodes.NOT_FOUND,
                message: "Target trainer not found for the class schedule",
            });

        if (targetTrainer.role !== "trainer")
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                statusCode: StatusCodes.NOT_FOUND,
                message: "Target user is not a Trainer",
            });

        const newSchedule = new ClassScheduleModel({
            startTime,
            endTime: new Date(
                new Date(startTime).getTime() + 2 * 60 * 60 * 1000
            ).toJSON(),
            trainer: trainerId,
        });

        const response = await newSchedule.save();

        res.status(StatusCodes.CREATED).json({
            success: true,
            statusCode: StatusCodes.CREATED,
            message: "Schedule Created Successfully",
            ...response.toObject(),
        });
    } catch (e) {
        const error = new Error("Failed to Create Schedule");
        next(error);
    }
};

export const getSchedules = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const schedules = await ClassScheduleModel.aggregate(
            getAdminSchedulePipeline()
        );

        res.status(StatusCodes.OK).json({
            success: true,
            statusCode: StatusCodes.OK,
            message: "Schedules Parsed",
            data: schedules,
        });
    } catch (e) {
        const error = new Error("Failed to Parse Schedules");
        next(error);
    }
};
