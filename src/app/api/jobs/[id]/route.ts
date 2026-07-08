import { NextResponse } from "next/server";

// GET: Chi tiết 1 công việc theo ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const jobId = params.id;
  try {
    // Thực tế: const job = await Job.findById(jobId);
    const mockJob = {
      id: jobId,
      title: "Lập trình viên Next.js (Sên-nờ)",
      company: "Công nghệ Grand Tech",
      salary: "20 - 35 triệu",
      description: "Phát triển hệ thống web app lớn bằng Next.js...",
      requirements: "Có tối thiểu 2 năm kinh nghiệm với React/Next.js",
      location: "Hà Nội",
    };

    return NextResponse.json({ success: true, data: mockJob }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật bài đăng (Dành cho Employer)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const jobId = params.id;
  try {
    const body = await request.json();
    // Thực tế: Cập nhật vào DB sau khi check xem Employer này có quyền sửa job này không
    return NextResponse.json({ success: true, message: `Đã cập nhật bài đăng ${jobId}` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Xóa bài tuyển dụng (Dành cho Employer / Admin)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const jobId = params.id;
  try {
    // Thực tế: await Job.findByIdAndDelete(jobId);
    return NextResponse.json({ success: true, message: `Đã xóa bài đăng ${jobId} thành công` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}