import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import styles from "../../styles/AdminStyles.module.css";
import api from "../../api"; // ✅ axios instance with token interceptor

const AdminAddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    countInStock: "",
    slug: "",
    category: "",
    image: null,
    images: [],
    youtubeLink: "",
    shippingType: "free", // "free" | "cod"
  });

  const [categories, setCategories] = useState([]);

  // ✅ Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/api/categories");
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, files, value } = e.target;

    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else if (name === "images") {
      setFormData((prev) => ({
        ...prev,
        images: files ? Array.from(files) : [],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.image) {
        alert("Please upload a main image.");
        return;
      }

      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("countInStock", formData.countInStock);
      data.append("slug", formData.slug);
      data.append("category", formData.category); // ✅ category restored as dropdown
      data.append("youtubeLink", formData.youtubeLink || "");
      data.append("shippingType", formData.shippingType);

      data.append("image", formData.image);
      formData.images.forEach((file) => {
        data.append("images", file);
      });

      await api.post("/api/admin/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Product added successfully!");

      setFormData({
        name: "",
        description: "",
        price: "",
        countInStock: "",
        slug: "",
        category: "",
        image: null,
        images: [],
        youtubeLink: "",
        shippingType: "free",
      });
    } catch (error) {
      console.error("Add product error:", error);
      alert(error.response?.data?.message || "❌ Error adding product");
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

          {/* ✅ Category Dropdown */}
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

          <label>
            YouTube Link
            <input
              type="text"
              name="youtubeLink"
              value={formData.youtubeLink || ""}
              onChange={handleChange}
              placeholder="Enter YouTube video URL"
            />
          </label>

          {/* ✅ Shipping */}
          <label>
            Shipping Type
            <select
              name="shippingType"
              value={formData.shippingType}
              onChange={handleChange}
            >
              <option value="free">Free Shipping</option>
              <option value="cod">
                Cash on Delivery (charges paid at delivery)
              </option>
            </select>
          </label>

          {formData.shippingType === "cod" && (
            <p style={{ color: "red", fontSize: "14px", margin: "5px 0" }}>
              Delivery charges approx ₹3000, to be paid at time of delivery.
            </p>
          )}

          <button className={styles.btnPrimary} type="submit">
            Add Product
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;
