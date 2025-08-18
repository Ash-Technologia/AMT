// backend/routes/adminMessageRoutes.js
import express from "express";
import {
  getAllMessages,
  getMessagesCount,
  deleteMessage,
} from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin - list, count, delete
router.get("/messages", protect, admin, getAllMessages);
router.get("/messages/count", protect, admin, getMessagesCount);
router.delete("/messages/:id", protect, admin, deleteMessage);

export default router;
