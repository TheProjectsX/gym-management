import { Schema, model, Types } from "mongoose";

const classScheduleSchema = new Schema(
    {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        trainerId: { type: Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export const ClassScheduleModel = model("ClassSchedule", classScheduleSchema);
