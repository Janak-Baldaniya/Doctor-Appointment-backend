import { catchAsyncErrors } from "../middleware/catchAsyncerror.js";
import { Message } from "../models/messageSchema.js";
import ErrorHandler from "../middleware/errorMiddleware.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log('Request body:', req.body); // Add logging to debug

        const { firstName, lastName, email, phone, message } = req.body;

        // Validate request body
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing"
            });
        }

        if (!firstName || !lastName || !email || !phone || !message) {
            return next(new ErrorHandler(400, "Please Provide All The Fields!"));
        }

        await Message.create({
            firstName,
            lastName,
            email,
            phone,
            message,
        });

        return res.status(200).json({
            success: true,
            message: "Message Sent Successfully!"
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while sending the message"
        });
    }
})

// delete message
export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    try {
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }
        await Message.findByIdAndDelete(id); // <-- Updated line
        return res.status(200).json({
            success: true,
            message: "Message deleted successfully"
        });
    } catch (error) {
        console.error('Error in deleteMessage:', error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the message"
        });
    }
})

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
    const messages = await Message.find();
    res.status(200).json({
        success: true,
        messages
    });
})
