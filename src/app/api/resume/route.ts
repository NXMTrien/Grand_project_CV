import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import { getAuthPayload } from "@/src/lib/auth";
import Resume from "@/src/models/Resume";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await connectDB();

    let userId: string | null = request.headers.get("x-candidate-id");
    if (!userId) {
      const auth = getAuthPayload(request.headers);
      userId = auth?.userId || null;
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin định danh ứng viên hoặc token không hợp lệ" }, { status: 401 });
    }

    const resumes = await Resume.find({ candidateId: new mongoose.Types.ObjectId(userId) }).sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data: resumes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
