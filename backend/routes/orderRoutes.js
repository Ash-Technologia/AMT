import express from "express";
import {
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  createPhonePeOrder,
  phonePeCallback,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ PhonePe routes
router.post("/phonepe", protect, createPhonePeOrder);
router.post("/phonepe/callback", phonePeCallback);

router.get("/myorders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
