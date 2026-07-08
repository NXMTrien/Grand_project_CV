"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Resume {
  id: string;
  title: string;
  updatedAt: string;
  isPublic: boolean;
}

export default function MyResumesPage() {
  const [resumes, setResumes] =useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Giả lập Fetch danh sách CV từ API về (sau này bạn viết thêm API GET /api/resume/my-list)
  useEffect(() => {
    // Đoạn này mockup data để bạn hình dung giao diện quản lý nhiều CV
    const mockResumes = [
      { id: "1", title: "CV Kỹ Sư Phần Mềm Next.js", updatedAt: "08/07/2026", isPublic: true },
      { id: "2", title: "CV Lập Trình Viên Node.js Backend", updatedAt: "05/07/2026", isPublic: false },
      { id: "3", title: "CV Chuyên Viên Tư Vấn Giải Pháp", updatedAt: "01/07/2026", isPublic: true }
    ];
    setResumes(mockResumes);
    setLoading(false);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý CV của bạn</h1>
          <p className="text-sm text-gray-500">Bạn có thể tạo nhiều CV khác nhau để ứng tuyển các vị trí phù hợp</p>
        </div>
        <Link href="/resume" className="bg-green-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-600 transition text-sm shadow-sm">
          + Tạo CV mới
        </Link>
      </div>

      {loading ? (
        <p>Đang tải danh sách CV...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resumes.map((cv: any) => (
            <div key={cv.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                {/* Icon tờ giấy đại diện cho CV */}
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-1">{cv.title}</h3>
                <p className="text-xs text-gray-400 mb-4">Cập nhật lần cuối: {cv.updatedAt}</p>
              </div>

              <div className="flex items-center justify-between border-t pt-4 mt-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cv.isPublic ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
                  {cv.isPublic ? "Đang công khai" : "Bản nháp"}
                </span>
                <div className="flex space-x-2 text-xs">
                  <button className="text-blue-600 hover:underline font-semibold">Sửa</button>
                  <button className="text-red-500 hover:underline font-semibold">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}