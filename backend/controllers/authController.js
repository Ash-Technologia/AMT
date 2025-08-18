import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validationResult } from "express-validator";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Create user with role "customer" explicitly, admins only via seeder
    user = new User({ name, email, password, provider: "local", role: "customer", isAdmin: false });
    await user.save();

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// OAuth success redirect (called by passport after OAuth)
export const oauthSuccess = (req, res) => {
  if (!req.user) return res.status(400).json({ message: "OAuth failed" });
  const token = generateToken(req.user);
  res.json({
    token,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      role: req.user.role,
    },
  });
};

