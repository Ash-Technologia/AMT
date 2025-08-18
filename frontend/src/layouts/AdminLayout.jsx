// =========================
// FRONTEND: frontend/src/layouts/AdminLayout.jsx
// =========================
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/AdminLayout.module.css";

const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`${styles.navLink} ${location.pathname === to || location.pathname.startsWith(to) ? styles.active : ""}`}
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <div className={styles.wrapper}>
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.brandRow}>
          <div className={styles.logo}>AMT</div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
        </div>

        <nav className={styles.nav}>
          {navLink("/admin", "🏠 Dashboard")}
          {navLink("/admin/products", "📦 Manage Products")}
          {navLink("/admin/add-product", "➕ Add Product")}
          {navLink("/admin/orders", "📮 Manage Orders")}
          {navLink("/admin/users", "👥 Manage Users")}
          {navLink("/admin/messages", "✉️ Customer Messages ")}
        </nav>

        <div className={styles.footerNote}>AMT Admin Panel</div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <button className={styles.toggleBtn} onClick={() => setOpen(true)}>☰</button>
          <div className={styles.headerTitle}>Admin Panel</div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
