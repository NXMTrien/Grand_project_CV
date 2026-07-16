import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Job from "@/src/models/Job";

export async function PUT(req: Request) {
  try {
    await connectDB();

    // 1. Kiểm tra API Key của Admin từ Header để phân quyền
    const adminApiKey = req.headers.get("x-admin-api-key");
    const systemAdminKey = process.env.ADMIN_API_KEY || "GrandJobSecret2026";

    if (!adminApiKey || adminApiKey !== systemAdminKey) {
      return NextResponse.json(
        { message: "Yêu cầu bị từ chối. Bạn không có quyền ADMIN để kiểm duyệt tin!" },
        { status: 403 }
      );
    }

    // 2. Đọc dữ liệu duyệt tin từ Body của Postman gửi lên
    const { jobId, status } = await req.json();

    if (!jobId || !status) {
      return NextResponse.json(
        { message: "Thiếu thông tin bắt buộc (jobId và status)" }, 
        { status: 400 }
      );
    }

    // 3. Kiểm tra trạng thái gửi lên có hợp lệ theo Schema không
    const validStatuses = ["APPROVED", "REJECTED", "EXPIRED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Trạng thái kiểm duyệt không hợp lệ! Chỉ chấp nhận: APPROVED, REJECTED, EXPIRED." }, 
        { status: 400 }
      );
    }

    // 4. Tìm công việc trong DB và cập nhật trạng thái mới
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { status: status },
      { new: true } // Trả về dữ liệu mới sau khi sửa đổi thành công
    );

    if (!updatedJob) {
      return NextResponse.json({ message: "Không tìm thấy tin tuyển dụng này!" }, { status: 404 });
    }

    // 5. Phản hồi thành công
    return NextResponse.json({
      message: `Đã cập nhật trạng thái tin tuyển dụng thành: ${status}`,
      job: updatedJob
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}