// =========================
// frontend/src/components/Header.jsx
// =========================
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/Header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const cartItems = useSelector((state) => state.cart.cartItems);
  const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logoLink}>
          <img src="/assets/logo.jpg" alt="AMT Logo" className={styles.logo} />
        </Link>

        {/* Hamburger Button */}
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>

        {/* Navigation */}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <Link to="/" className={styles.link} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" className={styles.link} onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/about" className={styles.link} onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/contact" className={styles.link} onClick={() => setMenuOpen(false)}>Contact Us</Link>
          <Link to="/my-orders" className={styles.link} onClick={() => setMenuOpen(false)}>My Orders</Link>

          {user && user.isAdmin && (
            <Link to="/admin" className={styles.link} onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
          )}

          <Link to="/cart" className={`${styles.cartIcon}`} aria-label="View cart" onClick={() => setMenuOpen(false)}>
            <FaShoppingCart size={20} />
            {totalQty > 0 && (
              <span className={styles.cartBadge}>{totalQty}</span>
            )}
          </Link>

          {user ? (
            <div className={styles.userSection}>
              <span className={styles.userName}>Hi, {user.name}</span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={styles.iconBtn} aria-label="Login" onClick={() => setMenuOpen(false)}>
              <FaUser size={20} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
