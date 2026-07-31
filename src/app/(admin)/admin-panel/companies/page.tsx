"use client";

import { useEffect, useState } from "react";

interface JobItem {
  _id: string;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  status: string;
  createdAt?: string;
  companyId?: {
    name?: string;
    email?: string;
  };
}

export default function AdminPendingJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Tải danh sách công việc chưa duyệt khi vào trang
  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/approve-job");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Không thể tải danh sách bài viết");
      setJobs(data.data || []);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi lấy dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý Duyệt (APPROVED) hoặc Từ chối (REJECTED)
  const handleVerifyJob = async (jobId: string, status: "APPROVED" | "REJECTED") => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc thiếu Token trong localStorage!");
      return;
    }

    const confirmMsg =
      status === "APPROVED"
        ? "Bạn có chắc chắn muốn DUYỆT bài đăng này?"
        : "Bạn có chắc chắn muốn TỪ CHỐI bài đăng này?";

    if (!confirm(confirmMsg)) return;

    setActionLoading(jobId);

    try {
      const res = await fetch("/api/admin/approve-job", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Lấy Token từ localStorage
        },
        body: JSON.stringify({ jobId, status }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      alert(data.message);
      // Loại bỏ bài đăng đã xử lý khỏi danh sách hiển thị
      setJobs((prevJobs) => prevJobs.filter((j) => j._id !== jobId));
    } catch (err: any) {
      alert(err.message || "Lỗi trong quá trình duyệt tin");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Kiểm duyệt bài đăng chưa xác thực
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Danh sách các tin tuyển dụng đang chờ Admin phê duyệt (`PENDING`)
            </p>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">
            {jobs.length} tin chờ duyệt
          </span>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Trạng thái Loading */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium">
            Đang tải danh sách bài viết chưa duyệt...
          </div>
        ) : jobs.length === 0 ? (
          /* Trạng thái trống */
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-600 font-semibold text-base">
              Hiện tại không có tin đăng nào chờ duyệt 🎉
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Tất cả bài tuyển dụng đã được xác thực hoặc từ chối.
            </p>
          </div>
        ) : (
          /* Danh sách tin tuyển dụng */
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
              >
                {/* Header bài đăng */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="inline-block text-[10px] uppercase font-extrabold tracking-wider bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded mb-2">
                      Chờ xác thực
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                    <p className="text-sm font-medium text-emerald-600 mt-0.5">
                      {job.companyId?.name || "Công ty chưa rõ"}{" "}
                      {job.companyId?.email && (
                        <span className="text-slate-400 font-normal">({job.companyId.email})</span>
                      )}
                    </p>
                  </div>

                  {/* Nhãn thông tin lương & vị trí */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">
                      📍 {job.location || "Chưa xác định"}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                      💰 {job.salaryMin && job.salaryMax ? `${job.salaryMin} - ${job.salaryMax} triệu` : "Thỏa thuận"}
                    </span>
                  </div>
                </div>

                {/* Nội dung bài đăng */}
                <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wide mb-1 text-[11px]">
                      Mô tả công việc
                    </h4>
                    <p className="whitespace-pre-line line-clamp-4">
                      {job.description || "Không có thông tin mô tả."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase tracking-wide mb-1 text-[11px]">
                      Yêu cầu ứng viên
                    </h4>
                    <p className="whitespace-pre-line line-clamp-4">
                      {job.requirements || "Không có thông tin yêu cầu."}
                    </p>
                  </div>
                </div>

                {/* Actions: Duyệt / Từ chối */}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleVerifyJob(job._id, "REJECTED")}
                    disabled={actionLoading === job._id}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition border border-red-200 disabled:opacity-50"
                  >
                    {actionLoading === job._id ? "Đang xử lý..." : "Từ chối bài đăng"}
                  </button>
                  <button
                    onClick={() => handleVerifyJob(job._id, "APPROVED")}
                    disabled={actionLoading === job._id}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {actionLoading === job._id ? "Đang xử lý..." : "Duyệt bài đăng"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}