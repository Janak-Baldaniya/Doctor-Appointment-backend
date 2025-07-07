import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, "First Name Must Contain At Least 3 Characters!"],
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
    },
    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, "Provide A Valid Email!"],
    },
    phone: {
        type: String,
        required: true,
        minLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
        maxLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
    },
    AdharNumber: {
        type: String,
        required: [true, "Adhar Number Is Required!"],
        minLength: [12, "Adhar Number Must Contain Only 12 Digits!"],
        maxLength: [12, "Adhar Number Must Contain Only 12 Digits!"],
    },
    dob: {
        type: String,
        required: [true, "DOB Is Required!"],
    },
    gender: {
        type: String,
        required: [true, "Gender Is Required!"],
        enum: ["Male", "Female","Other"],
    },
    password: {
        type: String,
        required: [true, "Password Is Required!"],
        minLength: [8, "Password Must Contain At Least 8 Characters!"],
        select: false,
    },
    role: {
        type: String,
        required: [true, "User Role Required!"],
        enum: ["Patient", "Doctor", "Admin"],
    },
    doctorDepartment: {
        type: String,
    },
    docAvatar: {
        public_id: String,
        url: String,
    },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
  };

 const user = mongoose.model("user", userSchema);
 export default user;

 