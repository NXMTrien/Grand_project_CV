import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Job from "@/src/models/Job";
import "@/src/models/Company";
import "@/src/models/Category";
import "@/src/models/User";
import mongoose from "mongoose";

// GET: Chi tiết 1 công việc theo ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, message: "ID công việc không hợp lệ" }, { status: 400 });
    }

    const job = await Job.findById(jobId)
      .populate("companyId", "name logo website address")
      .populate("categoryId", "name slug")
      .populate("managerId", "fullName role");

    if (!job) {
      return NextResponse.json({ success: false, message: "Không tìm thấy công việc" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: job }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật bài đăng (Dành cho Employer)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, message: "ID công việc không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const updatedJob = await Job.findByIdAndUpdate(jobId, body, { new: true, runValidators: true });
    if (!updatedJob) {
      return NextResponse.json({ success: false, message: "Không tìm thấy công việc để cập nhật" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Đã cập nhật bài đăng ${jobId}`, data: updatedJob }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Xóa bài tuyển dụng (Dành cho Employer / Admin)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, message: "ID công việc không hợp lệ" }, { status: 400 });
    }

    const deletedJob = await Job.findByIdAndDelete(jobId);
    if (!deletedJob) {
      return NextResponse.json({ success: false, message: "Không tìm thấy công việc để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Đã xóa bài đăng ${jobId} thành công`, data: deletedJob }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}