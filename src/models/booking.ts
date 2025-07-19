import { Schema, model, Types } from "mongoose";

const bookingSchema = new Schema(
    {
        user: { type: Types.ObjectId, ref: "User", required: true },
        schedule: {
            type: Types.ObjectId,
            ref: "ClassSchedule",
            required: true,
        },
    },
    { timestamps: true }
);

export const BookingModel = model("Booking", bookingSchema);
