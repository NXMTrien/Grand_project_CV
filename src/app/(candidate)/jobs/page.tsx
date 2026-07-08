"use client";
import { useState, useEffect } from "react";

interface JobItem {
  _id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  description: string;
  requirements: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  
  // State phục vụ việc nộp CV
  const [myResumes, setMyResumes] = useState<{id: string, title: string}[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    // 1. Giả lập gọi API lấy danh sách công việc công khai
    const mockJobs: JobItem[] = [
      { _id: "j1", title: "Frontend Developer (ReactJS/Next.js)", company: "Tập đoàn Công nghệ NextGen", salary: "18 - 28 triệu", location: "TP. Hồ Chí Minh", description: "Xây dựng các module thương mại điện tử...", requirements: "Tối thiểu 1 năm kinh nghiệm làm việc với ReactJS." },
      { _id: "j2", title: "Node.js Backend Engineer", company: "VinaTech Solutions", salary: "Thỏa thuận", location: "Hà Nội", description: "Thiết kế kiến trúc hệ thống Microservices...", requirements: "Thành thạo Express/NestJS, am hiểu MongoDB." }
    ];
    setJobs(mockJobs);
    if(mockJobs.length > 0) setSelectedJob(mockJobs[0]);

    // 2. Giả lập lấy danh sách CV hiện có của Ứng viên này để đưa vào hộp lựa chọn (Dropdown Apply)
    setMyResumes([
      { id: "cv_1", title: "CV Kỹ Sư Phần Mềm Next.js" },
      { id: "cv_2", title: "CV Lập Trình Viên Node.js Backend" }
    ]);
  }, []);

  const handleApply = async () => {
    if (!selectedResumeId) {
      alert("Vui lòng chọn 1 chiếc CV phù hợp để nộp bài!");
      return;
    }
    setIsApplying(true);
    
    // Giả lập gửi request nộp hồ sơ lên server
    setTimeout(() => {
      alert(`🎉 Nộp hồ sơ thành công! CV [${myResumes.find(c => c.id === selectedResumeId)?.title}] đã được chuyển tới ${selectedJob?.company}`);
      setIsApplying(false);
      setSelectedResumeId("");
    }, 1200);
  };

  const filteredJobs = jobs.filter(job => job.title.toLowerCase().includes(search.toLowerCase()) || job.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Thanh tìm kiếm */}
      <div className="bg-white p-4 rounded-xl border mb-6 shadow-sm flex gap-3">
        <input type="text" placeholder="Tìm kiếm vị trí công việc, tên công ty..." className="flex-1 p-2.5 border rounded-lg text-sm outline-none focus:border-green-500" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="bg-green-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition">Tìm kiếm</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* DANH SÁCH BÊN TRÁI */}
        <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Danh sách việc làm phù hợp ({filteredJobs.length})</h2>
          {filteredJobs.map((job) => (
            <div key={job._id} onClick={() => setSelectedJob(job)} className={`p-4 rounded-xl border transition cursor-pointer bg-white ${selectedJob?._id === job._id ? 'border-green-500 bg-green-50/20 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}>
              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{job.title}</h3>
              <p className="text-xs text-gray-600 mt-0.5">{job.company}</p>
              <div className="flex justify-between items-center mt-3 text-xs">
                <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">{job.salary}</span>
                <span className="text-gray-400">📍 {job.location}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CHI TIẾT BÊN PHẢI + CÔNG CỤ NỘP CV */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl shadow-sm p-6 sticky top-24">
          {selectedJob ? (
            <div className="space-y-5 text-sm text-gray-700">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{selectedJob.title}</h1>
                <p className="text-green-600 font-medium">{selectedJob.company}</p>
              </div>

              {/* HỘP NỘP HỒ SƠ NGAY TẠI TRANG CHI TIẾT (CÔNG CỤ NỘP CV) */}
              <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide text-slate-700">Nộp hồ sơ ứng tuyển nhanh</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select className="flex-1 p-2 border rounded-lg bg-white text-xs outline-none" value={selectedResumeId} onChange={e => setSelectedResumeId(e.target.value)}>
                    <option value="">-- Chọn một CV trong kho của bạn --</option>
                    {myResumes.map(cv => (
                      <option key={cv.id} value={cv.id}>{cv.title}</option>
                    ))}
                  </select>
                  <button onClick={handleApply} disabled={isApplying} className="bg-green-500 text-white px-5 py-2 rounded-lg font-bold text-xs hover:bg-green-600 transition disabled:bg-gray-300 whitespace-nowrap">
                    {isApplying ? "Đang gửi hồ sơ..." : "Ứng tuyển ngay"}
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-900 mb-1 text-xs uppercase text-gray-400">Mô tả công việc</h3>
                <p className="whitespace-pre-line text-gray-600 leading-relaxed text-xs">{selectedJob.description}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-xs uppercase text-gray-400">Yêu cầu công việc</h3>
                <p className="whitespace-pre-line text-gray-600 leading-relaxed text-xs">{selectedJob.requirements}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">Chọn một công việc từ danh sách để xem chi tiết</p>
          )}
        </div>
      </div>
    </div>
  );
}