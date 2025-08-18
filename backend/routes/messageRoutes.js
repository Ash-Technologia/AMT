import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// Get all messages (admin only)
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
