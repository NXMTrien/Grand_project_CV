import { NextResponse } from "next/server";
import connectDB from "@/src/lib/mongodb";
import { getAuthPayload } from "@/src/lib/auth";
import Resume from "@/src/models/Resume";
import User from "@/src/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 1. Lấy ID Ứng viên từ Header x-candidate-id hoặc JWT Bearer
    let candidateId: string | null = req.headers.get("x-candidate-id");
    if (!candidateId) {
      const auth = getAuthPayload(req.headers);
      candidateId = auth?.role === "CANDIDATE" && auth.userId ? auth.userId : null;
    }

    if (!candidateId) {
      return NextResponse.json(
        { message: "Yêu cầu bị từ chối. Thiếu thông tin định danh Ứng viên (x-candidate-id) hoặc token hợp lệ!" },
        { status: 401 }
      );
    }

    // Xác thực người dùng trong DB xem có tồn tại và đúng role CANDIDATE không
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== "CANDIDATE") {
      return NextResponse.json(
        { message: "Bạn không có quyền truy cập. Chỉ tài khoản CANDIDATE mới được tạo CV!" },
        { status: 403 }
      );
    }

    // 2. Nhận dữ liệu CV từ body gửi lên
    const { title, type, fileUrl, cvData, templateName, isPublic } = await req.json();

    if (!title) {
      return NextResponse.json({ message: "Vui lòng nhập tiêu đề CV (title)" }, { status: 400 });
    }

    // Chuẩn hóa cấu trúc cvData từ body để phù hợp với frontend hiện tại
    const formattedCvData = {
      fullName: cvData?.fullName || "",
      avatar: cvData?.avatar || "",
      phone: cvData?.phone || "",
      email: cvData?.email || "",
      address: cvData?.address || "",
      targetPosition: cvData?.targetPosition || "",
      summary: cvData?.summary || "",
      technicalSkills: cvData?.technicalSkills || "",
      softSkills: cvData?.softSkills || "",
      education: Array.isArray(cvData?.education) ? cvData.education : cvData?.education ? [cvData.education] : [],
      experience: Array.isArray(cvData?.experience) ? cvData.experience : cvData?.experience ? [cvData.experience] : [],
      skills: Array.isArray(cvData?.skills)
        ? cvData.skills
        : typeof cvData?.technicalSkills === "string"
        ? cvData.technicalSkills.split(",").map((skill: string) => skill.trim()).filter(Boolean)
        : [],
      projects: Array.isArray(cvData?.projects) ? cvData.projects : []
    };

    // 3. Tiến hành Lưu hoặc Cập nhật nếu trùng bộ đôi (candidateId + title)
    const updatedResume = await Resume.findOneAndUpdate(
      { candidateId: candidateId, title: title }, // Tìm CV cũ cùng tên của user này
      {
        candidateId: candidateId,
        title,
        type: type || "ONLINE",
        fileUrl: fileUrl || "",
        cvData: formattedCvData,
        templateName: templateName || "default-theme",
        isPublic: isPublic !== undefined ? isPublic : true
      },
      { new: true, upsert: true, runValidators: true } // Chưa có tự tạo mới (upsert)
    );

    return NextResponse.json({
      message: "Lưu thông tin CV thành công!",
      resumeId: updatedResume._id,
      resume: updatedResume
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi hệ thống", error: error.message }, { status: 500 });
  }
}