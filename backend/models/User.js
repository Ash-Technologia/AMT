import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    oauthId: { type: String }, // for OAuth providers
    provider: { type: String, default: "local" }, // default to 'local'
    isAdmin: { type: Boolean, default: false },
    role: { type: String, default: "customer" }, // explicit role field
    addresses: [
      {
        label: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        phone: String,
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
