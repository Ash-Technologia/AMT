// =========================
// FRONTEND: frontend/src/pages/admin/ManageOrders.jsx
// =========================
// =========================
// FRONTEND: frontend/src/pages/admin/ManageOrders.jsx
// =========================
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../api";
import styles from "../../styles/AdminStyles.module.css";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/api/admin/orders");
      setOrders(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadOrderDetails = async (orderId) => {
    setLoadingDetails(true);
    setErrorDetails("");
    try {
      const res = await api.get(`/api/admin/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      setErrorDetails("Failed to load order details");
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete order?")) return;
    try {
      await api.delete(`/api/admin/orders/${id}`);
      if (selectedOrder?._id === id) setSelectedOrder(null);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Manage Orders</h1>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td data-label="Order ID">
                    <button
                      className={styles.linkButton}
                      onClick={() => loadOrderDetails(o._id)}
                      style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0, fontWeight: "600" }}
                    >
                      {o._id}
                    </button>
                  </td>
                  <td data-label="User">
                    {o.user?.name}
                    <div className={styles.small}>{o.user?.email}</div>
                  </td>
                  <td data-label="Total">₹{o.totalPrice}</td>
                  <td data-label="Status">
                    <span className={styles.badge}>{o.status}</span>
                  </td>
                  <td data-label="Actions" className={styles.actionsCell}>
                    <button
                      className={styles.btnDanger}
                      onClick={() => remove(o._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal or Details Panel */}
        {selectedOrder && (
          <div
            className={styles.modalOverlay}
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                &times;
              </button>

              <h2>Order Details</h2>
              {loadingDetails ? (
                <p>Loading...</p>
              ) : errorDetails ? (
                <p className={styles.error}>{errorDetails}</p>
              ) : (
                <>
                  <p>
                    <strong>Order ID:</strong> {selectedOrder._id}
                  </p>
                  <p>
                    <strong>User:</strong> {selectedOrder.user?.name} (
                    {selectedOrder.user?.email})
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedOrder.status}
                  </p>
                  <p>
                    <strong>Placed At:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>

                  <h3>Shipping Address</h3>
                  <p>
                    {selectedOrder.shippingAddress.fullName}
                    <br />
                    {selectedOrder.shippingAddress.address},{" "}
                    {selectedOrder.shippingAddress.city}
                    <br />
                    {selectedOrder.shippingAddress.postalCode},{" "}
                    {selectedOrder.shippingAddress.country}
                    <br />
                    Phone: {selectedOrder.shippingAddress.phone}
                  </p>

                  <h3>Items</h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems.map((item) => (
                        <tr key={item.product || item._id}>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h3>Order Summary</h3>
                  <p>Items Price: ₹{selectedOrder.itemsPrice}</p>
                  <p>Shipping Price: ₹{selectedOrder.shippingPrice}</p>
                  <p>Tax Price: ₹{selectedOrder.taxPrice}</p>
                  <p>
                    <strong>Total: ₹{selectedOrder.totalPrice}</strong>
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageOrders;
