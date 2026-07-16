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
    
    // 1. LẤY API KEY TỪ HEADER "x-admin-api-key"
    const adminApiKey = req.headers.get("x-admin-api-key");

    // Lấy API Key hệ thống cấu hình trong file .env.local 
    // Nếu chưa cấu hình .env.local, mặc định sẽ dùng "GrandJobSecret2026" để test nhanh
    const systemAdminKey = process.env.ADMIN_API_KEY || "GrandJobSecret2026";

    // Kiểm tra tính hợp lệ của API Key gửi lên
    if (!adminApiKey || adminApiKey !== systemAdminKey) {
      return NextResponse.json(
        { message: "Yêu cầu bị từ chối. API Key quản trị viên không hợp lệ hoặc thiếu!" }, 
        { status: 403 }
      );
    }

    // 2. ĐỌC DỮ LIỆU TỪ BODY (Không cần adminId nữa)
    const { email, fullName, dateOfBirth, companyId } = await req.json();

    // Kiểm tra thông tin bắt buộc
    if (!email || !fullName || !dateOfBirth) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // 3. KIỂM TRA TÀI KHOẢN TỒN TẠI CHƯA
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "Email này đã được sử dụng trên hệ thống" }, { status: 400 });
    }

    // 4. TẠO MẬT KHẨU NGẪU NHIÊN VÀ HASH
    const randomPassword = Math.random().toString(36).slice(-8) + "A1!"; 
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // 5. LƯU VÀO DATABASE VỚI QUYỀN MANAGER
    const newManager = await User.create({
      email,
      password: hashedPassword,
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      role: "MANAGER",
      companyId: companyId || null,
      isVerified: true 
    });

    // 6. GỬI EMAIL THÔNG BÁO CẤP TÀI KHOẢN
    try {
      await transporter.sendMail({
        from: `"GrandJob Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "[GrandJob] - Thông báo cấp tài khoản Nhà tuyển dụng",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #10b981; text-align: center;">Tài Khoản Nhà Tuyển Dụng Đã Được Khởi Tạo</h2>
            <p>Xin chào <strong>${fullName}</strong>,</p>
            <p>Quản trị viên hệ thống GrandJob đã cấp tài khoản truy cập dành cho Nhà tuyển dụng/Quản lý cho bạn.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Trang đăng nhập:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">Click vào đây để đến trang đăng nhập</a></p>
              <p style="margin: 5px 0;"><strong>Tài khoản (Email):</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <span style="color: #ef4444; font-weight: bold;">${randomPassword}</span></p>
            </div>

            <p style="color: #ef4444;">* Vì lý do bảo mật, vui lòng tiến hành đăng nhập và đổi lại mật khẩu cá nhân ngay trong lần đầu tiên sử dụng hệ thống.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center;">Đây là thư gửi từ Ban quản trị GrandJob.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Lỗi gửi email cấp tài khoản:", mailError);
    }

    return NextResponse.json({
      message: "Cấp tài khoản Manager thành công và đã gửi mail thông báo!",
      managerId: newManager._id
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}