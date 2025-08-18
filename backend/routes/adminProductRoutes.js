// =========================
// BACKEND: backend/routes/adminProductRoutes.js
// (admin product endpoints)
// =========================
import express from "express";
import {
  addProduct,
  updateProduct,
  getAdminProducts,
  deleteProduct,
} from "../controllers/adminProductController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// /api/admin/products
router
  .route("/products")
  .get(protect, admin, getAdminProducts)
  .post(
    protect,
    admin,
    upload.fields([{ name: "image" }, { name: "images" }]),
    addProduct
  );

// /api/admin/products/:id
router
  .route("/products/:id")
  .put(
    protect,
    admin,
    upload.fields([{ name: "image" }, { name: "images" }]),
    updateProduct
  )
  .delete(protect, admin, deleteProduct);

export default router;
