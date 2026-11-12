// app/api/admin/jobs/route.ts (hoặc đường dẫn API duyệt tin của bạn)
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/src/lib/mongodb";
import Job from "@/src/models/Job";

interface JwtPayload {
  userId: string;
  role: string;
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    // 1. Lấy Bearer Token từ Header Authorization (gửi từ localStorage của Frontend)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Yêu cầu bị từ chối. Bạn chưa cung cấp Token đăng nhập!" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "YourSecretKeyHere";

    // 2. Xác thực Token & Kiểm tra Quyền ADMIN
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    } catch (err) {
      return NextResponse.json(
        { message: "Token không hợp lệ hoặc đã hết hạn!" },
        { status: 401 }
      );
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Bạn không có quyền ADMIN để thực hiện thao tác này!" },
        { status: 403 }
      );
    }

    // 3. Đọc dữ liệu từ Body
    const { jobId, status } = await req.json();

    if (!jobId || !status) {
      return NextResponse.json(
        { message: "Thiếu thông tin bắt buộc (jobId và status)" },
        { status: 400 }
      );
    }

    // 4. Kiểm tra trạng thái hợp lệ
    const validStatuses = ["APPROVED", "REJECTED", "EXPIRED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Trạng thái không hợp lệ! Chỉ chấp nhận: APPROVED, REJECTED, EXPIRED." },
        { status: 400 }
      );
    }

    // 5. Cập nhật vào DB
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { status },
      { new: true }
    );

    if (!updatedJob) {
      return NextResponse.json({ message: "Không tìm thấy tin tuyển dụng này!" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: `Đã cập nhật trạng thái tin tuyển dụng thành: ${status}`,
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}
// Thêm hàm GET này vào chung file API ở trên
export async function GET(req: Request) {
  try {
    await connectDB();

    // Lấy tất cả tin có trạng thái PENDING (chưa xác thực)
    const pendingJobs = await Job.find({ status: "PENDING" })
      .populate("companyId", "name email") // Lấy thêm thông tin công ty nếu có ref
      .sort({ createdAt: -1 });

    return NextResponse.json({ data: pendingJobs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}