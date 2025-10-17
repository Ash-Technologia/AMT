// backend/controllers/orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";
dotenv.config();

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay order and DB order
 * POST /api/orders/razorpay/create
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Recompute prices server-side
    let itemsPrice = 0;
    let shippingPrice = 0;

    const validatedItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product not found: ${item.product}`);
        const qty = Number(item.qty || 1);
        itemsPrice += Number(product.price || 0) * qty;
        if (product.shippingType === "cod") {
          shippingPrice += Number(product.shippingCharge || 0) * qty;
        }
        return {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          qty,
        };
      })
    );

    const totalPrice = Number(itemsPrice) + Number(shippingPrice);

    // Create Order in DB (isPaid false for now)
    const order = new Order({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod: paymentMethod || "Razorpay",
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
    });
    await order.save();
    console.log("[Order] Created order:", order._id.toString());

    // Create Razorpay order (amount in paise)
    const options = {
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      receipt: order._id.toString(),
      payment_capture: 1, // 1 => auto-capture; if you want manual capture set 0
      notes: {
        merchantOrderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);
    console.log("[Razorpay] order created:", razorpayOrder && razorpayOrder.id);

    // Return necessary info to client (orderId = our DB order id)
    return res.json({
      success: true,
      orderId: order._id,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      rawResponse: razorpayOrder,
    });
  } catch (err) {
    console.error("❌ createRazorpayOrder error:", err?.response?.data || err?.message || err);
    return res.status(500).json({ message: "Server error", error: err?.message || err });
  }
};

/**
 * Verify Razorpay payment (client sends razorpay_payment_id, order_id, signature)
 * POST /api/orders/razorpay/verify
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, merchantOrderId } = req.body;
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !merchantOrderId) {
      return res.status(400).json({ message: "Missing verification parameters" });
    }

    // Compute expected signature: hmac_sha256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      console.warn("Razorpay signature mismatch", { generatedSignature, razorpaySignature });
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Find our DB order
    const order = await Order.findById(merchantOrderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update order to paid
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = order.paymentResult || {};
    order.paymentResult.provider = "Razorpay";
    order.paymentResult.paymentId = razorpayPaymentId;
    order.paymentResult.orderId = razorpayOrderId;
    order.paymentResult.signature = razorpaySignature;

    order.status = "Paid";
    await order.save();

    console.log(`[Razorpay] Order ${order._id} marked paid via client verify. paymentId:${razorpayPaymentId}`);

    return res.json({ success: true, message: "Payment verified and order updated", order });
  } catch (err) {
    console.error("❌ verifyRazorpayPayment error:", err?.response?.data || err?.message || err);
    return res.status(500).json({ message: "Server error", error: err?.message || err });
  }
};

/**
 * Razorpay Webhook endpoint
 * POST /api/orders/razorpay/webhook
 * Set RAZORPAY_WEBHOOK_SECRET in env and configure Razorpay webhooks to point to this endpoint.
 */
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const signature = req.headers["x-razorpay-signature"];

    const body = JSON.stringify(req.body || {});
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    if (!signature || expectedSignature !== signature) {
      console.warn("Razorpay webhook signature mismatch");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;
    console.log("[Razorpay Webhook] event:", event.event);

    // Example: payment.authorized, payment.captured, payment.failed, order.paid etc.
    if (event.event === "payment.captured" || event.event === "payment.authorized") {
      const paymentEntity = event.payload && (event.payload.payment ? event.payload.payment.entity : event.payload.payment_entity);
      if (paymentEntity) {
        const providerPaymentId = paymentEntity.id;
        const razorpayOrderId = paymentEntity.order_id;
        // merchantOrderId saved in notes maybe
        const merchantOrderId = paymentEntity.notes && paymentEntity.notes.merchantOrderId;

        // Try to find order by merchantOrderId (receipt) or by matching razorpay order id in paymentResult
        let order = null;
        if (merchantOrderId) {
          order = await Order.findById(merchantOrderId);
        } 
        if (!order && razorpayOrderId) {
          order = await Order.findOne({ "paymentResult.orderId": razorpayOrderId });
        }

        if (order) {
          if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = order.paymentResult || {};
            order.paymentResult.provider = "Razorpay";
            order.paymentResult.paymentId = providerPaymentId;
            order.paymentResult.orderId = razorpayOrderId;
            order.status = "Paid";
            await order.save();
            console.log(`[Razorpay Webhook] Order ${order._id} marked paid via webhook.`);
          }
        } else {
          console.warn("[Razorpay Webhook] No order matched for payment", { razorpayOrderId, merchantOrderId });
        }
      }
    } else if (event.event === "payment.failed") {
      // handle failure: update order status if possible
      const paymentEntity = event.payload && (event.payload.payment ? event.payload.payment.entity : null);
      const merchantOrderId = paymentEntity?.notes?.merchantOrderId;
      if (merchantOrderId) {
        const order = await Order.findById(merchantOrderId);
        if (order) {
          order.status = "Payment_Failed";
          await order.save();
        }
      }
    }

    // Return 200 to acknowledge webhook
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ razorpayWebhook error:", err?.message || err);
    return res.status(500).send("Server error");
  }
};

/**
 * Optional: check Razorpay order status by fetching from Razorpay
 * GET /api/orders/razorpay/status/:merchantOrderId
 */
export const checkRazorpayOrderStatus = async (req, res) => {
  try {
    const merchantOrderId = req.params.merchantOrderId;
    if (!merchantOrderId) return res.status(400).json({ message: "Missing merchantOrderId" });

    // find DB order
    const order = await Order.findById(merchantOrderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // If we already have paymentResult, return that
    if (order.paymentResult && order.paymentResult.orderId) {
      // You can additionally fetch from Razorpay API if needed
      const razorpayOrderId = order.paymentResult.orderId;
      try {
        const resR = await razorpayInstance.orders.fetch(razorpayOrderId);
        return res.json({ success: true, data: resR, order });
      } catch (fetchErr) {
        console.warn("Razorpay fetch order failed:", fetchErr?.message || fetchErr);
        return res.json({ success: true, order, info: "Could not fetch from Razorpay" });
      }
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error("❌ checkRazorpayOrderStatus error:", err?.message || err);
    return res.status(500).json({ message: "Server error", error: err?.message || err });
  }
};

// ------------------- existing other exported functions -------------------
// keep your existing getOrderById, getUserOrders, getAllOrders, updateOrderStatus
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
