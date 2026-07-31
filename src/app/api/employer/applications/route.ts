// app/api/employer/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Application from "@/src/models/Application";
import Job from "@/src/models/Job";
import "@/src/models/User";
import "@/src/models/Resume"; // Khai báo model Resume
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface JwtPayload {
  userId: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("Authorization");
    let employerId = request.headers.get("x-employer-id");

    if (!employerId && authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET || "YourSecretKeyHere";
      try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        employerId = decoded.userId;
      } catch (err) {
        return NextResponse.json(
          { success: false, message: "Token không hợp lệ hoặc đã hết hạn!" },
          { status: 401 }
        );
      }
    }

    if (!employerId || !mongoose.Types.ObjectId.isValid(employerId)) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền truy cập dữ liệu này!" },
        { status: 403 }
      );
    }

    // Lấy các bài đăng tuyển dụng do NTD quản lý
    const employerJobs = await Job.find({ managerId: employerId }).select("_id title");
    const jobIds = employerJobs.map((j) => j._id);

    if (jobIds.length === 0) {
      return NextResponse.json({ success: true, total: 0, data: [] }, { status: 200 });
    }

    // Populated chi tiết CV theo đúng Schema Resume
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate({
        path: "jobId",
        select: "title location salaryMin salaryMax",
      })
      .populate({
        path: "userId",
        select: "fullName email phone avatar",
      })
      .populate({
        path: "resumeId",
        select: "title type fileUrl cvData templateName isPublic updatedAt", // ⚡ Chọn đầy đủ thông tin CV
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, total: applications.length, data: applications },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ LỖI GET EMPLOYER APPLICATIONS:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json({ success: false, message: "ID hồ sơ không hợp lệ" }, { status: 400 });
    }

    const validStatuses = ["SENT", "REVIEWING", "INTERVIEW", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Trạng thái không hợp lệ" }, { status: 400 });
    }

    const updatedApp = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    if (!updatedApp) {
      return NextResponse.json({ success: false, message: "Không tìm thấy hồ sơ" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: `Đã cập nhật trạng thái: ${status}`, data: updatedApp },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}