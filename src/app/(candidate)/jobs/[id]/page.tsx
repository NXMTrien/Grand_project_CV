"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface JobDetail {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  companyId?: {
    name?: string;
  };
}

interface ResumeItem {
  _id: string;
  title: string;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchJob();
    fetchResumes();
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được thông tin công việc");
      setJob(data.data);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải công việc");
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/resume", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được CV");
      setResumes(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    if (!selectedResumeId) {
      alert("Vui lòng chọn CV để nộp hồ sơ.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập để ứng tuyển");

      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeId: selectedResumeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ứng tuyển thất bại");
      setIsApplied(true);
      alert(data.message || "Ứng tuyển thành công!");
    } catch (err: any) {
      alert(err.message || "Lỗi khi ứng tuyển");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 my-8 grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-6 rounded-lg shadow space-y-6">
        {loading ? (
          <p>Đang tải thông tin công việc...</p>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
        ) : job ? (
          <>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
              <p className="text-xl text-green-600 font-semibold mt-2">{job.companyId?.name || "Công ty chưa rõ"}</p>
            </div>
            <hr />
            <div>
              <h2 className="text-xl font-bold mb-2">Mô tả công việc</h2>
              <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Yêu cầu ứng viên</h2>
              <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
            </div>
          </>
        ) : (
          <p>Không tìm thấy thông tin công việc.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow h-fit space-y-4">
        <h3 className="font-bold text-lg border-b pb-2">Thông tin chung</h3>
        <p><strong>Mức lương:</strong> {job?.salaryMin && job?.salaryMax ? `${job.salaryMin} - ${job.salaryMax} triệu` : "Thỏa thuận"}</p>
        <p><strong>Địa điểm:</strong> {job?.location || "Chưa xác định"}</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn CV ứng tuyển</label>
          <select
            className="w-full p-3 border rounded-lg outline-none"
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
          >
            <option value="">-- Chọn CV --</option>
            {resumes.map((resume) => (
              <option key={resume._id} value={resume._id}>{resume.title}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleApply}
          disabled={isApplied}
          className={`w-full py-3 text-center text-white font-bold rounded-lg transition ${isApplied ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
        >
          {isApplied ? "Đã nộp CV ứng tuyển" : "Ứng tuyển ngay"}
        </button>
      </div>
    </div>
  );
}
