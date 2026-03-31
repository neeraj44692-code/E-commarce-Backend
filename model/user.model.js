import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePic: { type: String, default: "" }, // Image URL
    profilePicPublicId: { type: String, default: "" },
    email: { type: String, required: true },
    password: { type: String, unique: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token: { type: String, default: null },
    isVerified: { type: String, default: null },
    isLoggedIn: { type: String, default: null },
    otp: { type: Date, default: null },
    otpExpiry: { type: String, default: null },
    address: { type: String },
    city: { type: String },
    zipCode: { type: String },
    phoneNo: { type: String },
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
