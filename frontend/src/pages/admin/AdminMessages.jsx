// frontend/src/pages/admin/AdminMessages.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../api";
import styles from "../../styles/AdminMessages.module.css";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // selected message
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/messages");
      const data = Array.isArray(res.data) ? res.data : (res.data?.messages || []);
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/api/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (active?._id === id) setActive(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete message");
    }
  };

  return (
    <AdminLayout>
      <div className={styles.wrapper}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Customer Messages</h1>
          <button className={styles.refreshBtn} onClick={fetchMessages} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className={styles.noData}>No messages found.</div>
        ) : (
          <div className={styles.cardGrid}>
            {messages.map((msg) => (
              <button
                key={msg._id}
                className={styles.card}
                onClick={() => setActive(msg)}
                title="Click to view"
              >
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{(msg.name || "?").slice(0, 1).toUpperCase()}</div>
                  <div className={styles.meta}>
                    <div className={styles.name}>{msg.name}</div>
                    <div className={styles.email}>{msg.email}</div>
                  </div>
                </div>
                <div className={styles.preview}>{msg.message}</div>
                <div className={styles.date}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Modal */}
        {active && (
          <div className={styles.modalOverlay} onClick={() => setActive(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>Message from {active.name}</div>
                <button className={styles.modalClose} onClick={() => setActive(null)}>✕</button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.row}>
                  <span className={styles.label}>Name:</span>
                  <span className={styles.value}>{active.name}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Email:</span>
                  <span className={styles.value}>{active.email}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Date:</span>
                  <span className={styles.value}>
                    {active.createdAt ? new Date(active.createdAt).toLocaleString() : ""}
                  </span>
                </div>

                <div className={styles.messageBox}>
                  {active.message}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.deleteBtn} onClick={() => handleDelete(active._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
