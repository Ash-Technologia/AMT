// =========================
// BACKEND: backend/routes/adminUserRoutes.js
// =========================
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getAllUsers, updateUserRole, deleteUser } from "../controllers/adminUserController.js";

const router = express.Router();
router.use(protect, admin);
router.get("/", getAllUsers);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);
export default router;
