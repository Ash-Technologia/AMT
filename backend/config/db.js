// =========================
// BACKEND: backend/config/db.js
// =========================
import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;  // read here directly
  if (!mongoUri) {
    console.error("MongoDB connection URI missing in environment variables.");
    process.exit(1);
  }
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
