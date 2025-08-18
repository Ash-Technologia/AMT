import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../layouts/AdminLayout";
import styles from "../../styles/AdminStyles.module.css";

const AdminAddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    countInStock: "",
    slug: "",
    image: null,
    images: [],
    youtubeLink: "",
    // ✅ NEW SHIPPING FIELDS
    shippingType: "free",     // "free" | "cod"
    shippingCharge: 0,        // number
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else if (name === "images") {
      setFormData((prev) => ({ ...prev, images: files ? Array.from(files) : [] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // (kept as-is from your original)
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.category) {
        alert("Please select a category.");
        return;
      }
      if (!formData.image) {
        alert("Please upload a main image.");
        return;
      }

      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("countInStock", formData.countInStock);
      data.append("slug", formData.slug);
      data.append("youtubeLink", formData.youtubeLink || "");

      // ✅ NEW shipping fields
      data.append("shippingType", formData.shippingType);
      data.append("shippingCharge", formData.shippingType === "free" ? 0 : formData.shippingCharge || 0);

      data.append("image", formData.image);
      formData.images.forEach((file) => {
        data.append("images", file);
      });

      await axios.post("/api/admin/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product added successfully!");
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        countInStock: "",
        slug: "",
        image: null,
        images: [],
        youtubeLink: "",
        shippingType: "free",
        shippingCharge: 0,
      });
    } catch (error) {
      console.error("Add product error:", error);
      alert(error.response?.data?.message || "Error adding product");
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h2>Add New Product</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter product description"
            />
          </label>

          <label>
            Price
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter product price"
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Count In Stock
            <input
              type="number"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleChange}
              required
              min="0"
              placeholder="Enter stock quantity"
            />
          </label>

          <label>
            Slug
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="Enter product slug"
            />
          </label>

          <label>
            Main Image (required)
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Additional Images (optional, multiple)
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
            />
          </label>

          <div>
            <label>YouTube Link</label>
            <input
              type="text"
              name="youtubeLink"
              value={formData.youtubeLink || ""}
              onChange={handleChange}
              placeholder="Enter YouTube video URL"
            />
          </div>

          {/* ✅ NEW: Shipping controls */}
          <label>
            Shipping Type
            <select
              name="shippingType"
              value={formData.shippingType}
              onChange={handleChange}
            >
              <option value="free">Free Shipping</option>
              <option value="cod">Cash on Delivery (shipping charges)</option>
            </select>
          </label>

          <label>
            Shipping Charge (₹)
            <input
              type="number"
              name="shippingCharge"
              value={formData.shippingType === "free" ? 0 : formData.shippingCharge}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter shipping charge"
              disabled={formData.shippingType === "free"}
            />
          </label>

          <button className={styles.btnPrimary} type="submit">
            Add Product
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;
