import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: String,
  coverImage: String,
  author: String,
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const BlogPost = mongoose.model("BlogPost", blogSchema);
export default BlogPost;
