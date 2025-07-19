import { verifyToken } from "../utils/index.js";
import { StatusCodes } from "http-status-codes";
import { cookieOptions } from "../user/user.controller.js";
export const checkUserAuthentication = async (req, res, next) => {
    const { access_token } = req.cookies;
    if (!access_token) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Authentication failed!" });
    }
    try {
        const decrypted = verifyToken(access_token);
        req.user = decrypted;
    }
    catch (error) {
        return res
            .clearCookie("access_token", cookieOptions)
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Authentication failed!" });
    }
    next();
};
export const checkAdminAuthorization = async (req, res, next) => {
    const user = req.user;
    if (user?.role !== "admin") {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Unauthorized Request",
        });
    }
    next();
};
export const checkTrainerAuthorization = async (req, res, next) => {
    const user = req.user;
    if (user?.role !== "trainer") {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Unauthorized Request",
        });
    }
    next();
};
