// backend/controllers/contactController.js
import Contact from "../models/Contact.js";
import nodemailer from "nodemailer";

// PUBLIC: contact form sender
export const sendMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Save to DB
    const saved = await Contact.create({ name, email, message });

    // Nodemailer (uses your .env)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><small>Message ID: ${saved._id}</small></p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.warn("Email send failed (message still saved):", mailErr?.message || mailErr);
    }

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message." });
  }
};

// ADMIN: list all messages (array only)
export const getAllMessages = async (_req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages); // <-- ARRAY, so frontend .map() is safe
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// ADMIN: count for dashboard stat
export const getMessagesCount = async (_req, res) => {
  try {
    const count = await Contact.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to count messages" });
  }
};

// ADMIN: delete a message
export const deleteMessage = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Message not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete message" });
  }
};
