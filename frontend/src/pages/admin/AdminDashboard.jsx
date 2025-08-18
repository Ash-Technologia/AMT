// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../api";
import styles from "../../styles/AdminDashboard.module.css";

const StatCard = ({ title, value, icon, color }) => (
  <div className={styles.card}>
    <div className={styles.icon} style={{ background: color }}>{icon}</div>
    <div className={styles.text}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardValue}>{value}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    revenue: 0,
    messages: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, oRes, pRes, mCountRes] = await Promise.all([
          api.get("/api/admin/users"),
          api.get("/api/admin/orders"),
          api.get("/api/admin/products"),
          api.get("/api/admin/messages/count"),
        ]);

        const usersCount = Array.isArray(uRes.data) ? uRes.data.length : (uRes.data?.data?.length || 0);

        const orders = Array.isArray(oRes.data)
          ? oRes.data
          : (Array.isArray(oRes.data?.data) ? oRes.data.data : []);
        const ordersCount = orders.length;
        const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        const productsCount = Array.isArray(pRes.data)
          ? pRes.data.length
          : (Array.isArray(pRes.data?.data) ? pRes.data.data.length : 0);

        const messagesCount = Number(mCountRes.data?.count || 0);

        setStats({
          users: usersCount,
          orders: ordersCount,
          products: productsCount,
          revenue,
          messages: messagesCount,
        });
      } catch (err) {
        console.error("Error loading admin stats:", err);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <div className={styles.grid}>
          <StatCard title="Users" value={stats.users} icon="👥" color="#3B82F6" />
          <StatCard title="Orders" value={stats.orders} icon="📦" color="#2563EB" />
          <StatCard title="Products" value={stats.products} icon="🛍️" color="#06B6D4" />
          <StatCard title="Revenue" value={`₹${stats.revenue}`} icon="💰" color="#1E293B" />
          <StatCard title="Messages" value={stats.messages} icon="✉️" color="#0EA5E9" />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
