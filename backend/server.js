// backend/server.js
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import passport from "passport";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from './routes/categoryRoute.js';
import userRoutes from './routes/userRoutes.js';
import supportRoutes from "./routes/supportRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminMessageRoutes from "./routes/adminMessageRoutes.js";

dotenv.config();
const app = express();
connectDB();

// middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// session for passport (only for OAuth flow if using sessions)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "amt_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());
import "./config/passport.js"; // loads strategies

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin", adminProductRoutes); // admin products
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminMessageRoutes);

// health
app.get("/", (req, res) => {
  res.json({ message: "AMT Backend is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
