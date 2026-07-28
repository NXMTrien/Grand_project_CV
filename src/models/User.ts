import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    role: { 
      type: String, 
      enum: ["ADMIN", "MANAGER", "CANDIDATE"], 
      default: "CANDIDATE" 
    },
    avatar: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isFirstLogin: { type: Boolean, default: true },
    otpCode: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    // Liên kết tới Công ty nếu là MANAGER
    companyId: { type: Schema.Types.ObjectId, ref: "Company", default: null },
    isBlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;