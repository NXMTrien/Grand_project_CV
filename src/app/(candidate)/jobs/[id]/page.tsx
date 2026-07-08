"use client";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function JobDetailPage() {
  const { id } = useParams();
  const [isApplied, setIsApplied] = useState(false);

  // Demo dữ liệu bài tuyển dụng lấy từ ID bài đăng
  const job = {
    title: "Lập trình viên Next.js (Sên-nờ)",
    company: "Công nghệ Grand Tech",
    salary: "20 - 35 triệu",
    location: "Hà Nội (Hybrid)",
    description: "Tham gia phát triển hệ thống lõi thương mại điện tử thế hệ mới...",
    requirements: "Thành thạo React, Next.js App Router, tối ưu SEO tốt.",
  };

  const handleApply = async () => {
    // Gọi API POST `/api/jobs/${id}/apply`
    setIsApplied(true);
    alert("Nộp CV ứng tuyển thành công!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 my-8 grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
          <p className="text-xl text-green-600 font-semibold mt-2">{job.company}</p>
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
      </div>

      <div className="bg-white p-6 rounded-lg shadow h-fit space-y-4">
        <h3 className="font-bold text-lg border-b pb-2">Thông tin chung</h3>
        <p><strong>Mức lương:</strong> {job.salary}</p>
        <p><strong>Địa điểm:</strong> {job.location}</p>
        
        <button
          onClick={handleApply}
          disabled={isApplied}
          className={`w-full py-3 text-center text-white font-bold rounded-lg transition ${
            isApplied ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isApplied ? "Đã nộp CV ứng tuyển" : "Ứng tuyển ngay"}
        </button>
      </div>
    </div>
  );
}