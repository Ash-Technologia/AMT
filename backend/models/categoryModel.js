// backend/models/categoryModel.js
import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
categorySchema.pre("validate", function (next) {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;

