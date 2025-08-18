import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import styles from "../styles/OrderConfirmation.module.css";

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load order details.");
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading order details...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Order Confirmed 🎉</h1>
        <p className={styles.subtitle}>Order #{order._id}</p>

        <p className={order.isPaid ? styles.paid : styles.pending}>
          {order.isPaid ? "Payment Received ✅" : "Payment Pending ❌"}
        </p>

        {/* Shipping Details */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Shipping Details</h3>
          <p>{order.shippingAddress.fullName}</p>
          <p>
            {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </p>
          <p>Phone: {order.shippingAddress.phone}</p>
        </section>

        {/* Order Items */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Order Items</h3>
          {order.orderItems.map((item) => (
            <div key={item.product} className={styles.itemRow}>
              <div className={styles.itemInfo}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.itemImage}
                />
                <div>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemQty}>Qty: {item.qty}</p>
                </div>
              </div>
              <div className={styles.itemPrice}>
                ₹{(item.price * item.qty).toFixed(2)}
              </div>
            </div>
          ))}
        </section>

        {/* Price Breakdown */}
        <section className={styles.breakdown}>
          <div className={styles.row}>
            <span>Subtotal:</span>
            <span>₹{order.itemsPrice.toFixed(2)}</span>
          </div>
          <div className={styles.row}>
            <span>Shipping:</span>
            <span>₹{order.shippingPrice.toFixed(2)}</span>
          </div>
          {order.taxPrice > 0 && (
            <div className={styles.row}>
              <span>Tax:</span>
              <span>₹{order.taxPrice.toFixed(2)}</span>
            </div>
          )}
        </section>

        {/* Total */}
        <div className={styles.total}>
          <span>Total:</span>
          <span>₹{order.totalPrice.toFixed(2)}</span>
        </div>

        <button onClick={() => navigate("/")} className={styles.shopBtn}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
