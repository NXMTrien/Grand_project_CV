import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Company from "@/src/models/Company";
import Job from "@/src/models/Job";
import User from "@/src/models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface JwtPayload {
  userId?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập lại." }, { status: 401 });
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        authHeader.slice("Bearer ".length),
        process.env.JWT_SECRET || "your_fallback_jwt_secret"
      ) as JwtPayload;
    } catch {
      return NextResponse.json({ success: false, message: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
    }

    if (!payload.userId || !mongoose.Types.ObjectId.isValid(payload.userId)) {
      return NextResponse.json({ success: false, message: "Tài khoản không hợp lệ." }, { status: 401 });
    }

    const manager = await User.findById(payload.userId).select("_id role isBlocked");
    if (!manager || manager.role !== "MANAGER" || manager.isBlocked) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền thay đổi trạng thái tuyển dụng." }, { status: 403 });
    }

    const { id: jobId } = await params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, message: "ID công việc không hợp lệ." }, { status: 400 });
    }

    const body = await request.json();
    if (body.hiringStatus !== "OPEN" && body.hiringStatus !== "CLOSED") {
      return NextResponse.json({ success: false, message: "Trạng thái tuyển dụng không hợp lệ." }, { status: 400 });
    }

    const job = await Job.findOne({ _id: jobId, managerId: manager._id }).select("_id companyId");
    if (!job) {
      return NextResponse.json({ success: false, message: "Không tìm thấy công việc thuộc tài khoản của bạn." }, { status: 404 });
    }

    const ownedCompany = await Company.exists({ _id: job.companyId, createdBy: manager._id });
    if (!ownedCompany) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền sửa công việc này." }, { status: 403 });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      job._id,
      { $set: { hiringStatus: body.hiringStatus } },
      { new: true, runValidators: true }
    ).select("_id hiringStatus");

    return NextResponse.json(
      { success: true, message: "Đã cập nhật trạng thái tuyển dụng.", data: updatedJob },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update job hiring status:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật trạng thái tuyển dụng." },
      { status: 500 }
    );
  }
}
