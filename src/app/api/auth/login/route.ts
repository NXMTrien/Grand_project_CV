import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import User from "@/src/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Vui lòng nhập đầy đủ email và mật khẩu" }, { status: 400 });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Tài khoản hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    // Kiểm tra mật khẩu
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ message: "Tài khoản hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    // Tạo JWT Token (Hết hạn sau 1 ngày)
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Trả về thông tin danh tính và token cho frontend
    return NextResponse.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        userId: user._id,
        fullName: user.fullName,
        role: user.role
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}