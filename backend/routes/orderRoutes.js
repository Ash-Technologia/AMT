// backend/routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  verifyPayment,
  getOrderById,
  getUserOrders,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.post("/verify", protect, verifyPayment);

router.get("/myorders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

export default router;

