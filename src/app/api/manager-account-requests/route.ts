import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/src/lib/mongodb";
import { requireAdmin } from "@/src/lib/admin-auth";
import ManagerAccountRequest from "@/src/models/ManagerAccountRequest";

const requestMessage =
  "Xin chào Admin, tôi muốn xin tài khoản để đăng thông tin tuyển dụng lên Trang của bạn. Mong được bạn chấp thuận";
const statuses = ["NEW", "REVIEWING", "RESOLVED"] as const;
const retentionDuration = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    await connectDB();
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Thông tin xin tài khoản không hợp lệ." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;
    const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const birthYear = Number(input.birthYear);
    const latestEligibleBirthYear = new Date().getUTCFullYear() - 18;

    if (
      !fullName ||
      fullName.length > 120 ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !Number.isInteger(birthYear) ||
      birthYear < 1900 ||
      birthYear > latestEligibleBirthYear
    ) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập họ tên, email hợp lệ và năm sinh từ đủ 18 tuổi." },
        { status: 400 }
      );
    }

    const existingRequest = await ManagerAccountRequest.findOne({
      email,
      status: { $ne: "RESOLVED" },
    }).select("_id");
    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: "Yêu cầu của email này đang được Admin xử lý." },
        { status: 409 }
      );
    }

    const accountRequest = await ManagerAccountRequest.create({
      fullName,
      email,
      birthYear,
      message: requestMessage,
    });

    return NextResponse.json(
      { success: true, message: "Đã gửi yêu cầu xin tài khoản Manager.", data: { id: accountRequest._id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Không thể gửi yêu cầu tài khoản Manager:", error);
    return NextResponse.json(
      { success: false, message: "Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    const retentionCutoff = new Date(Date.now() - retentionDuration);
    await ManagerAccountRequest.deleteMany({
      status: "RESOLVED",
      processedAt: { $lte: retentionCutoff },
    });
    const requests = await ManagerAccountRequest.find({
      $or: [
        { status: { $ne: "RESOLVED" } },
        { processedAt: { $gt: retentionCutoff } },
      ],
    }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("Không thể tải yêu cầu tài khoản Manager:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải danh sách yêu cầu." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB();
    const auth = await requireAdmin(request);
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu cập nhật không hợp lệ." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;
    const requestId = input.requestId;
    const status = input.status;
    if (typeof requestId !== "string" || !mongoose.Types.ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { success: false, message: "Mã yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }
    if (typeof status !== "string" || !statuses.includes(status as (typeof statuses)[number])) {
      return NextResponse.json(
        { success: false, message: "Trạng thái yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }

    const accountRequest = await ManagerAccountRequest.findById(requestId);
    if (!accountRequest) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy yêu cầu." },
        { status: 404 }
      );
    }

    const nextStatus = status as (typeof statuses)[number];
    if (nextStatus === "RESOLVED") {
      if (accountRequest.status !== "RESOLVED" || !accountRequest.processedAt) {
        accountRequest.processedAt = new Date();
      }
    } else {
      accountRequest.processedAt = null;
    }
    accountRequest.status = nextStatus;
    await accountRequest.save();

    return NextResponse.json({ success: true, data: accountRequest });
  } catch (error) {
    console.error("Không thể cập nhật yêu cầu tài khoản Manager:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật trạng thái yêu cầu." },
      { status: 500 }
    );
  }
}
