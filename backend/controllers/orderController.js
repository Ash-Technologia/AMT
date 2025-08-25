import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import dotenv from "dotenv";
import crypto from "crypto";
import axios from "axios";
dotenv.config();

// ------------------- PHONEPE -------------------

// @desc    Create PhonePe order
// @route   POST /api/orders/phonepe
// @access  Private
export const createPhonePeOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ message: "No order items" });

    let itemsPrice = 0;
    let shippingPrice = 0;

    const validatedItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error("Product not found");
        itemsPrice += product.price * item.qty;

        if (product.shippingType === "cod") {
          shippingPrice += product.shippingCharge;
        }
        return {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          qty: item.qty,
        };
      })
    );

    const totalPrice = itemsPrice + shippingPrice;

    const order = new Order({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
    });
    await order.save();

    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    const env = process.env.PHONEPE_ENV;

    const baseUrl =
      env === "production"
        ? "https://api.phonepe.com/apis/pg/v1"
        : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1";

    const payload = {
      merchantId,
      merchantTransactionId: order._id.toString(),
      merchantUserId: req.user._id.toString(),
      amount: totalPrice * 100, // in paise
      redirectUrl: `${process.env.FRONTEND_URL}/order/${order._id}`,
      redirectMode: "POST",
      callbackUrl: `${process.env.BACKEND_URL}/api/orders/phonepe/callback`,
      mobileNumber: shippingAddress.phone,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const payloadStr = JSON.stringify(payload);
    const encoded = Buffer.from(payloadStr).toString("base64");

    const stringToSign = encoded + "/pg/v1/pay" + saltKey;
    const sha256 = crypto.createHash("sha256").update(stringToSign).digest("hex");
    const checksum = sha256 + "###" + saltIndex;

    const response = await axios.post(
      `${baseUrl}/pay`,
      { request: encoded },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchantId,
        },
      }
    );

    if (response.data.success) {
      res.json({
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        orderId: order._id,
      });
    } else {
      res.status(500).json({ message: "PhonePe order creation failed" });
    }
  } catch (err) {
    console.error("createPhonePeOrder error:", err.response?.data || err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Handle PhonePe callback
// @route   POST /api/orders/phonepe/callback
// @access  Public
export const phonePeCallback = async (req, res) => {
  try {
    const { merchantTransactionId, transactionId } = req.body;

    const order = await Order.findById(merchantTransactionId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      phonepeTransactionId: transactionId,
    };
    await order.save();

    res.redirect(`${process.env.FRONTEND_URL}/order/${order._id}`);
  } catch (err) {
    console.error("phonePeCallback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- OTHER EXISTING FUNCTIONS -------------------

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
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
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
