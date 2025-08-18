import React from "react";
import styles from "../styles/About.module.css";

const products = [
  {
    id:1,
    title: "Zero Volt Therapy set",
    desc: "Zero Volt Therapy, also known as Earthing or Grounding, is a therapeutic approach ...",
    layout: "left",
  },
  {
    id:2,
    title: "Earth Therapy Belt",
    desc: "Zero Volt Therapy involves connecting the body to Earth's natural energy ...",
    layout: "right",
  },
  {
    id:3,
    title: "Hot Water VASO Stimulation",
    desc: "This therapy helps discharge excess positive electrical charges ...",
    layout: "left",
  },
  {
    id:4,
    title: "GRAD Tub",
    desc: "Grounding neutralizes harmful free radicals to reduce inflammation ...",
    layout: "right",
  },
  {
    id:5,
    title: "Smart Living water",
    desc: "It can improve sleep quality, reduce stress, and boost circulation ...",
    layout: "left",
  },
  {
    id:6,
    title: "Calf Muscle Pushup",
    desc: "Products include grounding mats, sheets, and rods designed for daily use ...",
    layout: "right",
  },
];

const About = () => {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.h1}>Our Products</h1>
        <p className={styles.h2}>Get to know about our products!</p>
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
              <p className={styles.para}>{p.desc}</p>
            </div>
            <div className={styles.productImage}>
              <img
                src={`/public/assets/products/${p.id}.jpg`}
                alt={p.title}
                className={styles.img}
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default About;
