// frontend/src/pages/admin/AdminProducts.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../layouts/AdminLayout";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    countInStock: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products");
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      countInStock: "",
      description: "",
    });
    setImage(null);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));
      if (image) form.append("image", image);

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/products", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchProducts();
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      countInStock: product.countInStock,
      description: product.description,
    });
    setImage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
        <input type="number" name="countInStock" placeholder="Stock" value={formData.countInStock} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange}></textarea>
        <input type="file" name="image" onChange={handleFileChange} />
        <button type="submit">{editingProduct ? "Update" : "Add"}</button>
        {editingProduct && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <h3>All Products</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.category}</td>
              <td>{p.countInStock}</td>
              <td>{p.image && <img src={p.image} alt={p.name} width="50" />}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default AdminProducts;
