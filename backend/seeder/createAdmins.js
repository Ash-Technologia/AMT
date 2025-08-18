import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const admins = [
  {
    name: "Aayush",
    email: "aayushsinghavi@gmail.com",
    password: "Aayush123#@",
    isAdmin: true,
  },
  {
    name: "Amrut",
    email: "amrutsinghavi@gmail.com",
    password: "Amrut123#@",
    isAdmin: true,
  },
];

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Remove existing admins to avoid duplicates (optional)
    await User.deleteMany({ isAdmin: true });

    // Create new admin users
    for (const admin of admins) {
      const user = new User(admin);
      await user.save();
      console.log(`Admin created: ${admin.email}`);
    }

    console.log("Admin seeding done.");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmins();
