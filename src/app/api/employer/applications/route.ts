import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import { getAuthPayload } from "@/src/lib/auth";
import Application from "@/src/models/Application";
import Job from "@/src/models/Job";
import Company from "@/src/models/Company";
import Notification from "@/src/models/Notification";
import User from "@/src/models/User";
import "@/src/models/Resume";
import mongoose from "mongoose";

async function getManager(request: Request) {
  const auth = getAuthPayload(request.headers);
  if (!auth?.userId || !mongoose.Types.ObjectId.isValid(auth.userId)) {
    return { error: "Vui lòng đăng nhập tài khoản nhà tuyển dụng.", status: 401 as const };
  }
  const manager = await User.findById(auth.userId).select("role isBlocked");
  if (!manager || manager.role !== "MANAGER" || manager.isBlocked) {
    return { error: "Bạn không có quyền truy cập hồ sơ ứng tuyển.", status: 403 as const };
  }
  return { manager };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getManager(request);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const companyId = request.nextUrl.searchParams.get("companyId");
    if (companyId && !mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json(
        { success: false, message: "ID công ty không hợp lệ." },
        { status: 400 }
      );
    }

    if (companyId) {
      const ownedCompany = await Company.exists({
        _id: companyId,
        createdBy: auth.manager._id,
      });
      if (!ownedCompany) {
        return NextResponse.json(
          { success: false, message: "Bạn không có quyền xem hồ sơ của công ty này." },
          { status: 403 }
        );
      }
    }

    const employerJobs = await Job.find({
      managerId: auth.manager._id,
      ...(companyId ? { companyId } : {}),
    }).select("_id");
    const applications = await Application.find({
      jobId: { $in: employerJobs.map((job) => job._id) },
    })
      .populate({ path: "jobId", select: "title location salaryMin salaryMax" })
      .populate({ path: "userId", select: "fullName email phone avatar" })
      .populate({
        path: "resumeId",
        select: "title type fileUrl cvData templateName isPublic updatedAt",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, total: applications.length, data: applications },
      { status: 200 }
    );
  } catch (error) {
    console.error("Không thể tải hồ sơ ứng tuyển cho nhà tuyển dụng:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải hồ sơ ứng tuyển." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getManager(request);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { applicationId, status } = body;
    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { success: false, message: "ID hồ sơ không hợp lệ." },
        { status: 400 }
      );
    }
    const validStatuses = ["SENT", "REVIEWING", "INTERVIEW", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Trạng thái không hợp lệ." },
        { status: 400 }
      );
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy hồ sơ." },
        { status: 404 }
      );
    }

    const job = await Job.findOne({ _id: application.jobId, managerId: auth.manager._id })
      .select("title");
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền cập nhật hồ sơ này." },
        { status: 403 }
      );
    }

    const previousStatus = application.status;
    let approvalNotificationId: mongoose.Types.ObjectId | null = null;
    if (status === "APPROVED" && previousStatus !== "APPROVED") {
      const notification = await Notification.create({
        recipientId: application.userId,
        type: "APPLICATION_APPROVED",
        title: "Hồ sơ ứng tuyển đã được chấp thuận",
        message: "Nhà tuyển dụng sẽ liên hệ với bạn trong thời gian tới. Cảm ơn bạn đã chọn công ty",
        href: "/my-resumes",
        relatedApplicationId: application._id,
      });
      approvalNotificationId = notification._id;
    }

    application.status = status;
    try {
      await application.save();
    } catch (saveError) {
      if (approvalNotificationId) {
        await Notification.deleteOne({ _id: approvalNotificationId });
      }
      throw saveError;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Đã cập nhật trạng thái: ${status}`,
        data: application,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Không thể cập nhật hồ sơ ứng tuyển:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Không thể cập nhật hồ sơ ứng tuyển.",
      },
      { status: 500 }
    );
  }
}
