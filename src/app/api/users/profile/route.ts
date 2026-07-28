import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb"; 
import { getAuthPayload } from "@/src/lib/auth";
import User from "@/src/models/User"; 
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Helper lấy UserId an toàn từ Payload JWT
function extractUserId(auth: any): string | null {
  if (!auth) return null;
  return auth.userId || auth.id || auth._id || auth.sub || null;
}

// ==========================================
// 🔍 GET: XỬ LÝ LẤY CÁ NHÂN HẶC DANH SÁCH TẤT CẢ
// ==========================================
export async function GET(request: Request) {
  try {
    await connectDB();

    // 1. Xác thực danh tính người dùng từ Token JWT
    const auth = getAuthPayload(request.headers);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Xác thực thất bại! Token không hợp lệ hoặc đã hết hạn." }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const getAll = searchParams.get("all");

    // 🔴 TRƯỜNG HỢP 1: Lấy danh sách tất cả người dùng (?all=true)
    if (getAll === "true") {
      // BẢO MẬT: Kiểm tra quyền Admin
      if (auth.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Bạn không có quyền xem danh sách tất cả người dùng!" }, 
          { status: 403 }
        );
      }

      const users = await User.find({})
        .select("-password -otpCode -otpExpires")
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json(
        {
          success: true,
          count: users.length,
          data: users,
        },
        { status: 200 }
      );
    }

    // 🟢 TRƯỜNG HỢP 2: Lấy thông tin cá nhân của người đăng nhập
    const userId = extractUserId(auth);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Định dạng User ID trong Token không hợp lệ!" }, 
        { status: 400 }
      );
    }

    const user = await User.findById(new mongoose.Types.ObjectId(userId))
      .select("-password -otpCode -otpExpires")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Tài khoản của bạn không tồn tại trên hệ thống!" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });

  } catch (error: any) {
    console.error("Lỗi GET /api/users:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message }, 
      { status: 500 }
    );
  }
}

// ==========================================
// 📝 PUT: TỰ CẬP NHẬT THÔNG TIN CỦA CHÍNH MÌNH
// ==========================================
export async function PUT(request: Request) {
  try {
    await connectDB();

    // 1. Xác thực danh tính từ Token JWT (Không tin tưởng x-user-id truyền từ client)
    const auth = getAuthPayload(request.headers);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Xác thực thất bại! Token không hợp lệ hoặc đã hết hạn." }, 
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

    // 2. Lấy dữ liệu cập nhật từ Body
    const body = await request.json();
    const { fullName, dateOfBirth, avatar, phone } = body;

    // Chuẩn bị payload cập nhật (Chỉ lấy các trường được phép cập nhật)
    const updateData: Record<string, any> = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (phone !== undefined) updateData.phone = phone;

    // 3. Tiến hành cập nhật trực tiếp vào MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { $set: updateData },
      { new: true, runValidators: true } // Trả về dữ liệu mới & ép validate Schema
    ).select("-password -otpCode -otpExpires");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Cập nhật thất bại. Tài khoản không tồn tại!" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công!",
      data: updatedUser
    }, { status: 200 });

  } catch (error: any) {
    console.error("Lỗi PUT /api/users:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message }, 
      { status: 500 }
    );
  }
}

// ==========================================
// 🔑 PATCH: ĐỔI MẬT KHẨU TÀI KHOẢN
// ==========================================
export async function PATCH(request: Request) {
  try {
    await connectDB();

    // 1. Xác thực danh tính từ Token JWT
    const auth = getAuthPayload(request.headers);
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Xác thực thất bại! Token không hợp lệ hoặc đã hết hạn.",
        },
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

    // 2. Lấy thông tin mật khẩu cũ & mới từ Body
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu mới phải chứa ít nhất 6 ký tự!",
        },
        { status: 400 }
      );
    }

    // 3. Tìm user trong DB để lấy password hash hiện tại
    const user = await User.findById(new mongoose.Types.ObjectId(userId));

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Tài khoản không tồn tại!" },
        { status: 404 }
      );
    }

    // 4. Đối chiếu mật khẩu hiện tại bằng bcrypt
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu hiện tại không chính xác!" },
        { status: 400 }
      );
    }

    // 5. Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu mới không được giống với mật khẩu hiện tại!",
        },
        { status: 400 }
      );
    }

    // 6. Mã hóa mật khẩu mới và lưu vào DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    // Tùy chọn: Nếu bạn có dùng cờ này cho lần đăng nhập đầu tiên
    if (user.isFirstLogin !== undefined) {
      user.isFirstLogin = false;
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Đổi mật khẩu thành công!",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Lỗi PATCH /api/users (Đổi mật khẩu):", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống", error: error.message },
      { status: 500 }
    );
  }
}