// =========================
// FRONTEND: frontend/src/pages/admin/AddProduct.jsx
// =========================
import React, { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../api";
import styles from "../../styles/AdminStyles.module.css";

const AddProduct = () => {
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", countInStock: "" });
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      const res = await api.post("/api/admin/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMsg(`Product "${res.data.name}" added`);
      setForm({ name: "", description: "", price: "", category: "", countInStock: "" });
      setImage(null);
    } catch (err) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h2>Add Product</h2>
        {msg && <div className={styles.msg}>{msg}</div>}
        <form onSubmit={submit} className={styles.form}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} required />
          </label>
          <label>
            Price
            <input type="number" name="price" value={form.price} onChange={handleChange} required />
          </label>
          <label>
            Category
            <input name="category" value={form.category} onChange={handleChange} />
          </label>
          <label>
            Count in Stock
            <input type="number" name="countInStock" value={form.countInStock} onChange={handleChange} />
          </label>
          <label>
            Image
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </label>
          <button className={styles.btnPrimary} type="submit">
            Add Product
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddProduct;
