import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Định nghĩa nhanh schema Job nếu chưa có file model riêng biệt
const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  salary: String,
  location: String,
  description: String,
  requirements: String,
  applicants: [{ resumeId: String, candidateName: String, email: String, appliedAt: Date }]
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

export async function POST(req: Request) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    if (decoded.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Chỉ Nhà tuyển dụng mới có thể đăng tin" }, { status: 403 });
    }

    const { title, company, salary, location, description, requirements } = await req.json();

    const newJob = await Job.create({
      title, company, salary, location, description, requirements, applicants: []
    });

    return NextResponse.json({ message: "Đăng tin tuyển dụng thành công!", jobId: newJob._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi hệ thống", error: error.message }, { status: 500 });
  }
}