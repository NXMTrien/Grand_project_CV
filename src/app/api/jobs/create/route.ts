import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Job from "@/src/models/Job";
import User from "@/src/models/User";

// Hàm tiện ích tự động tạo slug từ tiêu đề tin tuyển dụng
function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // 1. Lấy thông tin người đăng từ Header x-manager-id
    const managerId = req.headers.get("x-manager-id");
    if (!managerId) {
      return NextResponse.json(
        { message: "Yêu cầu bị từ chối. Thiếu thông tin định danh Manager (x-manager-id)!" },
        { status: 401 }
      );
    }

    // Xác thực tài khoản trong DB xem có đúng là MANAGER không
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Bạn không có quyền truy cập. Chỉ tài khoản MANAGER mới được đăng tin tuyển dụng!" },
        { status: 403 }
      );
    }

    // 2. Nhận dữ liệu từ JSON Body của Postman gửi lên
    const { 
      title, 
      companyId, 
      categoryId, 
      description, 
      requirements, 
      benefits, 
      location, 
      salaryMin, 
      salaryMax, 
      experience, 
      jobType, 
      deadline 
    } = await req.json();

    // 3. Kiểm tra nghiêm ngặt các trường REQUIRED theo đúng Schema của bạn
    if (!title || !companyId || !categoryId || !description || !requirements || !benefits || !location || !experience || !deadline) {
      return NextResponse.json(
        { message: "Thiếu thông tin bắt buộc! Vui lòng điền đầy đủ các trường yêu cầu của tin tuyển dụng." }, 
        { status: 400 }
      );
    }

    // Tự động tạo slug từ title công việc
    const slug = `${slugify(title)}-${Math.random().toString(36).slice(-4)}`;

    // 4. Tiến hành tạo mới bản ghi Job vào MongoDB
    const newJob = await Job.create({
      title,
      slug,
      companyId,
      categoryId,
      managerId, // Gắn ID người đăng tin lấy từ Header vào
      description,
      requirements,
      benefits,
      location,
      salaryMin: salaryMin || 0,
      salaryMax: salaryMax || 0,
      experience,
      jobType: jobType || "Full-time",
      status: "PENDING", // Mặc định chờ Admin duyệt
      views: 0,
      deadline: new Date(deadline) // Định dạng ngày tháng hợp lệ
    });

    return NextResponse.json(
      { message: "Đăng tin tuyển dụng thành công! Tin của bạn đang chờ hệ thống kiểm duyệt.", jobId: newJob._id }, 
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi hệ thống", error: error.message }, { status: 500 });
  }
}