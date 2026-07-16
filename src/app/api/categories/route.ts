import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Category from "@/src/models/Category";

// Hàm tiện ích để tự động tạo slug từ tên Tiếng Việt (Ví dụ: "Công Nghệ Thông Tin" -> "cong-nghe-thong-tin")
function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")                   // Tách các dấu chữ cái tiếng Việt
    .replace(/[\u0300-\u036f]/g, "")    // Xóa các ký tự dấu vừa tách
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")               // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w\-]+/g, "")           // Xóa tất cả các ký tự đặc biệt khác trừ từ ngữ và gạch ngang
    .replace(/\-\-+/g, "-");            // Thay thế nhiều dấu gạch ngang liên tiếp bằng 1 dấu
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // 1. Kiểm tra API Key của Admin từ Header
    const adminApiKey = req.headers.get("x-admin-api-key");
    const systemAdminKey = process.env.ADMIN_API_KEY || "GrandJobSecret2026";

    if (!adminApiKey || adminApiKey !== systemAdminKey) {
      return NextResponse.json(
        { message: "Yêu cầu bị từ chối. Bạn không có quyền ADMIN để tạo danh mục!" },
        { status: 403 }
      );
    }

    // 2. Đọc thông tin từ body theo đúng Schema
    const { name, skills } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Tên danh mục ngành nghề (name) là bắt buộc" }, { status: 400 });
    }

    // Tự động tạo slug từ name để thỏa mãn Schema
    const slug = slugify(name);

    // 3. Kiểm tra xem danh mục hoặc slug này đã tồn tại chưa (Tránh trùng lập)
    const categoryExists = await Category.findOne({ 
      $or: [{ name }, { slug }] 
    });
    
    if (categoryExists) {
      return NextResponse.json(
        { message: "Danh mục ngành nghề hoặc đường dẫn (slug) này đã tồn tại trên hệ thống" }, 
        { status: 400 }
      );
    }

    // 4. Lưu danh mục mới vào MongoDB
    const newCategory = await Category.create({
      name,
      slug,
      skills: Array.isArray(skills) ? skills : [] // Đảm bảo skills luôn là một mảng chuỗi
    });

    return NextResponse.json(
      { message: "Tạo danh mục ngành nghề thành công!", category: newCategory },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}

// API GET: Lấy toàn bộ danh sách ngành nghề đổ ra giao diện
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({});
    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}