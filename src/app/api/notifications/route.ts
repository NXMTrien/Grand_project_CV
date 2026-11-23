import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import { getAuthPayload } from "@/src/lib/auth";
import Notification from "@/src/models/Notification";
import User from "@/src/models/User";
import mongoose from "mongoose";

async function getAuthenticatedUser(request: Request) {
  const auth = getAuthPayload(request.headers);
  if (!auth?.userId || !mongoose.Types.ObjectId.isValid(auth.userId)) {
    return { error: "Vui lòng đăng nhập để xem thông báo.", status: 401 as const };
  }

  const user = await User.findById(auth.userId).select("role isBlocked");
  if (!user || user.isBlocked) {
    return { error: "Tài khoản không tồn tại hoặc đã bị khóa.", status: 403 as const };
  }
  return { user };
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const auth = await getAuthenticatedUser(request);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const notifications = await Notification.find({ recipientId: auth.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Không thể tải thông báo:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải thông báo." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB();
    const auth = await getAuthenticatedUser(request);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu cập nhật không hợp lệ." },
        { status: 400 }
      );
    }
    const { notificationId } = body as Record<string, unknown>;
    if (typeof notificationId !== "string" || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return NextResponse.json(
        { success: false, message: "Mã thông báo không hợp lệ." },
        { status: 400 }
      );
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: auth.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy thông báo." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Không thể đánh dấu thông báo:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật thông báo." },
      { status: 500 }
    );
  }
}
