import user from "../models/userSchema.js";
import { catchAsyncErrors } from "../middleware/catchAsyncerror.js";
import jwt from "jsonwebtoken";

// Middleware to authenticate dashboard users
export const isAdminAuthenticated = catchAsyncErrors(
    async (req, res, next) => {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json(
                {
                    success: false,
                    message: "Admin is not authenticated!"
                }
            );
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await user.findById(decoded.id);
        if (req.user.role !== "Admin") {
            return res.status(403).json(
                {
                    success: false,
                    message: `${req.user.role} not authorized to access this resource!`
                }
            );
        }
        next();
    }
);

// Middleware to authenticate patient users
export const isPatientAuthenticated = catchAsyncErrors(
    async (req, res, next) => {
        const token = req.cookies.patientToken;
        if (!token) {
            return res.status(401).json(
                {
                    success: false,
                    message: "Patient is not authenticated!"
                }
            );
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await user.findById(decoded.id);
        if (req.user.role !== "Patient") {
            return res.status(403).json(
                {
                    success: false,
                    message: `${req.user.role} not authorized to access this resource!`
                }
            );
        }
        next();
    }
);
