import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Create order (server side - create Razorpay order)
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;
    if (!orderItems || orderItems.length === 0) return res.status(400).json({ message: "No order items" });

    // Validate all orderItems have product ID
    for (const item of orderItems) {
      if (!item.product) {
        return res.status(400).json({ message: "Product ID missing in order items" });
      }
    }

    // create order in DB (not paid yet)
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: false,
    });
    const createdOrder = await order.save();

    if (paymentMethod === "razorpay") {
      const options = {
        amount: Math.round(totalPrice * 100),
        currency: "INR",
        receipt: `receipt_${createdOrder._id}`,
      };
      const rzOrder = await razorpay.orders.create(options);
      return res.status(201).json({ order: createdOrder, razorpayOrder: rzOrder });
    }

    res.status(201).json({ order: createdOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Payment verification endpoint
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: "paid",
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    await order.save();

    // Decrease stock quantity for each ordered product
    for (const item of order.orderItems) {
      const prod = await Product.findById(item.product);
      if (prod) {
        prod.countInStock = Math.max(0, prod.countInStock - item.qty);
        await prod.save();
      }
    }

    res.json({ message: "Payment verified and order updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(403).json({ message: "Forbidden" });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
