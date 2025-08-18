// =========================
// BACKEND: backend/controllers/adminProductController.js
// =========================
import Product from "../models/Product.js";
import cloudinary, { uploadBufferToCloudinary } from "../config/cloudinary.js";

// ================== ADD PRODUCT ==================
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, countInStock, youtubeLink } = req.body;

    const stockQty = Number(countInStock);
    if (isNaN(stockQty)) {
      return res.status(400).json({ message: "Invalid stock quantity" });
    }

    let imageUrl = "";
    let publicId = "";
    let additionalImageUrls = [];

    // Upload main image
    if (req.files && req.files.image && req.files.image.length > 0) {
      const mainImageFile = req.files.image[0];
      const result = await uploadBufferToCloudinary(
        mainImageFile.buffer,
        "amt-products"
      );
      imageUrl = result.secure_url;
      publicId = result.public_id || "";
    }

    // Upload additional images
    if (req.files && req.files.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        const resUpload = await uploadBufferToCloudinary(
          file.buffer,
          "amt-products"
        );
        additionalImageUrls.push(resUpload.secure_url);
      }
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      countInStock: stockQty,
      image: imageUrl,
      additionalImages: additionalImageUrls,
      cloudinaryPublicId: publicId,
      youtubeLink, // 🔹
    });

    const created = await product.save();
    res.status(201).json(created);
  } catch (err) {
    console.error("addProduct err:", err);
    res.status(400).json({ message: err.message });
  }
};

// ================== UPDATE PRODUCT ==================
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const removeImageFlag =
      req.body.removeImage === "true" || req.body.removeImage === true;

    let imageUrl = product.image;
    let publicId = product.cloudinaryPublicId || "";

    // Parse existing additional images
    let existingAdditionalImages = [];
    if (req.body.existingAdditionalImages) {
      try {
        existingAdditionalImages = JSON.parse(req.body.existingAdditionalImages);
      } catch (e) {
        console.warn("Failed to parse existingAdditionalImages", e);
      }
    }

    // Remove main image if flagged
    if (removeImageFlag) {
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.warn("destroy failed", e);
        }
      }
      imageUrl = "";
      publicId = "";
    }

    // Replace main image if new uploaded
    if (
      !removeImageFlag &&
      req.files &&
      req.files.image &&
      req.files.image.length > 0
    ) {
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.warn("destroy failed", e);
        }
      }
      const result = await uploadBufferToCloudinary(
        req.files.image[0].buffer,
        "amt-products"
      );
      imageUrl = result.secure_url;
      publicId = result.public_id || "";
    }

    // Upload new additional images if any
    let newAdditionalImages = [];
    if (req.files && req.files.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        const resUpload = await uploadBufferToCloudinary(
          file.buffer,
          "amt-products"
        );
        newAdditionalImages.push(resUpload.secure_url);
      }
    }

    // Combine existing + new
    const additionalImageUrls = [
      ...existingAdditionalImages,
      ...newAdditionalImages,
    ];

    const { name, description, price, category, countInStock, youtubeLink } =
      req.body;

    const stockQty = Number(countInStock);
    if (isNaN(stockQty)) {
      return res.status(400).json({ message: "Invalid stock quantity" });
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.countInStock = stockQty;
    product.image = imageUrl ?? product.image;
    product.cloudinaryPublicId = publicId ?? product.cloudinaryPublicId;
    product.additionalImages = additionalImageUrls;
    product.youtubeLink = youtubeLink ?? product.youtubeLink; // 🔹

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error("updateProduct err:", err);
    res.status(400).json({ message: err.message });
  }
};

// ================== GET ADMIN PRODUCTS ==================
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== DELETE PRODUCT ==================
export const deleteProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });

    const publicId = p.cloudinaryPublicId;
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.warn("destroy failed", e);
      }
    }

    await p.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
