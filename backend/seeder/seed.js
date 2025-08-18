import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/User.js";  // Correct case, matching filename
import connectDB from "../config/db.js";

dotenv.config();
await connectDB();

// Category data
const categories = [
  { name: "Therapy Oils", image: "/assets/categories/oils.jpg" },
  { name: "Wellness Kits", image: "/assets/categories/kits.jpg" },
  { name: "Relaxation Devices", image: "/assets/categories/devices.jpg" },
];

// Product data
const products = [
  {
    name: "Zero Volt Therapy Set",
    image: "/assets/products/product1.jpg",
    description: "One portable earthing, one belt.",
    price: 999,
    categoryName: "Therapy Oils",
  },
  {
    name: "Earth Therapy Belt With Reverse Current Protection",
    image: "/assets/products/product2.png",
    description: "One belt with pin with 3 metre wire",
    price: 480,
    categoryName: "Therapy Oils",
  },
  {
    name: "Hot Water VASO Stimulation",
    image: "/assets/products/product3.png",
    description: "VASO Stimulation",
    price: 11500,
    categoryName: "Therapy Oils",
  },
  {
    name: "GRAD Tub",
    image: "/assets/products/product4.png",
    description: "Grad Tub with temperature controller",
    price: 25000,
    categoryName: "Therapy Oils",
  },
  {
    name: "Smart Living Water",
    image: "/assets/products/product5.png",
    description: "Smart Living Water",
    price: 2500,
    categoryName: "Therapy Oils",
  },
  {
    name: "Calf Muscle Pushup",
    image: "/assets/products/product6.jpg",
    description: "Calf Muscle Pushup",
    price: 2000,
    categoryName: "Therapy Oils",
  },
];

// Admin users to seed
const admins = [
  {
    name: "Aayush",
    email: "aayushsinghavi@gmail.com",
    password: "Aayush123456789",
    isAdmin: true,
    role: "admin",
    provider: "local",
  },
  {
    name: "Amrut",
    email: "amrutsinghavi@gmail.com",
    password: "Amrut123456789",
    isAdmin: true,
    role: "admin",
    provider: "local",
  },
];

const importData = async () => {
  try {
    // Clear existing data
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany({ isAdmin: true }); // Clear admins only

    // Insert categories
    const createdCategories = await Category.insertMany(categories);

    // Link products to categories by ID
    const productsWithCategoryId = products.map((product) => {
      const category = createdCategories.find(
        (cat) => cat.name === product.categoryName
      );
      return {
        ...product,
        category: category._id,
      };
    });
    await Product.insertMany(productsWithCategoryId);

    // Insert admin users with hashed passwords
    for (const admin of admins) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      const newAdmin = new User({
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        isAdmin: admin.isAdmin,
        role: admin.role,
        provider: admin.provider,
      });
      await newAdmin.save();
      console.log(`Admin created: ${admin.email}`);
    }

    console.log("All Data Imported Successfully ✅");
    process.exit();
  } catch (error) {
    console.error(`Error during seeding: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany({ isAdmin: true });

    console.log("Data Destroyed ❌");
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`);
    process.exit(1);
  }
};

// Run seeder or destroy based on CLI arg
if (process.argv[2] === "-d") {
  await destroyData();
} else {
  await importData();
}
