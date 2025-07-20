import mongoose from "mongoose";
import { getBST } from "../utils/index.js";

export const getAdminSchedulePipeline = () => {
    const today = getBST();
    today.setHours(0, 0, 0, 0);

    return [
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
            },
        },
        {
            $project: {
                title: 1,
                startTime: 1,
                endTime: 1,
                "trainer.name": 1,
                "trainer.email": 1,
                bookedCount: 1,
                isFull: 1,
            },
        },
    ];
};

export const getUserSchedulePipeline = (userId: string) => {
    const today = getBST();
    today.setHours(0, 0, 0, 0);

    return [
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
                title: 1,
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
};

export const getUserBookingsPipeline = (userId: string) => {
    const today = getBST();
    today.setHours(0, 0, 0, 0);

    return [
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
};
