import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import User from "@/src/models/User";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// Cấu hình bộ gửi mail (Transporter) sử dụng biến môi trường
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: false, // false cho cổng 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password của Gmail
  },
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const { action, email, otpCode, newPassword } = await req.json();

    // --- BƯỚC 1: NGƯỜI DÙNG NHẬP EMAIL ĐỂ NHẬN OTP ---
    if (action === "REQUEST_OTP") {
      if (!email) {
        return NextResponse.json({ message: "Vui lòng nhập Email" }, { status: 400 });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ message: "Email không tồn tại trong hệ thống" }, { status: 404 });
      }

      // Tạo mã OTP 6 số ngẫu nhiên
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

      user.otpCode = generatedOTP;
      user.otpExpires = expires;
      await user.save();

      // Thực hiện gửi Email thực tế chứa OTP
      try {
        await transporter.sendMail({
          from: `"TopCV Support" <${process.env.EMAIL_USER}>`, // Tiêu đề người gửi
          to: email, // Email người nhận
          subject: "[TopCV Clone] - Mã Xác Thực Đặt Lại Mật Khẩu", 
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 5px;">
              <h2 style="color: #22c55e; text-align: center;">Khôi Phục Mật Khẩu</h2>
              <p>Chào bạn,</p>
              <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản trên hệ thống tuyển dụng <strong>TopCV Clone</strong>.</p>
              <p>Mã OTP xác thực của bạn là:</p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #1e293b; background: #f1f5f9; padding: 10px 20px; border-radius: 5px; letter-spacing: 2px;">
                  ${generatedOTP}
                </span>
              </div>
              <p style="color: #ef4444;">* Lưu ý: Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong> và chỉ sử dụng được 1 lần.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b; text-align: center;">Đây là email tự động, vui lòng không phản hồi lại email này.</p>
            </div>
          `,
        });
      } catch (mailError: any) {
        console.error("Lỗi gửi Email:", mailError);
        return NextResponse.json({ message: "Không thể gửi email OTP, vui lòng thử lại sau" }, { status: 500 });
      }

      return NextResponse.json({ message: "Mã OTP đã được gửi tới email của bạn!" }, { status: 200 });
    }

    // --- BƯỚC 2: NHẬP OTP VÀ ĐỔI MẬT KHẨU MỚI ---
    if (action === "RESET_PASSWORD") {
      if (!email || !otpCode || !newPassword) {
        return NextResponse.json({ message: "Thiếu dữ liệu xác thực" }, { status: 400 });
      }

      const user = await User.findOne({ email });
      if (!user || user.otpCode !== otpCode) {
        return NextResponse.json({ message: "Mã OTP không chính xác" }, { status: 400 });
      }

      // Kiểm tra OTP hết hạn chưa
      if (new Date() > new Date(user.otpExpires)) {
        return NextResponse.json({ message: "Mã OTP đã hết hạn" }, { status: 400 });
      }

      // OTP đúng -> Tiến hành đổi và hash mật khẩu mới
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      
      // Xóa OTP sau khi dùng xong
      user.otpCode = null;
      user.otpExpires = null;
      await user.save();

      return NextResponse.json({ message: "Đặt lại mật khẩu thành công!" }, { status: 200 });
    }

    return NextResponse.json({ message: "Hành động không hợp lệ" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}