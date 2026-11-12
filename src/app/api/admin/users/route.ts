import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import User from "@/src/models/User";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Helper kiểm tra quyền Admin
async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Yêu cầu bị từ chối! Vui lòng đăng nhập lại.", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  let decoded: any;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "YourSecretKey");
  } catch (err) {
    return { error: "Token không hợp lệ hoặc đã hết hạn!", status: 401 };
  }

  const adminId = (decoded.id || decoded.userId || decoded._id)?.toString();
  const checkAdmin = await User.findById(adminId);

  if (!checkAdmin || checkAdmin.role !== "ADMIN") {
    return { error: "Từ chối truy cập! Bạn không có quyền Admin.", status: 403 };
  }

  return { adminId, checkAdmin };
}

// ========================================================
// 📊 GET: ADMIN LẤY DANH SÁCH & THỐNG KÊ TOÀN BỘ USER
// URL: /api/admin/users
// ========================================================
export async function GET(request: Request) {
  try {
    await connectDB();

    const auth = await verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const allUsers = await User.find({})
      .select("-password -otpCode -otpExpires")
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      total: allUsers.length,
      adminCount: allUsers.filter((u) => u.role === "ADMIN").length,
      managerCount: allUsers.filter((u) => u.role === "MANAGER").length,
      candidateCount: allUsers.filter((u) => u.role === "CANDIDATE").length,
      activeCount: allUsers.filter((u) => u.status === "ACTIVE" || !u.isBlocked).length,
      blockedCount: allUsers.filter((u) => u.isBlocked || u.status === "INACTIVE").length,
    };

    return NextResponse.json(
      {
        success: true,
        stats,
        count: allUsers.length,
        data: allUsers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống Admin", error: error.message },
      { status: 500 }
    );
  }
}

// ========================================================
// 🔒 PATCH: ADMIN KHÓA / MỞ KHÓA TÀI KHOẢN BẤT KỲ
// URL: /api/admin/users
// Body: { "targetUserId": "...", "action": "BLOCK" | "UNBLOCK" } 
// Hoặc Body: { "targetUserId": "...", "status": "INACTIVE" | "ACTIVE" }
// ========================================================
export async function PATCH(request: Request) {
  try {
    await connectDB();

    const auth = await verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const { adminId } = auth;
    const body = await request.json().catch(() => ({}));
    const { targetUserId, action, status } = body;

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { success: false, message: "ID người dùng không hợp lệ!" },
        { status: 400 }
      );
    }

    // Chống tự khóa tài khoản của chính mình
    if (targetUserId.toString() === adminId) {
      return NextResponse.json(
        { success: false, message: "Bạn không thể tự khóa tài khoản của chính mình!" },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng này!" },
        { status: 404 }
      );
    }

    // Chặn khóa Admin khác
    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Hệ thống bảo vệ: Không thể khóa tài khoản ADMIN khác!" },
        { status: 400 }
      );
    }

    // Xử lý logic khóa/mở khóa linh hoạt
    let isBlocked = false;
    let nextStatus = "ACTIVE";

    if (action === "BLOCK" || status === "INACTIVE" || status === "BLOCKED") {
      isBlocked = true;
      nextStatus = "INACTIVE";
    } else if (action === "UNBLOCK" || status === "ACTIVE") {
      isBlocked = false;
      nextStatus = "ACTIVE";
    }

    targetUser.isBlocked = isBlocked;
    targetUser.status = nextStatus;
    await targetUser.save();

    return NextResponse.json(
      {
        success: true,
        message: `Đã ${isBlocked ? "khóa (Block)" : "mở khóa (Unblock)"} tài khoản thành công!`,
        data: {
          userId: targetUser._id,
          fullName: targetUser.fullName,
          role: targetUser.role,
          status: targetUser.status,
          isBlocked: targetUser.isBlocked,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật người dùng", error: error.message },
      { status: 500 }
    );
  }
}