import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Job from "@/src/models/Job";
import "@/src/models/Company";
import "@/src/models/Category";
import "@/src/models/User";

export async function GET() {
  try {
    await connectDB();
    const jobs = await Job.find({ status: "APPROVED" })
      .populate("companyId", "name logo address website")
      .populate("categoryId", "name slug")
      .populate("managerId", "fullName role")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: jobs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
