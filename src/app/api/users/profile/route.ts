import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import { getAuthPayload } from "@/src/lib/auth";
import User from "@/src/models/User";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Helper lấy UserId từ Payload Token
function extractUserId(auth: any): string | null {
  if (!auth) return null;
  return auth.userId || auth.id || auth._id || auth.sub || null;
}

// ========================================================
// 🔍 GET: LẤY THÔNG TIN CÁ NHÂN CỦA USER ĐANG ĐĂNG NHẬP
// URL: /api/users/profile
// ========================================================
export async function GET(request: Request) {
  try {
    await connectDB();

    const auth = getAuthPayload(request.headers);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Xác thực thất bại! Vui lòng đăng nhập lại." },
        { status: 401 }
      );
    }

    const userId = extractUserId(auth);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "User ID trong Token không hợp lệ!" },
        { status: 400 }
      );
    }

    const user = await User.findById(new mongoose.Types.ObjectId(userId))
      .select("-password -otpCode -otpExpires")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Tài khoản của bạn không tồn tại!" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message },
      { status: 500 }
    );
  }
}

// ========================================================
// 📝 PUT: CẬP NHẬT THÔNG TIN CÁ NHÂN (PROFILE)
// URL: /api/users/profile
// ========================================================
export async function PUT(request: Request) {
  try {
    await connectDB();

    const auth = getAuthPayload(request.headers);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Xác thực thất bại! Vui lòng đăng nhập lại." },
        { status: 401 }
      );
    }

    const userId = extractUserId(auth);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Định dạng User ID không hợp lệ!" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { fullName, dateOfBirth, avatar, phone } = body;

    const updateData: Record<string, any> = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (phone !== undefined) updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -otpCode -otpExpires");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Tài khoản không tồn tại!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật thông tin cá nhân thành công!",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message },
      { status: 500 }
    );
  }
}

// ========================================================
// 🔑 PATCH: NGƯỜI DÙNG TỰ ĐỔI MẬT KHẨU
// URL: /api/users/profile
// ========================================================
export async function PATCH(request: Request) {
  try {
    await connectDB();

    const auth = getAuthPayload(request.headers);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Xác thực thất bại! Vui lòng đăng nhập lại." },
        { status: 401 }
      );
    }

    const userId = extractUserId(auth);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Định dạng User ID không hợp lệ!" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu mới phải từ 6 ký tự trở lên!" },
        { status: 400 }
      );
    }

    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Tài khoản không tồn tại!" },
        { status: 404 }
      );
    }

    // Kiểm tra mật khẩu cũ
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu hiện tại không chính xác!" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu mới không được trùng mật khẩu cũ!" },
        { status: 400 }
      );
    }

    // Hash và lưu mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    if (user.isFirstLogin !== undefined) {
      user.isFirstLogin = false;
    }

    await user.save();

    return NextResponse.json(
      { success: true, message: "Đổi mật khẩu thành công!" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message },
      { status: 500 }
    );
  }
}