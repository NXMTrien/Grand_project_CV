import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import User from "@/src/models/User";
import bcrypt from "bcrypt";
import { parseAdultDateOfBirth } from "@/src/lib/age";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password, fullName, dateOfBirth } = await req.json();

    if (!email || !password || !fullName || !dateOfBirth) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const birthDate = parseAdultDateOfBirth(dateOfBirth);
    if (!birthDate) {
      return NextResponse.json({ message: "Bạn phải từ 18 tuổi trở lên để đăng ký" }, { status: 400 });
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
      role: "CANDIDATE"
    });

    return NextResponse.json({ message: "Đăng ký thành công!", userId: newUser._id }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Lỗi Server", error: error instanceof Error ? error.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}