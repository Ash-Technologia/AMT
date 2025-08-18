// backend/routes/contactRoutes.js
import express from "express";
import { sendMessage } from "../controllers/contactController.js";

const router = express.Router();

// Public contact form
router.post("/", sendMessage);

export default router;
