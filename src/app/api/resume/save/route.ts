import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 1. Xác thực người dùng qua Token gửi lên từ Header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Bạn chưa đăng nhập" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    if (decoded.role !== "CANDIDATE") {
      return NextResponse.json({ message: "Chỉ ứng viên mới có quyền tạo CV" }, { status: 0 });
    }

    // 2. Lấy dữ liệu CV từ body
    const { title, cvData } = await req.json();

    if (!title) {
      return NextResponse.json({ message: "Vui lòng nhập tiêu đề CV" }, { status: 400 });
    }

    // 3. Tiến hành Lưu hoặc Cập nhật nếu đã có sẵn (Upsert)
    const updatedResume = await Resume.findOneAndUpdate(
      { candidateId: decoded.userId, title: title }, // Điều kiện tìm kiếm
      {
        candidateId: decoded.userId,
        title,
        type: "ONLINE",
        cvData,
        isPublic: true
      },
      { new: true, upsert: true } // Nếu chưa có thì tạo mới, có rồi thì update
    );

    return NextResponse.json({
      message: "Lưu CV thành công!",
      resumeId: updatedResume._id
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi hệ thống", error: error.message }, { status: 500 });
  }
}