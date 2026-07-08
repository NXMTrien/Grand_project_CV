import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const jobId = params.id;
  try {
    const body = await request.json();
    const { resumeId, coverLetter } = body;

    // Thực tế: Tạo một bản ghi mới trong bảng 'Application' link giữa Candidate, Job và Resume
    return NextResponse.json({ 
      success: true, 
      message: "Ứng tuyển thành công! CV của bạn đã được gửi tới nhà tuyển dụng." 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}