// =========================
// BACKEND: backend/controllers/adminUserController.js
// (copy/replace — improved checks)
// =========================
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("getAllUsers err:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.user && user._id.equals(req.user._id) && isAdmin === false) {
      return res.status(400).json({ message: "You cannot revoke your own admin privileges" });
    }

    user.isAdmin = !!isAdmin;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (err) {
    console.error("updateUserRole err:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "User not found" });

    if (req.user && u._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    await u.deleteOne();
    res.json({ message: "User removed" });
  } catch (err) {
    console.error("deleteUser err:", err);
    res.status(500).json({ message: err.message });
  }
};
