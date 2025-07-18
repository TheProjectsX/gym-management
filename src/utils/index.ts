import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const genHash = (data: string) => bcrypt.hashSync(data, 10);

export const genToken = (payload: any) =>
    jwt.sign(payload, process.env.JWT_SECRET || "");
