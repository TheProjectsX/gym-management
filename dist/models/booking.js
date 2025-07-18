import { Schema, model, Types } from "mongoose";
const bookingSchema = new Schema({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    classScheduleId: {
        type: Types.ObjectId,
        ref: "ClassSchedule",
        required: true,
    },
}, { timestamps: true });
export const BookingModel = model("Booking", bookingSchema);
