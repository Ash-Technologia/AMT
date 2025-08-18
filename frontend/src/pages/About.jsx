import React from "react";
import styles from "../styles/About.module.css";

const products = [
  {
    id:1,
    title: "About Amrut Singhavi",
    desc1: "Founder of AMT Health Care products and Health Care Practitioner.",
    desc2: "Diabetes Educator, Acupressure MD, Neurotherapy, GRAD Expert, Help Practitioner, Vibration Therapy.",
    desc3: "Our Mission DRUG FREE INDIA!!",
    desc4: "For virtual OPD, contact(only whatsapp): +91 9822843015",
    layout: "left"
  },
];

const About = () => {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.h1}>About AMT</h1>
        <p className={styles.h2}>Know About Us</p>
      </section>

      {/* Products Section */}
      <section className={styles.products}>
        {products.map((p) => (
          <div
            key={p.id}
            className={`${styles.productCard} ${
              p.layout === "right" ? styles.reverse : ""
            }`}
          >
            <div className={styles.productText}>
              <h2 className={styles.productHeading}>{p.title}</h2>
              <p className={styles.para}>{p.desc1}</p>
              <p className={styles.para}>{p.desc2}</p>
              <p className={styles.para}>{p.desc3}</p>
              <p className={styles.para}>{p.desc4}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default About;
