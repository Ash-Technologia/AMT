// backend/routes/orderRoutes.js
import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  checkRazorpayOrderStatus
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create order (creates DB order and Razorpay order)
router.post("/razorpay/create", protect, createRazorpayOrder);

// Verify payment after client completes checkout
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

// Webhook endpoint (Razorpay server -> your server). Usually not protected as Razorpay calls it.
router.post("/razorpay/webhook", razorpayWebhook);

router.get("/myorders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

// Optional: check razorpay order status by merchantOrderId
router.get("/razorpay/status/:merchantOrderId", protect, checkRazorpayOrderStatus);

export default router;