import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Company from "@/src/models/Company";
import User from "@/src/models/User";

// ==========================================
// 🏢 API POST: TẠO MỚI CÔNG TY (MANAGER ONLY)
// ==========================================
export async function POST(req: Request) {
  try {
    await connectDB();

    // 1. Lấy Manager ID từ Header (Để test Postman giả lập người dùng đang đăng nhập)
    const managerId = req.headers.get("x-manager-id");
    
    if (!managerId) {
      return NextResponse.json(
        { message: "Yêu cầu bị từ chối. Thiếu thông tin định danh Manager (x-manager-id)!" },
        { status: 401 }
      );
    }

    // 2. Xác thực tài khoản trong DB xem có đúng là MANAGER không
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Bạn không có quyền truy cập. Chỉ tài khoản MANAGER mới được tạo công ty!" },
        { status: 403 }
      );
    }

    // 3. ⛔ KIỂM TRA GIỚI HẠN: Đếm số lượng công ty Manager này đã tạo thực tế trong DB
    const companyCount = await Company.countDocuments({ createdBy: managerId });

    if (companyCount >= 2) {
      return NextResponse.json(
        { message: "Tạo công ty thất bại! Mỗi nhà tuyển dụng (Manager) chỉ được phép tạo tối đa 2 công ty." },
        { status: 400 }
      );
    }

    // 4. Đọc thông tin công ty từ Body gửi lên
    const { name, logo, website, address, scale, description, images } = await req.json();

    // Kiểm tra nghiêm ngặt tất cả các trường BẮT BUỘC theo Schema hiện tại
    if (!name || !address || !description) {
      return NextResponse.json(
        { message: "Tên công ty (name), địa chỉ (address) và mô tả (description) là bắt buộc!" }, 
        { status: 400 }
      );
    }

    // 5. Tiến hành tạo mới công ty gắn liền với ID của Manager đó
    const newCompany = await Company.create({
      name,
      logo: logo || "",
      website: website || "",
      address,
      scale: scale || "10-50 nhân viên", // Giá trị mặc định nếu client bỏ trống
      description,
      images: Array.isArray(images) ? images : [], // Đảm bảo luôn là một mảng
      isVerified: false, // Mặc định chờ Admin phê duyệt kiểm tra
      createdBy: managerId // Lưu thông tin Object ID người tạo để kích hoạt hàm đếm giới hạn
    });

    // 6. Cập nhật ID công ty mới nhất này vào User profile của Manager (nếu hệ thống của bạn cần tracking)
    await User.findByIdAndUpdate(managerId, {
      $set: { companyId: newCompany._id }
    });

    return NextResponse.json(
      { message: "Tạo công ty thành công!", company: newCompany },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}

// ==========================================
// 🏢 API GET: LẤY TOÀN BỘ CÔNG TY (AI CŨNG XEM ĐƯỢC)
// ==========================================
export async function GET() {
  try {
    await connectDB();
    // Lấy danh sách công ty và populate thông tin cơ bản của Manager tạo ra nó (nếu cần)
    const companies = await Company.find({}).populate("createdBy", "fullName email");
    return NextResponse.json(companies, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}