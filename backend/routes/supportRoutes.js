import express from "express";
import Message from "../models/Message.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// create message (open to guest or logged user)
router.post("/", async (req, res) => {
  try {
    const { name, email, text } = req.body;
    const message = await Message.create({ name, email, text, user: req.user ? req.user._id : undefined });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Failed to save message" });
  }
});

// admin: list messages
router.get("/", protect, async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: "Admin only" });
  const msgs = await Message.find({}).sort({ createdAt: -1 });
  res.json(msgs);
});

export default router;
