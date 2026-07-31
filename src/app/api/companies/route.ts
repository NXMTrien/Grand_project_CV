import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Company from "@/src/models/Company";
import User from "@/src/models/User";
import jwt from "jsonwebtoken";

// Hàm bổ trợ lấy thông tin user từ JWT Token
async function authenticateManager(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Không tìm thấy Token xác thực!", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Tìm user và kiểm tra tài khoản
    const manager = await User.findById(decoded.userId);
    if (!manager) {
      return { error: "Người dùng không tồn tại!", status: 404 };
    }

    if (manager.isBlocked) {
      return { 
        error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ QUẢN TRỊ VIÊN!", 
        status: 403 
      };
    }

    if (manager.role !== "MANAGER") {
      return { 
        error: "Bạn không có quyền truy cập. Chỉ tài khoản MANAGER mới được tạo công ty!", 
        status: 403 
      };
    }

    return { manager };
  } catch (err) {
    return { error: "Token không hợp lệ hoặc đã hết hạn!", status: 401 };
  }
}

// ==========================================
// 🏢 API POST: TẠO MỚI CÔNG TY (MANAGER ONLY)
// ==========================================
export async function POST(req: Request) {
  try {
    await connectDB();

    // 1. Xác thực người dùng qua JWT Token
    const authResult = await authenticateManager(req);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const manager = authResult.manager!;
    const managerId = manager._id;

    // 2. Kiểm tra giới hạn tạo công ty (Tối đa 2 công ty)
    const companyCount = await Company.countDocuments({ createdBy: managerId });
    if (companyCount >= 2) {
      return NextResponse.json(
        { message: "Tạo công ty thất bại! Mỗi nhà tuyển dụng (Manager) chỉ được phép tạo tối đa 2 công ty." },
        { status: 400 }
      );
    }

    // 3. Đọc dữ liệu gửi lên
    const { name, logo, website, address, scale, description, images } = await req.json();

    if (!name || !address || !description) {
      return NextResponse.json(
        { message: "Tên công ty (name), địa chỉ (address) và mô tả (description) là bắt buộc!" },
        { status: 400 }
      );
    }

    // 4. Tạo mới công ty
    const newCompany = await Company.create({
      name,
      logo: logo || "",
      website: website || "",
      address,
      scale: scale || "10-50 nhân viên",
      description,
      images: Array.isArray(images) ? images : [],
      isVerified: false,
      createdBy: managerId,
    });

    // 5. Cập nhật ID công ty mới nhất vào thông tin Manager
    await User.findByIdAndUpdate(managerId, {
      $set: { companyId: newCompany._id },
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
// 🏢 API GET: LẤY TOÀN BỘ CÔNG TY (PUBLIC)
// ==========================================
export async function GET() {
  try {
    await connectDB();
    const companies = await Company.find({}).populate("createdBy", "fullName email");
    return NextResponse.json(companies, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}