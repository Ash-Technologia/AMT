// =========================
// FRONTEND: frontend/src/pages/admin/ProductEditScreen.jsx
// (edit product with removeImage option)
// =========================
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../api";
import styles from "../../styles/AdminForm.module.css";

const ProductEditScreen = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ name:"", price:0, category:"", countInStock:0, description:"", slug:"" });
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(()=> {
    const load = async ()=> {
      try {
        const res = await api.get("/api/admin/products");
        const p = res.data.find(prod => prod._id === id);
        if (!p) { alert("Product not found"); nav("/admin/products"); return; }
        setProduct(p); setForm({ name:p.name, price:p.price, category:p.category, countInStock:p.countInStock, description:p.description, slug:p.slug || "" });
      } catch (err) { console.error(err); }
    };
    load();
  },[id, nav]);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v])=>fd.append(k,v));
    fd.append("removeImage", removeImage);
    if (imageFile) fd.append("image", imageFile);
    else if (!removeImage) fd.append("image", product?.image || "");
    setLoading(true);
    try {
      await api.put(`/api/admin/products/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" }});
      alert("Updated");
      nav("/admin/products");
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setLoading(false);
  };

  if (!product) return <AdminLayout><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className={styles.formWrap}>
        <h2>Edit Product</h2>
        <form onSubmit={submit} className={styles.form}>
          <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label>
          <label>Price<input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required /></label>
          <label>Category<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} /></label>
          <label>Count in Stock<input type="number" value={form.countInStock} onChange={e=>setForm({...form,countInStock:e.target.value})} /></label>
          <label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></label>
          <label>Slug<input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} /></label>

          {product.image && !removeImage && (
            <div>
              <p>Current image:</p>
              <img src={product.image} alt="current" style={{height:120, borderRadius:8}}/>
            </div>
          )}

          <label className={styles.checkbox}><input type="checkbox" checked={removeImage} onChange={e=>setRemoveImage(e.target.checked)} /> Remove current image</label>
          <label>New Image<input type="file" accept="image/*" disabled={removeImage} onChange={e=>setImageFile(e.target.files[0])} /></label>

          <button className={styles.btn} type="submit" disabled={loading}>{loading ? "Updating..." : "Update Product"}</button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductEditScreen;
