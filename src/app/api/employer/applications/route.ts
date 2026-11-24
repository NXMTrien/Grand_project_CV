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
import nodemailer from "nodemailer";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

async function getManager(request: Request) {
  const auth = getAuthPayload(request.headers);
  if (!auth?.userId || !mongoose.Types.ObjectId.isValid(auth.userId)) {
    return { error: "Vui lòng đăng nhập tài khoản nhà tuyển dụng.", status: 401 as const };
  }
  const manager = await User.findById(auth.userId).select("role isBlocked fullName");
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
      .populate({
        path: "jobId",
        select: "title location salaryMin salaryMax companyId managerId",
        populate: [
          { path: "companyId", select: "name address" },
          { path: "managerId", select: "fullName" },
        ],
      })
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

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu cập nhật không hợp lệ." },
        { status: 400 }
      );
    }
    const { applicationId, status, appointmentDate } = body as Record<string, unknown>;
    if (typeof applicationId !== "string" || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { success: false, message: "ID hồ sơ không hợp lệ." },
        { status: 400 }
      );
    }
    const validStatuses = ["SENT", "REVIEWING", "INTERVIEW", "APPROVED", "REJECTED"];
    if (typeof status !== "string" || !validStatuses.includes(status)) {
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
      .select("title location")
      .populate<{ companyId: { name?: string; address?: string } | null }>("companyId", "name address")
      .populate<{ managerId: { fullName?: string } | null }>("managerId", "fullName");
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền cập nhật hồ sơ này." },
        { status: 403 }
      );
    }

    const previousStatus = application.status as string;
    if (status === previousStatus) {
      return NextResponse.json({ success: true, data: application }, { status: 200 });
    }
    if (previousStatus === "APPROVED" || previousStatus === "REJECTED") {
      return NextResponse.json(
        { success: false, message: "Hồ sơ đã chốt trạng thái và không thể chỉnh sửa." },
        { status: 409 }
      );
    }

    let notificationData: {
      type: "APPLICATION_REVIEWING" | "APPLICATION_APPROVED";
      title: string;
      message: string;
    } | null = null;
    let invitationEmail: { to: string; subject: string; html: string } | null = null;

    if (status === "REVIEWING") {
      notificationData = {
        type: "APPLICATION_REVIEWING",
        title: "Hồ sơ của bạn đang được xem xét",
        message: "CV của bạn đang được nhà tuyển dụng cân nhắc",
      };
    } else if (status === "APPROVED") {
      if (typeof appointmentDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
        return NextResponse.json(
          { success: false, message: "Vui lòng chọn ngày mời ứng viên đến công ty." },
          { status: 400 }
        );
      }

      const appointment = new Date(`${appointmentDate}T00:00:00.000Z`);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (
        Number.isNaN(appointment.getTime()) ||
        appointment.toISOString().slice(0, 10) !== appointmentDate ||
        appointment < today
      ) {
        return NextResponse.json(
          { success: false, message: "Ngày hẹn không hợp lệ hoặc đã qua." },
          { status: 400 }
        );
      }

      const company = job.companyId;
      const recruiter = job.managerId;
      const companyName = company?.name?.trim() || "";
      const recruiterName = recruiter?.fullName?.trim() || auth.manager.fullName?.trim() || "";
      const companyAddress = company?.address?.trim() || job.location?.trim() || "";
      if (!companyName || !recruiterName || !companyAddress) {
        return NextResponse.json(
          { success: false, message: "Thiếu thông tin công ty hoặc nhà tuyển dụng để tạo thư mời." },
          { status: 400 }
        );
      }

      const candidate = await User.findById(application.userId).select("fullName email");
      if (!candidate?.email) {
        return NextResponse.json(
          { success: false, message: "Không tìm thấy email của ứng viên để gửi thư mời." },
          { status: 400 }
        );
      }
      if (!process.env.MAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return NextResponse.json(
          { success: false, message: "Chưa cấu hình email gửi thư mời. Vui lòng liên hệ quản trị viên." },
          { status: 503 }
        );
      }

      const formattedDate = appointment.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      });
      notificationData = {
        type: "APPLICATION_APPROVED",
        title: "Hồ sơ ứng tuyển đã được chấp thuận",
        message: "CV của bạn đã được chấp thuận xin hãy kiểm tra Email",
      };
      invitationEmail = {
        to: candidate.email,
        subject: `Thư mời trao đổi - ${companyName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a;border:1px solid #e2e8f0;border-radius:12px">
            <h2 style="color:#059669">Thư mời trao đổi</h2>
            <p>Xin chào ${escapeHtml(candidate.fullName || "bạn")},</p>
            <p>Xin mời bạn đến công ty để thuận tiện trao đổi.</p>
            <div style="padding:16px;background:#f8fafc;border-radius:8px;line-height:1.8">
              <strong>Tên công ty:</strong> ${escapeHtml(companyName)}<br />
              <strong>Người tuyển dụng:</strong> ${escapeHtml(recruiterName)}<br />
              <strong>Địa chỉ công ty:</strong> ${escapeHtml(companyAddress)}<br />
              <strong>Thời gian:</strong> ${escapeHtml(formattedDate)}
            </div>
            <p style="margin-top:24px">Trân trọng,<br />${escapeHtml(recruiterName)}</p>
          </div>
        `,
      };
    }

    let notificationId: mongoose.Types.ObjectId | null = null;
    let applicationSaved = false;
    try {
      application.status = status;
      await application.save();
      applicationSaved = true;

      if (notificationData) {
        const notification = await Notification.create({
          recipientId: application.userId,
          ...notificationData,
          href: "/my-resumes",
          relatedApplicationId: application._id,
        });
        notificationId = notification._id;
      }

      if (invitationEmail) {
        const mailPort = Number(process.env.MAIL_PORT) || 587;
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: mailPort,
          secure: mailPort === 465,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: `"GrandJob" <${process.env.EMAIL_USER}>`,
          ...invitationEmail,
        });
      }
    } catch (updateError) {
      if (notificationId) {
        await Notification.deleteOne({ _id: notificationId });
      }
      if (applicationSaved) {
        application.status = previousStatus as typeof application.status;
        await application.save();
      }
      throw updateError;
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
