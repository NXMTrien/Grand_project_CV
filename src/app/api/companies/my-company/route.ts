import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import Company from "@/src/models/Company";
import jwt from "jsonwebtoken";

// Helper hàm xác thực Token
function verifyAuthToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Không tìm thấy Token xác thực!", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return { decoded };
  } catch (err) {
    return { error: "Token không hợp lệ hoặc đã hết hạn!", status: 401 };
  }
}

// 1. GET: Lấy danh sách công ty của User hiện tại
export async function GET(req: Request) {
  try {
    await connectDB();

    const auth = verifyAuthToken(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    const myCompanies = await Company.find({ createdBy: auth.decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: myCompanies.length,
        data: myCompanies,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}

// 2. PATCH: Cập nhật thông tin công ty
export async function PATCH(req: Request) {
  try {
    await connectDB();

    const auth = verifyAuthToken(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    // Lấy companyId từ URL Query (?id=xxx)
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("id");

    if (!companyId) {
      return NextResponse.json({ message: "Thiếu ID công ty cần cập nhật!" }, { status: 400 });
    }

    const updateData = await req.json();

    // Tìm và cập nhật công ty (chỉ cho phép nếu đúng người tạo)
    const updatedCompany = await Company.findOneAndUpdate(
      { _id: companyId, createdBy: auth.decoded.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return NextResponse.json(
        { message: "Không tìm thấy công ty hoặc bạn không có quyền chỉnh sửa!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật thông tin công ty thành công!",
        data: updatedCompany,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}

// 3. DELETE: Xóa công ty
export async function DELETE(req: Request) {
  try {
    await connectDB();

    const auth = verifyAuthToken(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    // Lấy companyId từ URL Query (?id=xxx)
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("id");

    if (!companyId) {
      return NextResponse.json({ message: "Thiếu ID công ty cần xóa!" }, { status: 400 });
    }

    // Tìm và xóa công ty (chỉ cho phép nếu đúng người tạo)
    const deletedCompany = await Company.findOneAndDelete({
      _id: companyId,
      createdBy: auth.decoded.userId,
    });

    if (!deletedCompany) {
      return NextResponse.json(
        { message: "Không tìm thấy công ty hoặc bạn không có quyền xóa!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Đã xóa công ty thành công!",
        data: { _id: companyId },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}