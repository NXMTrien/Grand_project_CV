import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Application from "@/src/models/Application";
import Company from "@/src/models/Company";
import Job from "@/src/models/Job";
import User from "@/src/models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface JwtPayload {
  userId?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập lại." }, { status: 401 });
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        authHeader.slice("Bearer ".length),
        process.env.JWT_SECRET || "your_fallback_jwt_secret"
      ) as JwtPayload;
    } catch {
      return NextResponse.json({ success: false, message: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
    }

    if (!payload.userId || !mongoose.Types.ObjectId.isValid(payload.userId)) {
      return NextResponse.json({ success: false, message: "Tài khoản không hợp lệ." }, { status: 401 });
    }

    const manager = await User.findById(payload.userId).select("_id role isBlocked");
    if (!manager || manager.role !== "MANAGER" || manager.isBlocked) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền xem dữ liệu này." }, { status: 403 });
    }

    const companies = await Company.find({ createdBy: manager._id }).select("_id name").lean();
    const companyIds = companies.map((company) => company._id);
    const jobs = await Job.find({ companyId: { $in: companyIds }, managerId: manager._id })
      .select("_id title companyId salaryMin salaryMax location status hiringStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const jobIds = jobs.map((job) => job._id);
    const applicationCounts = jobIds.length
      ? await Application.aggregate([
          { $match: { jobId: { $in: jobIds } } },
          { $group: { _id: "$jobId", count: { $sum: 1 } } },
        ])
      : [];
    const countsByJob = new Map(applicationCounts.map((item) => [item._id.toString(), item.count]));
    const jobsByCompany = new Map<string, typeof jobs>();

    for (const job of jobs) {
      const companyId = job.companyId.toString();
      const companyJobs = jobsByCompany.get(companyId) || [];
      companyJobs.push(job);
      jobsByCompany.set(companyId, companyJobs);
    }

    return NextResponse.json(
      {
        success: true,
        data: companies.map((company) => ({
          companyId: company._id,
          jobs: (jobsByCompany.get(company._id.toString()) || []).map((job) => ({
            ...job,
            applicationCount: countsByJob.get(job._id.toString()) || 0,
          })),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to load manager company jobs:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải công việc và số hồ sơ ứng tuyển." },
      { status: 500 }
    );
  }
}
