// ============================
// BACKEND - models/Product.js
// ============================
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    countInStock: { type: Number, required: true, default: 0 },
    image: { type: String, required: true },
    additionalImages: [{ type: String }],
    cloudinaryPublicId: { type: String },
    youtubeLink: { type: String }, // 🔹 New YouTube link field
    // 🔹 New Shipping Fields
    shippingType: {
      type: String,
      enum: ["free", "cod"],
      default: "free",
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
