import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const genHash = (data) => bcrypt.hashSync(data, 10);
export const hashMatched = (data, encrypted) => bcrypt.compareSync(data, encrypted);
export const genToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || "", { expiresIn: "7d" });
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET || "");
