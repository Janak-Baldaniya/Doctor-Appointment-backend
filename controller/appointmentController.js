import { catchAsyncErrors } from "../middleware/catchAsyncerror.js";
import { Appointment } from "../models/appointmentSchema.js";
import User from "../models/userSchema.js";

// Create Appointment
export const postAppointment = catchAsyncErrors(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        AdharNumber,
        dob,
        gender,
        appointment_date,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address,
    } = req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !AdharNumber ||
        !dob ||
        !gender ||
        !appointment_date ||
        !department ||
        !doctor_firstName ||
        !doctor_lastName ||
        !address
    ) {
        return res.status(400).json({
            success: false,
            message: "Please Fill All Fields!",
        });
    }
    const isConflict = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department,
    });
    if (isConflict.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Doctor Not Found! Please Check The Name And Department!",
        });
    }

    if (isConflict.length > 1) {
        return res.status(400).json({
            success: false,
            message: "Doctors Conflict! Please Contact Through Email Or Phone!",
        });
    }
    const doctorId = isConflict[0]._id;
    const patientId = req.user._id;
    const appointment = await Appointment.create({
        firstName,
        lastName,
        email,
        phone,
        AdharNumber,
        dob,
        gender,
        appointment_date,
        department,
        doctor: {
            firstName: doctor_firstName,
            lastName: doctor_lastName,
        },
        hasVisited,
        address,
        doctorId,
        patientId,
    });
    res.status(200).json({
        success: true,
        message: "Appointment Send Successfully!",
        appointment,
    });
});

// Get All Appointments
export const getAllAppointments = catchAsyncErrors(async (req, res) => {
    const appointments = await Appointment.find();
    res.status(200).json({
        success: true,
        appointments,
    });
});


export const updateAppointmentStatus = catchAsyncErrors(
    async (req, res) => {
        const { id } = req.params;
        let appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment Not Found!",
            });
        }
        appointment = await Appointment.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        res.status(200).json({
            success: true,
            message: "Appointment Status Updated!",
            appointment,
        });

    }
);

export const deleteAppointment = catchAsyncErrors(async (req, res) => {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "Appointment Not Found!",
        });
    }
    await appointment.deleteOne();
    res.status(200).json({
        success: true,
        message: "Appointment Deleted Successfully!",
    });
});