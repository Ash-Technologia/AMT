import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// @desc   Get all categories
// @route  GET /api/categories
// @access Public
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc   Create a new category
// @route  POST /api/categories
// @access Public (for now, make it protected later)
router.post("/", async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name, description });
    const savedCategory = await category.save();

    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc   Get category by ID
// @route  GET /api/categories/:id
// @access Public
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
