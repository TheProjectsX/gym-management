import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db/index.js";
// Routes
import userRoutes from "./user/user.routes.js";
// Configure App
dotenv.config({ quiet: true });
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Injecting Routes
app.use("/api/users", userRoutes);
// Connect Database and Start App
console.log("Starting...");
connectDB().then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running...`);
    });
});
