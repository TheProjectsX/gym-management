import { NextFunction, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserModel } from "../models/user.js";
import { genHash, genToken, hashMatched } from "../utils/index.js";
import { ClassScheduleModel } from "../models/classSchedule.js";
import mongoose from "mongoose";
import { BookingModel } from "../models/booking.js";

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
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Invalid Credentials",
            });

        const matched = hashMatched(password, targetUser.password);
        if (!matched)
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Invalid Credentials",
            });

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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pipeline = [
            {
                $match: {
                    startTime: { $gte: today },
                },
            },
            {
                $lookup: {
                    from: "bookings",
                    localField: "_id",
                    foreignField: "schedule",
                    as: "bookings",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "trainer",
                    foreignField: "_id",
                    as: "trainer",
                },
            },
            {
                $unwind: "$trainer",
            },
            {
                $addFields: {
                    bookedCount: { $size: "$bookings" },
                    isFull: { $eq: [{ $size: "$bookings" }, 10] },
                    isBooked: {
                        $in: [
                            new mongoose.Types.ObjectId(userId),
                            "$bookings.user",
                        ],
                    },
                },
            },
            {
                $project: {
                    startTime: 1,
                    endTime: 1,
                    "trainer.name": 1,
                    "trainer.email": 1,
                    bookedCount: 1,
                    isFull: 1,
                    isBooked: 1,
                },
            },
        ];

        const schedules = await ClassScheduleModel.aggregate(pipeline);

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
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Validation error occurred.",
            errorDetails: {
                field: "id",
                message: "Invalid schedule ID provided",
            },
        });
    }

    try {
        const targetSchedule = await ClassScheduleModel.findById(id);
        if (!targetSchedule)
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                statusCode: StatusCodes.NOT_FOUND,
                message: "Schedule not found",
            });

        const bookings = await BookingModel.find({ schedule: id });

        // If already booked, we don't need to show if already full or not!
        const alreadyBooked = bookings.some(
            (booking) => String(booking.user) === userId
        );

        if (alreadyBooked) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "You already Booked this Schedule",
            });
        }

        if (bookings.length === 10) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message:
                    "Class schedule is full. Maximum 10 trainees allowed per schedule.",
            });
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pipeline = [
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "classschedules",
                    localField: "schedule",
                    foreignField: "_id",
                    as: "scheduleInfo",
                },
            },
            {
                $unwind: "$scheduleInfo",
            },
            {
                $match: {
                    "scheduleInfo.startTime": {
                        $gte: today,
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "scheduleInfo.trainer",
                    foreignField: "_id",
                    as: "trainerInfo",
                },
            },
            { $unwind: "$trainerInfo" },
            {
                $project: {
                    schedule: 1,
                    scheduleInfo: {
                        startTime: 1,
                        endTime: 1,
                    },
                    trainer: {
                        name: "$trainerInfo.name",
                        email: "$trainerInfo.email",
                    },
                },
            },
        ];

        const schedules = await BookingModel.aggregate(pipeline);

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
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Validation error occurred.",
            errorDetails: {
                field: "id",
                message: "Invalid booking ID provided",
            },
        });
    }

    try {
        const targetBooking = await BookingModel.findById(id);
        if (!targetBooking)
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                statusCode: StatusCodes.NOT_FOUND,
                message: "Booking not found",
            });

        if (String(targetBooking.user) !== userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Unauthorized Request",
            });
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
