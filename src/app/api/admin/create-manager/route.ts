import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import User from "@/src/models/User";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    await connectDB();
    
    // TRONG THỰC TẾ: Bạn cần viết thêm middleware check xem người đang gọi API này có phải là ADMIN thật không dựa vào token.
    // Ở đây chúng ta viết logic cốt lõi trước:
    const { email, fullName, dateOfBirth, companyId } = await req.json();

    if (!email || !fullName || !dateOfBirth) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // 1. Kiểm tra tài khoản tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "Email này đã được sử dụng trên hệ thống" }, { status: 400 });
    }

    // 2. Tạo mật khẩu ngẫu nhiên cho Manager (Gồm 8 ký tự)
    const randomPassword = Math.random().toString(36).slice(-8) + "A1!"; 
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // 3. Lưu vào Database với quyền MANAGER
    const newManager = await User.create({
      email,
      password: hashedPassword,
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      role: "MANAGER",
      companyId: companyId || null, // Có thể gắn ID công ty ngay khi tạo nếu có sẵn
      isVerified: true // Vì Admin tạo nên tài khoản mặc định được xác minh luôn
    });

    // 4. Gửi email cấp tài khoản cho Manager
    try {
      await transporter.sendMail({
        from: `"TopCV Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "[TopCV] - Thông báo cấp tài khoản Nhà tuyển dụng",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #22c55e; text-align: center;">Tài Khoản Nhà Tuyển Dụng Đã Được Khởi Tạo</h2>
            <p>Xin chào <strong>${fullName}</strong>,</p>
            <p>Quản trị viên hệ thống TopCV đã cấp tài khoản truy cập dành cho Nhà tuyển dụng/Quản lý cho bạn.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Trang đăng nhập:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">Click vào đây để đến trang đăng nhập</a></p>
              <p style="margin: 5px 0;"><strong>Tài khoản (Email):</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <span style="color: #ef4444; font-weight: bold;">${randomPassword}</span></p>
            </div>

            <p style="color: #ef4444;">* Vì lý do bảo mật, vui lòng tiến hành đăng nhập và đổi lại mật khẩu cá nhân ngay trong lần đầu tiên sử dụng hệ thống.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center;">Đây là thư gửi từ Ban quản trị TopCV Clone.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Lỗi gửi email cấp tài khoản:", mailError);
      // Vẫn trả về 201 vì account đã tạo thành công trong DB, nhưng báo thêm log
    }

    return NextResponse.json({
      message: "Cấp tài khoản Manager thành công và đã gửi mail thông báo!",
      managerId: newManager._id
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}