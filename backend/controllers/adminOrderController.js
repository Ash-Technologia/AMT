// =========================
// BACKEND: backend/controllers/adminOrderController.js
// (copy/replace — ensures correct responses expected by frontend)
// =========================
import Order from "../models/Order.js";

export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, parseInt(req.query.limit || "50"));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(),
    ]);

    res.json({ data: orders, meta: { total, page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("getAllOrders err:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const deleteOrder = async (req, res) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: "Order not found" });
    await o.deleteOne();
    res.json({ message: "Order removed" });
  } catch (err) {
    console.error("deleteOrder err:", err);
    res.status(500).json({ message: err.message });
  }
};
