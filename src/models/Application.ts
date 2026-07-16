import mongoose, { Schema, model, models } from "mongoose";

const ApplicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Ứng viên nộp bài
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true }, // CV được chọn để nộp
    coverLetter: { type: String, default: "" },
    status: { type: String, enum: ["SENT", "REVIEWING", "INTERVIEW", "REJECTED"], default: "SENT" }
  },
  { timestamps: true } 
);

const Application = models.Application || model("Application", ApplicationSchema);
export default Application;