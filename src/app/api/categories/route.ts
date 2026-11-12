import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Category from "@/src/models/Category";
import jwt from "jsonwebtoken";

// Hàm tiện ích tạo slug từ tên Tiếng Việt
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

    // 1. Kiểm tra Token từ Header Authorization (Bearer <token>)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Yêu cầu bị từ chối. Vui lòng đăng nhập lại!" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "YourSecretKey");
    } catch (err) {
      return NextResponse.json(
        { message: "Token không hợp lệ hoặc đã hết hạn!" },
        { status: 401 }
      );
    }

    // Kiểm tra quyền ADMIN từ payload của Token
    if (decoded?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { message: "Bạn không có quyền ADMIN để tạo danh mục!" },
        { status: 403 }
      );
    }

    // 2. Đọc thông tin từ body
    const { name, skills } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Tên danh mục ngành nghề (name) là bắt buộc" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    // 3. Kiểm tra xem danh mục hoặc slug đã tồn tại chưa
    const categoryExists = await Category.findOne({
      $or: [{ name: name.trim() }, { slug }],
    });

    if (categoryExists) {
      return NextResponse.json(
        { message: "Danh mục ngành nghề hoặc đường dẫn (slug) này đã tồn tại!" },
        { status: 400 }
      );
    }

    // 4. Lưu danh mục mới vào MongoDB
    const newCategory = await Category.create({
      name: name.trim(),
      slug,
      skills: Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : [],
    });

    return NextResponse.json(
      { message: "Tạo danh mục ngành nghề thành công!", category: newCategory },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Lỗi Server", error: error.message },
      { status: 500 }
    );
  }
}

// API GET: Lấy toàn bộ danh sách ngành nghề
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Lỗi Server", error: error.message },
      { status: 500 }
    );
  }
}