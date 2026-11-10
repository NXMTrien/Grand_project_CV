import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import { getAuthPayload } from "@/src/lib/auth";
import Application from "@/src/models/Application"; 
import Job from "@/src/models/Job";
import mongoose from "mongoose";

// ==========================================
// 📥 HÀM POST: ỨNG TUYỂN THỰC TẾ (LƯU VÀO DB)
// ==========================================
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const jobId = resolvedParams.id; 

    // 1. Kết nối cơ sở dữ liệu
    await connectDB();

    // 2. Lấy dữ liệu định danh
    let candidateId: string | null = request.headers.get("x-candidate-id");
    if (!candidateId) {
      const auth = getAuthPayload(request.headers);
      candidateId = auth?.role === "CANDIDATE" && auth.userId ? auth.userId : null;
    }

    if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return NextResponse.json(
        { success: false, message: "Thiếu hoặc sai định dạng x-candidate-id ở Header hoặc token không hợp lệ!" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { resumeId, coverLetter } = body;

    if (!resumeId || !mongoose.Types.ObjectId.isValid(resumeId)) {
      return NextResponse.json(
        { success: false, message: "Vui lòng truyền đúng định dạng resumeId hợp lệ từ Body!" }, 
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, message: "ID công việc trên đường dẫn URL không đúng định dạng MongoDB!" }, 
        { status: 400 }
      );
    }

    const job = await Job.findById(jobId).select("hiringStatus");
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy công việc." },
        { status: 404 }
      );
    }
    if (job.hiringStatus === "CLOSED") {
      return NextResponse.json(
        { success: false, message: "Công việc đã hết tuyển dụng và không nhận hồ sơ mới." },
        { status: 409 }
      );
    }

    // 3. Kiểm tra trùng lặp
    const alreadyApplied = await Application.findOne({ 
      jobId: new mongoose.Types.ObjectId(jobId), 
      userId: new mongoose.Types.ObjectId(candidateId) 
    });
    
    if (alreadyApplied) {
      return NextResponse.json(
        { success: false, message: "Bạn đã nộp đơn ứng tuyển cho công việc này rồi!" }, 
        { status: 400 }
      );
    }

    // 4. Tiến hành tạo bản ghi thực tế (Ép kiểu ObjectId tường minh)
    const newApplication = await Application.create({
      jobId: new mongoose.Types.ObjectId(jobId),        
      userId: new mongoose.Types.ObjectId(candidateId),
      resumeId: new mongoose.Types.ObjectId(resumeId),
      coverLetter: coverLetter || "",
      status: "SENT"
    });

    return NextResponse.json({ 
      success: true, 
      message: "Ứng tuyển thành công!",
      data: newApplication
    }, { status: 201 });

  } catch (error: unknown) {
    // In lỗi chi tiết ra màn hình terminal của VS Code để dễ kiểm soát
    console.error("❌ LỖI API POST APPLY:", error);
    const message = error instanceof Error ? error.message : "Không thể nộp hồ sơ ứng tuyển";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// ==========================================
// 📊 HÀM GET: LẤY DANH SÁCH THỰC TẾ
// ==========================================
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, message: "ID công việc không hợp lệ!" }, { status: 400 });
    }

    const applicants = await Application.find({ jobId: new mongoose.Types.ObjectId(jobId) })
      .populate({
        path: "userId",
        select: "fullName email" 
      })
      .populate({
        path: "resumeId",
        select: "title fileUrl cvData" 
      })
      .sort({ createdAt: -1 }); 

    return NextResponse.json({ 
      success: true, 
      total: applicants.length,
      data: applicants 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("❌ LỖI API GET APPLY:", error);
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return NextResponse.json({ success: false, message: "Lỗi hệ thống", error: message }, { status: 500 });
  }
}