import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb"; 
import User from "@/src/models/User"; 
import mongoose from "mongoose";

// ==========================================
// 🔍 GET: LẤY THÔNG TIN CỦA CHÍNH MÌNH (REAL DB)
// ==========================================
export async function GET(request: Request) {
  try {
    await connectDB();

    // 1. Lấy userId của chính người dùng từ Header
    const userId = request.headers.get("x-user-id");
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Không thể xác định danh tính. Thiếu hoặc sai định dạng x-user-id ở Header!" }, 
        { status: 401 }
      );
    }

    // 2. Tìm kiếm User trong DB (Ẩn mật khẩu, mã OTP để bảo mật)
    const user = await User.findById(new mongoose.Types.ObjectId(userId)).select("-password -otpCode -otpExpires");
    if (!user) {
      return NextResponse.json({ success: false, message: "Tài khoản của bạn không tồn tại trên hệ thống!" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống", error: error.message }, { status: 500 });
  }
}

// ==========================================
// 📝 PUT: TỰ CẬP NHẬT THÔNG TIN CỦA CHÍNH MÌNH
// ==========================================
export async function PUT(request: Request) {
  try {
    await connectDB();

    // 1. Lấy userId của chính người dùng từ Header
    const userId = request.headers.get("x-user-id");
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Không thể xác định danh tính. Thiếu hoặc sai định dạng x-user-id ở Header!" }, 
        { status: 401 }
      );
    }

    // 2. Nhận dữ liệu thay đổi từ Body (Chuẩn hóa fullName theo Schema)
    const body = await request.json();
    const { fullName, dateOfBirth, avatar } = body;

    // 3. Tiến hành cập nhật trực tiếp vào MongoDB bản ghi của chính họ
    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      {
        fullName,      // Cập nhật đúng trường fullName của Schema
        dateOfBirth,   // Định dạng Date hợp lệ (VD: "2000-01-01")
        avatar: avatar || ""
      },
      { new: true, runValidators: true } // Trả về data mới nhất & ép validate Schema
    ).select("-password -otpCode -otpExpires");

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Cập nhật thất bại. Tài khoản không tồn tại!" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công!",
      data: updatedUser
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống", error: error.message }, { status: 500 });
  }
}