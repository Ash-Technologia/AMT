import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import dotenv from "dotenv";
import crypto from "crypto";
import axios from "axios";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// ------------------- RAZORPAY -------------------

// @desc    Create order (with optional Razorpay order)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ message: "No order items" });

    let itemsPrice = 0;
    let shippingPrice = 0;
    let shippingType = "free";

    // Calculate prices and fetch product shipping info
    const validatedItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error("Product not found");

        itemsPrice += product.price * item.qty;

        if (product.shippingType === "cod") {
          shippingType = "cod";
          shippingPrice += product.shippingCharge;
        } else {
          shippingType = "free";
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

    // create order in DB
    const order = new Order({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      shippingType,
      taxPrice: 0,
      totalPrice,
      isPaid: false,
    });
    const createdOrder = await order.save();

    // Razorpay flow
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
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Verify Razorpay payment
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

    // decrease stock
    for (const item of order.orderItems) {
      const prod = await Product.findById(item.product);
      if (prod) {
        prod.countInStock = Math.max(0, prod.countInStock - item.qty);
        await prod.save();
      }
    }

    res.json({ message: "Payment verified and order updated", order });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

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
