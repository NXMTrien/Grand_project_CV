import { Schema, model, models } from "mongoose";

const ManagerAccountRequestSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    birthYear: { type: Number, required: true, min: 1900 },
    message: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["NEW", "REVIEWING", "RESOLVED"],
      default: "NEW",
    },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ManagerAccountRequestSchema.index({ status: 1, processedAt: 1, createdAt: -1 });

const ManagerAccountRequest =
  models.ManagerAccountRequest ||
  model("ManagerAccountRequest", ManagerAccountRequestSchema);

export default ManagerAccountRequest;
