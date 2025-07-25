import { Schema, model, Types } from "mongoose";

const classScheduleSchema = new Schema(
    {
        title: { type: String, require: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        trainer: { type: Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export const ClassScheduleModel = model("ClassSchedule", classScheduleSchema);
