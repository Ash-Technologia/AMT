// =========================
// BACKEND: backend/routes/adminOrderRoutes.js
// =========================
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getAllOrders, deleteOrder, getOrderById } from "../controllers/adminOrderController.js";

const router = express.Router();

router.use(protect, admin);

// GET all orders for admin
router.get("/", getAllOrders);

// GET order details by id for admin
router.get("/:id", getOrderById);

// DELETE order by id for admin
router.delete("/:id", deleteOrder);

export default router;
