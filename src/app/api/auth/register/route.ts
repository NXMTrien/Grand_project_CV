import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import User from "@/src/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password, fullName, dateOfBirth, role } = await req.json();

    if (!email || !password || !fullName || !dateOfBirth) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kiểm tra điều kiện tuổi >= 18
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return NextResponse.json({ message: "Người dùng phải từ 18 tuổi trở lên" }, { status: 400 });
    }

    // Kiểm tra trùng email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "Email này đã được đăng ký" }, { status: 400 });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
      dateOfBirth: birthDate,
      role: role || "CANDIDATE"
    });

    return NextResponse.json({ message: "Đăng ký thành công!", userId: newUser._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}