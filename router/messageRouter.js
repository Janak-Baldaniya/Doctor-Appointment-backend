import express from "express";
import {
    sendMessage,
} from "../controller/messageController.js";
import { isAdminAuthenticated } from "../middleware/auth.js";
import { getAllMessages } from "../controller/messageController.js";
import { deleteMessage } from "../controller/messageController.js";

const router = express.Router();


router.post("/send", sendMessage);
router.get("/getAll", isAdminAuthenticated, getAllMessages);
router.delete("/delete/:id", isAdminAuthenticated, deleteMessage);


export default router;