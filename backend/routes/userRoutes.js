import express from "express";
import { body } from "express-validator";
import { registerUser, loginUser, saveCart, getAllUsers, updateUserRole, deleteUser } from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  registerUser
);

router.post("/login", loginUser);

router.post("/cart", protect, saveCart);

router.use(protect, admin);

router.get("/", getAllUsers);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
