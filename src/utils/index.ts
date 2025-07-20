import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const genHash = (data: string) => bcrypt.hashSync(data, 10);

export const hashMatched = (data: string, encrypted: string) =>
    bcrypt.compareSync(data, encrypted);

export const genToken = (payload: any) =>
    jwt.sign(payload, process.env.JWT_SECRET || "", { expiresIn: "7d" });

export const verifyToken = (token: string) =>
    jwt.verify(token, process.env.JWT_SECRET || "");

export const getBST = () =>
    new Date(new Date().toLocaleString(undefined, { timeZone: "Asia/Dhaka" }));

export const createError = (
    message: string,
    statusCode?: number,
    errorDetails?: any
) => {
    const error = new Error(message) as Error & {
        statusCode?: number;
        errorDetails?: any;
    };
    error.statusCode = statusCode;
    error.errorDetails = errorDetails;

    return error;
};
