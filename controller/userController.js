import { catchAsyncErrors } from "../middleware/catchAsyncerror.js";  // Fix the path
import ErrorHandler from "../middleware/errorMiddleware.js";
import user from "../models/userSchema.js";
import User from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js"; // Import jwtToken if needed
import cloudinary from "cloudinary";


export const patientRegister = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, AdharNumber, dob, gender, password } =
        req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !AdharNumber ||
        !dob ||
        !gender ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "Please Fill Full Form!",
        });
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return res.status(400).json({
            success: false,
            message: "User already Registered!",
        });
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        AdharNumber,
        dob,
        gender,
        password,
        role: "Patient",
    });
    generateToken(user, "User Registered Successfully", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "Please Fill All Fields!",
        });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid Email Or Password!",
        });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return res.status(400).json({
            success: false,
            message: "Invalid Email Or Password!",
        });
    }
    if (role !== user.role) {
        return res.status(400).json({
            success: false,
            message: `User Not Found With This Role!`,
        });
    }
    generateToken(user, "Login Successful", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, AdharNumber, dob, gender, password } =
        req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !AdharNumber ||
        !dob ||
        !gender ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "Please Fill Full Form!",
        });
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return res.status(400).json({
            success: false,
            message: `${isRegistered.role} with this email already exists!`,
        });
    }

    const admin = await User.create({
        firstName,
        lastName,
        email,
        phone,
        AdharNumber,
        dob,
        gender,
        password,
        role: "Admin",
    });
    res.status(200).json({
        success: true,
        message: "New Admin Registered",
        admin,
    });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
    const doctors = await user.find({ role: "Doctor" });
    res.status(200).json({
        success: true,
        doctors,
    });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const users = req.user; // Assuming req.user is populated by authentication middleware
    res.status(200).json({
        success: true,
        users,
    });
});

// Logout function for dashboard admin
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
    res
        .status(201)
        .cookie("adminToken", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
            secure:true, // Set to true if using HTTPS
            sameSite: 'None', // Set to 'None' if using HTTPS
        })
        .json({
            success: true,
            message: "Admin Logged Out Successfully.",
        });
});


// Logout function for frontend patient
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
    res
        .status(201)
        .cookie("patientToken", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
            secure:true, // Set to true if using HTTPS
            sameSite: 'None', // Set to 'None' if using HTTPS
        })
        .json({
            success: true,
            message: "Patient Logged Out Successfully.",
        });
});

export const addNewDoctor = catchAsyncErrors(async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Doctor Avatar is Required!",
        });
    }
    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/.jpg", "image/webp", "image/jpeg"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
        return res.status(400).json({
            success: false,
            message: "Invalid File Format!",
        });
    }
    const {
        firstName,
        lastName,
        email,
        phone,
        AdharNumber,
        dob,
        gender,
        password,
        doctorDepartment,
    } = req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !AdharNumber ||
        !dob ||
        !gender ||
        !password ||
        !doctorDepartment ||
        !docAvatar
    ) {
        return res.status(400).json({
            success: false,
            message: "Please Fill Full Form!",
        });
    }
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return res.status(400).json({
            success: false,
            message: `${isRegistered.role} with this email already exists!`,
        });
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
        docAvatar.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        return res.status(500).json({
            success: false,
            message: "Failed to upload doctor avatar to Cloudinary",
        });
    }
    const doctor = await User.create({
        firstName,
        lastName,
        email,
        phone,
        AdharNumber,
        dob,
        gender,
        password,
        role: "Doctor",
        doctorDepartment,
        docAvatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    res.status(200).json({
        success: true,
        message: "New Doctor Registered",
        doctor,
    });
});


export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const doctor = await User.findById(id);
    if (!doctor) {
        return next(new ErrorHandler("Doctor Not Found", 404));
    }
    await cloudinary.uploader.destroy(doctor.docAvatar.public_id);
    await User.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: "Doctor Deleted Successfully",
    });
});
