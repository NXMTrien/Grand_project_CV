import { Schema, model, models } from "mongoose";

const FeedbackSchema = new Schema(
  {
    companyName: { type: String, required: true, trim: true, maxlength: 160 },
    isAnonymous: { type: Boolean, default: false },
    contactName: { type: String, default: "", trim: true, maxlength: 120 },
    contactEmail: { type: String, default: "", trim: true, maxlength: 254 },
    contactPhone: { type: String, default: "", trim: true, maxlength: 30 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["NEW", "REVIEWING", "RESOLVED"],
      default: "NEW",
    },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Feedback = models.Feedback || model("Feedback", FeedbackSchema);
export default Feedback;
