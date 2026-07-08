import mongoose, { Schema, model, models } from "mongoose";

const JobSchema = new Schema(
  {
    title: { type: String, required: true },             // Tiêu đề công việc
    slug: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    managerId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Người đăng tin
    
    // Chi tiết công việc
    description: { type: String, required: true },       // JD chi tiết
    requirements: { type: String, required: true },      // Yêu cầu ứng viên
    benefits: { type: String, required: true },          // Quyền lợi được hưởng
    
    // Bộ lọc nhanh
    location: { type: String, required: true },          // Tỉnh/Thành phố (Hà Nội, HCM...)
    salaryMin: { type: Number, default: 0 },             // Lương tối thiểu (0 là Thỏa thuận)
    salaryMax: { type: Number, default: 0 },             // Lương tối đa
    experience: { type: String, required: true },        // Cấp bậc/Kinh nghiệm (Chưa có KN, 1 năm...)
    jobType: { type: String, enum: ["Full-time", "Part-time", "Remote"], default: "Full-time" },
    
    // Trạng thái quản lý
    status: { 
      type: String, 
      enum: ["PENDING", "APPROVED", "REJECTED", "EXPIRED"], 
      default: "PENDING" // Chờ Admin duyệt khi mới đăng
    },
    views: { type: Number, default: 0 },                 // Thống kê lượt xem tin
    deadline: { type: Date, required: true }             // Hạn nộp hồ sơ
  },
  { timestamps: true }
);

const Job = models.Job || model("Job", JobSchema);
export default Job;