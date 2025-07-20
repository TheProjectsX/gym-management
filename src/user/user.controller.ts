import { NextFunction, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserModel } from "../models/user.js";
import { createError, genHash, genToken, hashMatched } from "../utils/index.js";
import { ClassScheduleModel } from "../models/classSchedule.js";
import mongoose from "mongoose";
import { BookingModel } from "../models/booking.js";
import {
    getUserBookingsPipeline,
    getUserSchedulePipeline,
} from "../db/pipelines.js";

export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? ("none" as "none")
            : ("strict" as "strict"),
};

/* Public */

export const registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const body = req.body;

    const hashedPassword = genHash(body.password);
    const doc = {
        name: body.name,
        email: body.email,
        password: hashedPassword,
    };

    try {
        const newUser = new UserModel(doc);
        const response = (await newUser.save()).toObject();

        const { password: _, ...userData } = response;

        const token = genToken({
            id: userData._id,
            email: userData.email,
            role: userData.role,
        });

        res.cookie("access_token", token, cookieOptions)
            .status(StatusCodes.CREATED)
            .json({
                success: true,
                statusCode: StatusCodes.CREATED,
                message: "Registration Successful!",
                ...userData,
            });
    } catch (e) {
        const error = new Error("Failed to Create Account");
        next(error);
    }
};

export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;

    try {
        const targetUser = await UserModel.findOne({ email });
        if (!targetUser)
            return next(
                createError("Invalid Credentials", StatusCodes.UNAUTHORIZED)
            );

        const matched = hashMatched(password, targetUser.password);
        if (!matched)
            return next(
                createError("Invalid Credentials", StatusCodes.UNAUTHORIZED)
            );

        const { password: _, ...userData } = targetUser.toObject();

        const token = genToken({
            id: userData._id,
            email: userData.email,
            role: userData.role,
        });

        res.cookie("access_token", token, cookieOptions)
            .status(StatusCodes.OK)
            .json({
                success: true,
                statusCode: StatusCodes.OK,
                message: "Login Successful!",
                ...userData,
            });
    } catch (e) {
        const error = new Error("Failed to Login");
        next(error);
    }
};

/* Private */
export const logoutUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.clearCookie("access_token", cookieOptions).status(StatusCodes.OK).json({
        success: true,
        statusCode: StatusCodes.OK,
        message: "Logout Successful",
    });
};

export const getSchedules = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;

    try {
        const schedules = await ClassScheduleModel.aggregate(
            getUserSchedulePipeline(userId!)
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

export const bookSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.body;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(
            createError("Validation error occurred.", StatusCodes.BAD_REQUEST, {
                field: "id",
                message: "Invalid schedule ID provided",
            })
        );
    }

    try {
        const targetSchedule = await ClassScheduleModel.findById(id);
        if (!targetSchedule)
            return next(
                createError("Schedule not found", StatusCodes.NOT_FOUND)
            );

        const bookings = await BookingModel.find({ schedule: id });

        // If already booked, we don't need to show if already full or not!
        const alreadyBooked = bookings.some(
            (booking) => String(booking.user) === userId
        );

        if (alreadyBooked) {
            return next(
                createError(
                    "You already Booked this Schedule",
                    StatusCodes.BAD_REQUEST
                )
            );
        }

        if (bookings.length === 10) {
            return next(
                createError(
                    "Class schedule is full. Maximum 10 trainees allowed per schedule.",
                    StatusCodes.BAD_REQUEST
                )
            );
        }

        const newBook = new BookingModel({
            user: userId,
            schedule: id,
        });

        const response = await newBook.save();

        res.status(StatusCodes.CREATED).json({
            success: true,
            statusCode: StatusCodes.CREATED,
            message: "Schedule Booked Successfully",
            ...response.toObject(),
        });
    } catch (e) {
        const error = new Error("Failed to Book Schedule");
        next(error);
    }
};

export const getBookings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;

    try {
        const schedules = await BookingModel.aggregate(
            getUserBookingsPipeline(userId!)
        );

        res.status(StatusCodes.OK).json({
            success: true,
            statusCode: StatusCodes.OK,
            message: "Schedules Parsed",
            data: [...schedules],
        });
    } catch (e) {
        const error = new Error("Failed to Parse Bookings");
        next(error);
    }
};

export const cancelBooking = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.body;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(
            createError("Validation error occurred.", StatusCodes.BAD_REQUEST, {
                field: "id",
                message: "Invalid booking ID provided",
            })
        );
    }

    try {
        const targetBooking = await BookingModel.findById(id);
        if (!targetBooking)
            return next(
                createError("Booking not found", StatusCodes.NOT_FOUND)
            );

        if (String(targetBooking.user) !== userId) {
            return next(
                createError("Unauthorized Request", StatusCodes.UNAUTHORIZED)
            );
        }

        await BookingModel.findByIdAndDelete(id);

        res.status(StatusCodes.OK).json({
            success: true,
            statusCode: StatusCodes.OK,
            message: "Booking canceled successfully",
        });
    } catch (e) {
        const error = new Error("Failed to Cancel Booking");
        next(error);
    }
};
