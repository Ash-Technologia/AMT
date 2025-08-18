import express from "express";
import BlogPost from "../models/BlogPost.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const posts = await BlogPost.find({}).sort({ publishedAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch post" });
  }
});

export default router;
