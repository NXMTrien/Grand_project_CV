import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Feedback from "@/src/models/Feedback";
import User from "@/src/models/User";
import { getAuthPayload } from "@/src/lib/auth";
import mongoose from "mongoose";

async function requireAdmin(request: Request) {
  const auth = getAuthPayload(request.headers);
  if (!auth?.userId) {
    return { error: "Vui lòng đăng nhập tài khoản Admin.", status: 401 as const };
  }

  const admin = await User.findById(auth.userId).select("role isBlocked");
  if (!admin || admin.role !== "ADMIN" || admin.isBlocked) {
    return { error: "Bạn không có quyền truy cập chức năng này.", status: 403 as const };
  }
  return { admin };
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu phản ánh không hợp lệ." },
        { status: 400 }
      );
    }
    const input = body as Record<string, unknown>;
    const companyName = typeof input.companyName === "string" ? input.companyName.trim() : "";
    const content = typeof input.content === "string" ? input.content.trim() : "";
    const isAnonymous = input.isAnonymous === true;
    const contactName = isAnonymous
      ? ""
      : typeof input.contactName === "string"
        ? input.contactName.trim()
        : "";
    const contactEmail = isAnonymous
      ? ""
      : typeof input.contactEmail === "string"
        ? input.contactEmail.trim()
        : "";
    const contactPhone = isAnonymous
      ? ""
      : typeof input.contactPhone === "string"
        ? input.contactPhone.trim()
        : "";

    if (
      !companyName ||
      companyName.length > 160 ||
      content.length < 10 ||
      content.length > 5000 ||
      contactName.length > 120 ||
      contactEmail.length > 254 ||
      contactPhone.length > 30
    ) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên công ty và nội dung phản ánh từ 10 đến 5.000 ký tự." },
        { status: 400 }
      );
    }

    if (!isAnonymous && (!contactName || (!contactEmail && !contactPhone))) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên và email hoặc số điện thoại, hoặc chọn gửi ẩn danh." },
        { status: 400 }
      );
    }

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { success: false, message: "Email liên hệ không hợp lệ." },
        { status: 400 }
      );
    }

    const feedback = await Feedback.create({
      companyName,
      content,
      isAnonymous,
      contactName,
      contactEmail,
      contactPhone,
    });

    return NextResponse.json(
      { success: true, message: "Cảm ơn bạn đã gửi phản ánh. Ban quản trị sẽ kiểm tra thông tin.", data: { id: feedback._id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Không thể gửi phản ánh:", error);
    return NextResponse.json(
      { success: false, message: "Không thể gửi phản ánh lúc này. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const feedback = await Feedback.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    console.error("Không thể tải danh sách phản ánh:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải danh sách phản ánh." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB();
    const auth = await requireAdmin(request);
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
    const { feedbackId, status } = body as Record<string, unknown>;
    if (typeof feedbackId !== "string" || !mongoose.Types.ObjectId.isValid(feedbackId)) {
      return NextResponse.json(
        { success: false, message: "Mã phản ánh không hợp lệ." },
        { status: 400 }
      );
    }
    if (typeof status !== "string" || !["NEW", "REVIEWING", "RESOLVED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Trạng thái phản ánh không hợp lệ." },
        { status: 400 }
      );
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true, runValidators: true }
    );
    if (!feedback) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy phản ánh." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    console.error("Không thể cập nhật phản ánh:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật phản ánh." },
      { status: 500 }
    );
  }
}
