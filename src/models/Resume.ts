import mongoose, { Schema, model, models } from "mongoose";

const ResumeSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true }, 
    type: { type: String, enum: ["ONLINE", "ATTACHMENT"], default: "ONLINE" },
    fileUrl: { type: String, default: "" },   // Đường dẫn file nếu là CV PDF đính kèm
    
   
    cvData: {
      summary: { type: String, default: "" },       // Giới thiệu bản thân
      education: [
        {
          school: String,
          major: String,
          from: Date,
          to: Date,
          details: String
        }
      ],
      experience: [
        {
          company: String,
          position: String,
          from: Date,
          to: Date,
          details: String
        }
      ],
      skills: [{ type: String }],
      projects: [{ name: String, role: String, description: String }]
    },
    templateName: { type: String, default: "default-theme" }, 
    isPublic: { type: Boolean, default: true } 
  },
  { timestamps: true }
);

const Resume = models.Resume || model("Resume", ResumeSchema);
export default Resume;