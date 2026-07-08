import mongoose, { Schema, model, models } from "mongoose";

const ApplicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true }, 
    coverLetter: { type: String, default: "" }, 
    status: {
      type: String,
      enum: ["SUBMITTED", "REVIEWED", "INTERVIEWING", "PASSED", "REJECTED"],
      default: "SUBMITTED"
    },
    feedback: { type: String, default: "" } 
  },
  { timestamps: true }
);

// Ràng buộc bảo vệ: 1 ứng viên chỉ được nộp CV 1 lần vào 1 bài đăng công việc cụ thể
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const Application = models.Application || model("Application", ApplicationSchema);
export default Application;