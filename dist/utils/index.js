import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const genHash = (data) => bcrypt.hashSync(data, 10);
export const genToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || "");
