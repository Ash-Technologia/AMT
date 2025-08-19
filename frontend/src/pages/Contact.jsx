import React, { useState } from "react";
import styles from "../styles/Contact.module.css"
import api from "../api";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const { data } = await api.post("/api/contact", form);
      setSuccess(data.message);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
    <div className={styles.authContainer}>
      <h1 className={"text-4xl font-bold mb-9"}>Contact Us</h1>

      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form className={styles.label} onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          className={styles.input1}
          required
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          className={styles.btnPrimary}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
    </div>
  );
};

export default Contact;
