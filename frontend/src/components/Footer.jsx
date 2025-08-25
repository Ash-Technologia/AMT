// =========================
// frontend/src/components/Footer.jsx
// =========================
import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerLinks}>
          <Link to="/terms" className={styles.footerLink}>
            Terms & Conditions
          </Link>
          <Link to="/privacy" className={styles.footerLink}>
            Privacy Policy
          </Link>
          <Link to="/policies" className={styles.footerLink}>
          Other Policies
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} AMT. All rights reserved.  (ASHOK PAPER PRODUCTS)</p>
      </div>
    </footer>
  );
};

export default Footer;
