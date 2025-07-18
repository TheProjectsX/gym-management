import { Schema, model } from "mongoose";

export enum Role {
    Admin = "admin",
    Trainer = "trainer",
    Trainee = "trainee",
}

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.Trainee,
        },
    },
    { timestamps: true }
);

export const UserModel = model("User", userSchema);
