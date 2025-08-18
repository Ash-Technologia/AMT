// =========================
// frontend/src/components/Footer.jsx
// =========================
import React from "react";
import styles from "../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>&copy; {new Date().getFullYear()} AMT. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;