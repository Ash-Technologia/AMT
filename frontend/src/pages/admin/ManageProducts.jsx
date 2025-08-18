// =========================
// FRONTEND: frontend/src/pages/admin/ManageProducts.jsx
// =========================
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../api";
import styles from "../../styles/AdminStyles.module.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    countInStock: 0,
    slug: "",
    youtubeLink: "",   // ✅ existing
    // ✅ NEW shipping fields for edit form
    shippingType: "free",
    shippingCharge: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]); // Holds URLs + new Files
  const [msg, setMsg] = useState("");

  // Load products
  const loadProducts = async () => {
    try {
      const { data } = await api.get("/api/admin/products");
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const { data } = await api.get("/api/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Start editing product - initialize form states
  const startEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name || "",
      price: p.price || "",
      description: p.description || "",
      category: p.category || "",
      countInStock: p.countInStock || 0,
      slug: p.slug || "",
      youtubeLink: p.youtubeLink || "",   // ✅ keep
      // ✅ NEW shipping fields
      shippingType: p.shippingType || "free",
      shippingCharge: p.shippingCharge ?? 0,
    });
    setImageFile(null);
    setAdditionalImages(p.additionalImages || []);
    setMsg("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({
      name: "",
      price: "",
      description: "",
      category: "",
      countInStock: 0,
      slug: "",
      youtubeLink: "",
      shippingType: "free",
      shippingCharge: 0,
    });
    setImageFile(null);
    setAdditionalImages([]);
    setMsg("");
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle additional images input (append new files)
  const handleAdditionalImagesChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setAdditionalImages((prev) => [...prev, ...files]);
  };

  // Remove additional image by index (works for both URLs and Files)
  const removeAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Save updated product
  const saveProduct = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("countInStock", form.countInStock);
      fd.append("slug", form.slug);
      fd.append("youtubeLink", form.youtubeLink);

      // ✅ NEW shipping fields
      fd.append("shippingType", form.shippingType);
      fd.append(
        "shippingCharge",
        form.shippingType === "free" ? 0 : form.shippingCharge ?? 0
      );

      if (imageFile) fd.append("image", imageFile);

      // Separate existing URLs and new files from additionalImages
      const existingUrls = additionalImages.filter((img) => typeof img === "string");
      const newFiles = additionalImages.filter((img) => img instanceof File);

      newFiles.forEach((file) => fd.append("images", file));
      fd.append("existingAdditionalImages", JSON.stringify(existingUrls));

      await api.put(`/api/admin/products/${editing}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("Product updated successfully");
      loadProducts();
      cancelEdit();
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || "Error updating product");
      console.error(err);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1>Manage Products</h1>
        {msg && <div className={styles.msg}>{msg}</div>}

        {editing ? (
          <form className={styles.form} onSubmit={saveProduct} noValidate>
            <label>
              Name
              <input
                className={styles.input}
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Price
              <input
                type="number"
                className={styles.input}
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </label>

            <label>
              Description
              <textarea
                className={styles.input}
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </label>

            <label>
              Category
              <select
                className={styles.input}
                name="category"
                value={form.category}
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
                className={styles.input}
                name="countInStock"
                value={form.countInStock}
                onChange={handleChange}
                required
                min="0"
              />
            </label>

            <label>
              Slug
              <input
                className={styles.input}
                name="slug"
                value={form.slug}
                onChange={handleChange}
              />
            </label>

            <label>
              Main Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className={styles.input}
              />
            </label>

            <label>
              Additional Images (existing + new)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className={styles.input}
              />
            </label>

            {/* Preview additional images */}
            {additionalImages.length > 0 && (
              <div className={styles.additionalImagesPreview}>
                {additionalImages.map((img, idx) => {
                  const src = typeof img === "string" ? img : URL.createObjectURL(img);
                  return (
                    <div key={idx} className={styles.imagePreview}>
                      <img src={src} alt={`Additional ${idx}`} className={styles.thumb} />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(idx)}
                        className={styles.btnDanger}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <label>
              YouTube Link
              <input
                type="text"
                className={styles.input}
                name="youtubeLink"
                value={form.youtubeLink}
                onChange={handleChange}
                placeholder="Enter YouTube video URL"
              />
            </label>

            {/* ✅ NEW: Shipping controls in edit */}
            <label>
              Shipping Type
              <select
                className={styles.input}
                name="shippingType"
                value={form.shippingType}
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
                className={styles.input}
                name="shippingCharge"
                value={form.shippingType === "free" ? 0 : form.shippingCharge}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={form.shippingType === "free"}
              />
            </label>

            <div className={styles.formActions}>
              <button className={styles.btnPrimary} type="submit">
                Save
              </button>
              <button className={styles.btnGhost} type="button" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>₹{p.price}</td>
                    <td>{p.countInStock}</td>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className={styles.thumb} />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <button className={styles.btn} onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button className={styles.btnDanger} onClick={() => deleteProduct(p._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageProducts;
