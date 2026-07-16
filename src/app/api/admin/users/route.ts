import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import User from "@/src/models/User";
import mongoose from "mongoose";

// ========================================================
// 📊 GET: ADMIN LẤY TẤT CẢ USER (GỒM CẢ PHÂN CHIA ROLE)
// ========================================================
export async function GET(request: Request) {
  try {
    await connectDB();

    // Xác thực người gọi có phải ADMIN không
    const adminId = request.headers.get("x-admin-id");
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return NextResponse.json({ success: false, message: "Yêu cầu quyền Admin!" }, { status: 401 });
    }

    const checkAdmin = await User.findById(adminId);
    if (!checkAdmin || checkAdmin.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Bạn không có quyền truy cập chức năng này!" }, { status: 403 });
    }

    // Lấy toàn bộ danh sách sắp xếp theo tài khoản mới tạo lên đầu
    const allUsers = await User.find({}).select("-password").sort({ createdAt: -1 });

    // Thống kê số lượng theo từng nhóm role để Admin dễ quản lý
    const stats = {
      total: allUsers.length,
      adminCount: allUsers.filter(u => u.role === "ADMIN").length,
      managerCount: allUsers.filter(u => u.role === "MANAGER").length,
      candidateCount: allUsers.filter(u => u.role === "CANDIDATE").length,
    };

    return NextResponse.json({
      success: true,
      stats,
      data: allUsers
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ========================================================
// 🔒 PATCH: BLOCK / UNBLOCK & KHÓA THAO TÁC TRÊN ROLE
// ========================================================
export async function PATCH(request: Request) {
  try {
    await connectDB();

    // 1. Check quyền Admin tối cao từ Header
    const adminId = request.headers.get("x-admin-id");
    const checkAdmin = await User.findById(adminId);
    if (!checkAdmin || checkAdmin.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Từ chối truy cập! Bạn không phải Admin." }, { status: 403 });
    }

    // 2. Lấy thông tin user cần xử lý từ Body
    const body = await request.json();
    const { targetUserId, action } = body; // action: "BLOCK" hoặc "UNBLOCK"

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ success: false, message: "ID người dùng cần xử lý không hợp lệ!" }, { status: 400 });
    }

    // 🔥 CHỨC NĂNG THÊM MỚI: CHỐNG TỰ KHÓA CHÍNH MÌNH
    // Nếu ID tài khoản muốn khóa trùng khớp với ID Admin đang đăng nhập thực hiện thao tác
    if (targetUserId === adminId) {
      return NextResponse.json({ 
        success: false, 
        message: "Hệ thống đã chặn thao tác này! Bạn không thể tự khóa (Block) tài khoản của chính mình." 
      }, { status: 400 });
    }

    // 3. Tìm user mục tiêu trong DB
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng này!" }, { status: 404 });
    }

    // (Tùy chọn) Chặn không cho block các Admin khác nếu cần
    if (targetUser.role === "ADMIN" && targetUserId !== adminId) {
       return NextResponse.json({ 
         success: false, 
         message: "Hệ thống đã khóa quyền thao tác! Bạn không được phép Block tài khoản ADMIN khác." 
       }, { status: 400 });
    }

    // 4. Xử lý trạng thái Block/Unblock thực tế vào DB
    const statusToUpdate = action === "BLOCK" ? true : false;
    
    targetUser.isBlocked = statusToUpdate;
    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: `Đã ${action === "BLOCK" ? "khóa (Block)" : "mở khóa (Unblock)"} tài khoản ${targetUser.fullName} thành công!`,
      data: {
        userId: targetUser._id,
        fullName: targetUser.fullName,
        role: targetUser.role,
        isBlocked: targetUser.isBlocked
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}