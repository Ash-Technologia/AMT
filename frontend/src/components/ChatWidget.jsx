// =========================
// frontend/src/components/ChatWidget.jsx
// =========================
import React, { useState } from "react";
import api from "../api";
import styles from "../styles/ChatWidget.module.css";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const user = JSON.parse(localStorage.getItem("amtUser"));
      await api.post("/api/support", {
        name: user?.user?.name || "Guest",
        email: user?.user?.email || "",
        text,
      });
      setText("");
      alert("Message sent. Support will reply via email.");
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      {open ? (
        <div className={styles.chatBox}>
          <div className={styles.chatHeader}>
            <strong>Support</strong>
            <button onClick={() => setOpen(false)} className={styles.closeBtn}>✕</button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={styles.textArea}
            placeholder="Type your message..."
          />
          <div className={styles.sendSection}>
            <button
              onClick={handleSend}
              className={styles.sendBtn}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className={styles.chatToggle}>
          Chat
        </button>
      )}
    </div>
  );
};

export default ChatWidget;