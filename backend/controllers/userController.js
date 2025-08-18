import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validationResult } from "express-validator";

const generateToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // default to customer role and isAdmin false
    const user = await User.create({ name, email, password, provider: "local", role: "customer", isAdmin: false });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// save/merge cart after login
export const saveCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart || [];
    const serverMap = {};
    user.cart.forEach(ci => serverMap[String(ci.product)] = ci);

    for (const ci of cartItems) {
      const key = String(ci.product);
      if (serverMap[key]) {
        serverMap[key].qty = Math.max(serverMap[key].qty, ci.qty);
      } else {
        user.cart.push(ci);
      }
    }

    await user.save();
    res.json({ message: "Cart merged", cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isAdmin = !!req.body.isAdmin;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "User not found" });
    await u.deleteOne();
    res.json({ message: "User removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};