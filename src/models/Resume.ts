import mongoose, { Schema, model, models } from "mongoose";

const ResumeSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true }, 
    type: { type: String, enum: ["ONLINE", "ATTACHMENT"], default: "ONLINE" },
    fileUrl: { type: String, default: "" },   // Đường dẫn file nếu là CV PDF đính kèm
    
   
    cvData: {
      fullName: { type: String, default: "" },
      avatar: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      targetPosition: { type: String, default: "" },
      summary: { type: String, default: "" },
      technicalSkills: { type: String, default: "" },
      softSkills: { type: String, default: "" },
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