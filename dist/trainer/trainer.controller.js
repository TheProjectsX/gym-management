import { UserModel } from "../models/user.js";
import { ClassScheduleModel } from "../models/classSchedule.js";
import { StatusCodes } from "http-status-codes";
export const getSchedules = async (req, res) => {
    const user = req.user;
    try {
        const currentUser = await UserModel.findOne({ email: user?.email });
        const userId = currentUser?._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const schedules = await ClassScheduleModel.find({
            startTime: { $gte: today },
            trainerId: userId,
        });
        res.status(StatusCodes.OK).json({
            success: true,
            statusCode: StatusCodes.OK,
            message: "Schedules Parsed",
            data: [...schedules],
        });
    }
    catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to Parse Schedule Data",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
