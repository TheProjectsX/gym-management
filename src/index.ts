import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db/index.js";

// Routes
import userRoutes from "./user/user.routes.js";
import adminRoutes from "./admin/admin.routes.js";
import trainerRoutes from "./trainer/trainer.routes.js";
import {
    checkAdminAuthorization,
    checkTrainerAuthorization,
    checkUserAuthentication,
} from "./middlewares/auth.middleware.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

// Configure App
dotenv.config({ quiet: true });

const app = express();

app.use(cors({ credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/test", async (req: Request, res: Response) => {
    res.json({ success: true });
});

// Injecting Routes

// User Routes - contains public and private routes
app.use("/api/users", userRoutes);

// Admin Routes - contains protected routes
app.use(
    "/api/admin",
    checkUserAuthentication,
    checkAdminAuthorization,
    adminRoutes
);

// Trainer Routes - contains protected routes
app.use(
    "/api/trainer",
    checkUserAuthentication,
    checkTrainerAuthorization,
    trainerRoutes
);

// Global Error Handler
app.use(globalErrorHandler);

// Connect Database and Start App
console.log("Starting...");
connectDB().then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(
            `Server running on http://localhost:${process.env.PORT || 5000}`
        );
    });
});

// TODO: add global error handler
