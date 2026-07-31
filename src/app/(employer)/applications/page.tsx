"use client";

import { useEffect, useState } from "react";

interface ResumeData {
  _id: string;
  title: string;
  type: "ONLINE" | "ATTACHMENT";
  fileUrl?: string;
  cvData?: {
    fullName?: string;
    avatar?: string;
    phone?: string;
    email?: string;
    address?: string;
    targetPosition?: string;
    summary?: string;
    technicalSkills?: string;
    softSkills?: string;
    education?: Array<{ school?: string; major?: string; details?: string }>;
    experience?: Array<{ company?: string; position?: string; details?: string }>;
  };
}

interface ApplicationItem {
  _id: string;
  coverLetter?: string;
  status: "SENT" | "REVIEWING" | "INTERVIEW" | "REJECTED";
  createdAt: string;
  jobId?: { _id: string; title: string; location?: string };
  userId?: { _id: string; fullName: string; email: string; phone?: string };
  resumeId?: ResumeData;
}

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // State cho Modal xem thông tin CV Online & Cover Letter
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập tài khoản Nhà tuyển dụng");

      const res = await fetch("/api/employer/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể tải danh sách ứng viên");

      setApplications(data.data || []);
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employer/applications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      setApplications((prev) =>
        prev.map((item) =>
          item._id === applicationId ? { ...item, status: newStatus as any } : item
        )
      );
    } catch (err: any) {
      alert(err.message || "Lỗi khi đổi trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REVIEWING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "INTERVIEW":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Hồ sơ Ứng tuyển</h1>
            <p className="text-sm text-gray-500 mt-1">
              Danh sách ứng viên nộp bài theo cả dạng CV Đính kèm & CV Online.
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200 text-sm">
            {applications.length} Hồ sơ
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium">Đang tải hồ sơ...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600 font-semibold">Chưa có ứng viên nào nộp hồ sơ 🎉</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="p-4">Ứng viên</th>
                    <th className="p-4">Vị trí ứng tuyển</th>
                    <th className="p-4">CV / Hồ sơ</th>
                    <th className="p-4">Ngày nộp</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {applications.map((item) => {
                    const resume = item.resumeId;
                    return (
                      <tr key={item._id} className="hover:bg-gray-50 transition">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{item.userId?.fullName || "Chưa rõ"}</p>
                          <p className="text-xs text-gray-500">{item.userId?.email}</p>
                          {item.userId?.phone && (
                            <p className="text-xs text-gray-400">📞 {item.userId.phone}</p>
                          )}
                        </td>

                        <td className="p-4">
                          <p className="font-semibold text-emerald-600">
                            {item.jobId?.title || "Công việc đã xóa"}
                          </p>
                          <p className="text-xs text-gray-400">{item.jobId?.location}</p>
                        </td>

                        {/* Cột CV Phân loại Đính kèm / Online */}
                        <td className="p-4">
                          {!resume ? (
                            <span className="text-xs text-rose-500 font-medium">CV bị xóa</span>
                          ) : resume.type === "ATTACHMENT" && resume.fileUrl ? (
                            <a
                              href={resume.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium px-2.5 py-1.5 rounded inline-flex items-center gap-1 transition shadow-sm"
                            >
                              📄 Xem File PDF ({resume.title})
                            </a>
                          ) : (
                            <button
                              onClick={() => setSelectedApp(item)}
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium px-2.5 py-1.5 rounded inline-flex items-center gap-1 transition shadow-sm"
                            >
                              🌐 Xem CV Online ({resume.title})
                            </button>
                          )}
                        </td>

                        <td className="p-4 text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </td>

                        <td className="p-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <select
                            value={item.status}
                            disabled={updatingId === item._id}
                            onChange={(e) => handleStatusChange(item._id, e.target.value)}
                            className="text-xs border rounded-lg p-1.5 outline-none bg-white shadow-sm font-medium focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="SENT">SENT (Mới nộp)</option>
                            <option value="REVIEWING">REVIEWING (Đang duyệt)</option>
                            <option value="INTERVIEW">INTERVIEW (Mời phỏng vấn)</option>
                            <option value="REJECTED">REJECTED (Từ chối)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🔍 MODAL XEM CHI TIẾT CV ONLINE */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-bold text-gray-800">
                  CV Online: {selectedApp.resumeId?.title}
                </h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {selectedApp.coverLetter && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <h4 className="font-bold text-amber-800 text-sm mb-1">Thư xin việc (Cover Letter):</h4>
                  <p className="text-sm text-amber-900 whitespace-pre-line">{selectedApp.coverLetter}</p>
                </div>
              )}

              {selectedApp.resumeId?.cvData ? (
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {selectedApp.resumeId.cvData.fullName || selectedApp.userId?.fullName}
                    </p>
                    <p className="text-emerald-600 font-semibold">
                      {selectedApp.resumeId.cvData.targetPosition}
                    </p>
                    <p className="text-xs text-gray-500">
                      📧 {selectedApp.resumeId.cvData.email || selectedApp.userId?.email} | 📞{" "}
                      {selectedApp.resumeId.cvData.phone || selectedApp.userId?.phone}
                    </p>
                  </div>

                  <hr />

                  {selectedApp.resumeId.cvData.summary && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Mục tiêu nghề nghiệp:</h4>
                      <p className="text-gray-600">{selectedApp.resumeId.cvData.summary}</p>
                    </div>
                  )}

                  {selectedApp.resumeId.cvData.technicalSkills && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Kỹ năng chuyên môn:</h4>
                      <p className="text-gray-600">{selectedApp.resumeId.cvData.technicalSkills}</p>
                    </div>
                  )}

                  {selectedApp.resumeId.cvData.experience && selectedApp.resumeId.cvData.experience.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Kinh nghiệm làm việc:</h4>
                      <div className="space-y-2">
                        {selectedApp.resumeId.cvData.experience.map((exp, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg border">
                            <p className="font-semibold text-gray-900">{exp.position} - {exp.company}</p>
                            <p className="text-xs text-gray-600 mt-1">{exp.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Chưa cập nhật chi tiết CV.</p>
              )}

              <div className="text-right border-t pt-4">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 font-bold rounded-lg text-sm text-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}