import { NextResponse } from "next/server";
import  connectDB  from "@/src/lib/mongodb"; 
import User from "@/src/models/User"; 

// GET: Lấy thông tin cá nhân người dùng hiện tại
export async function GET(request: Request) {
  try {
    // Luồng thực tế: Lấy token từ cookie/header -> giải mã lấy userId
    // const userId = getUserIdFromToken(request); 
    
    // Giả định dữ liệu demo
    const mockUser = {
      id: "user_123",
      name: "Nguyễn Văn A",
      email: "candidate@gmail.com",
      phone: "0987654321",
      avatar: "https://example.com/avatar.png",
      skills: ["React", "Next.js", "Node.js"],
      experience: "2 năm kinh nghiệm Frontend",
    };

    return NextResponse.json({ success: true, data: mockUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin cá nhân
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, skills, experience, avatar } = body;

    // Luồng thực tế: Validate dữ liệu và update vào DB
    // const updatedUser = await User.findByIdAndUpdate(userId, { name, phone, ... }, { new: true });

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công!",
      data: { name, phone, skills, experience, avatar }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}