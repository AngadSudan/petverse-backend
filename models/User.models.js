import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, index: true },
    username: { type: String, unique: true, required: true, index: true },
    phoneNumber: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    profileImageUrl: { type: String },
    address: [{ type: String }], // Supports multiple addresses
    role: {
      type: String,
      enum: ["user", "doctor", "dealer", "admin"],
      required: true,
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    animalsAvailable: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
      {
          _id: this._id,
          isSubscribed: this.isSubscribed,
          userType: this.userType,
      },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: process.env.JWT_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
      {
          _id: this._id,
      },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: process.env.JWT_TOKEN_EXPIRY }
  );
};


const User = mongoose.model("User", UserSchema);
export default User;