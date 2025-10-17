// backend/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: String,
      image: String,
      price: Number,
      qty: Number,
    },
  ],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  paymentMethod: { type: String, default: "Razorpay" },
  itemsPrice: Number,
  shippingPrice: Number,
  taxPrice: Number,
  totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: { type: String, default: "Processing" },
  shippingType: { type: String, default: "free" },
  shippingCharge: { type: Number, default: 0 },
  stockUpdated: { type: Boolean, default: false },
  paymentResult: {
    // generic container for payment provider info
    provider: { type: String },
    paymentId: { type: String },
    orderId: { type: String },
    signature: { type: String },
    raw: { type: mongoose.Schema.Types.Mixed },
  },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
