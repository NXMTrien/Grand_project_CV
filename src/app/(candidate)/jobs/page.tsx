"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 👈 Thêm router

interface JobItem {
  _id: string;
  title: string;
  companyId?: {
    name?: string;
  };
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  description?: string;
  requirements?: string;
}

interface ResumeItem {
  _id: string;
  title: string;
}

export default function JobsPage() {
  const router = useRouter(); // 👈 Khởi tạo router
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [search, setSearch] = useState("");
  const [myResumes, setMyResumes] = useState<ResumeItem[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // STATE QUẢN LÝ MODAL & FORM ỨNG TUYỂN
  const [applyJob, setApplyJob] = useState<JobItem | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [selfIntroduction, setSelfIntroduction] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchResumes();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được danh sách việc làm");
      
      const jobList = data.data || [];
      setJobs(jobList);
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi tải việc làm");
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
      if (!res.ok) throw new Error(data.message || "Không tải được danh sách CV");
      
      const list = data.data || [];
      setMyResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0]._id);
      }
    } catch (err: any) {
      console.error("fetchResumes error", err);
    }
  };

  const handleOpenApplyModal = (job: JobItem) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập trước khi ứng tuyển!");
      return;
    }

    setApplyJob(job);
    setTargetPosition(job.title || "");
  };

  const handleSubmitApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applyJob) return;
    if (!selectedResumeId) {
      alert("Vui lòng chọn 1 chiếc CV phù hợp!");
      return;
    }

    setIsApplying(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập trước khi ứng tuyển");

      const formattedCoverLetter = `Vị trí ứng tuyển: ${targetPosition}\n\nLời giới thiệu:\n${selfIntroduction}`;

      const res = await fetch(`/api/jobs/${applyJob._id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          coverLetter: formattedCoverLetter.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ứng tuyển thất bại");

      alert(data.message || "Ứng tuyển thành công!");
      setApplyJob(null);
      setSelfIntroduction("");
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi ứng tuyển");
    } finally {
      setIsApplying(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const title = job.title?.toLowerCase() || "";
    const company = job.companyId?.name?.toLowerCase() || "";
    return title.includes(search.toLowerCase()) || company.includes(search.toLowerCase());
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "32px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        {/* THANH TÌM KIẾM */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm vị trí công việc, tên công ty..."
            style={{
              flex: "1 1 300px",
              padding: "10px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            style={{
              backgroundColor: "#10b981",
              color: "#ffffff",
              padding: "10px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
            }}
          >
            Tìm kiếm
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              marginBottom: "24px",
              padding: "14px",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {errorMessage}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: 0,
            }}
          >
            Cơ hội việc làm ({filteredJobs.length})
          </h2>
        </div>

        {/* DANH SÁCH CÔNG VIỆC */}
        {filteredJobs.length === 0 ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px dashed #cbd5e1",
              padding: "48px 16px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#475569", fontSize: "15px", fontWeight: "500", margin: 0 }}>
              Không tìm thấy công việc phù hợp
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1e293b",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {job.title}
                  </h3>

                  <p style={{ fontSize: "13px", color: "#64748b", marginTop: "6px", marginBottom: 0, fontWeight: "500" }}>
                    {job.companyId?.name || "Công ty chưa rõ"}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", fontSize: "12px" }}>
                    <span
                      style={{
                        color: "#047857",
                        fontWeight: "600",
                        backgroundColor: "#ecfdf5",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        border: "1px solid #a7f3d0",
                      }}
                    >
                      {job.salaryMin && job.salaryMax ? `${job.salaryMin} - ${job.salaryMax} triệu` : "Thỏa thuận"}
                    </span>

                    <span
                      style={{
                        color: "#475569",
                        backgroundColor: "#f1f5f9",
                        padding: "3px 10px",
                        borderRadius: "6px",
                      }}
                    >
                      {job.location || "Chưa xác định"}
                    </span>
                  </div>
                </div>

                {/* THANH THAO TÁC CỦA THẺ CÔNG VIỆC */}
                <div style={{ display: "flex", gap: "10px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  {/* 🔴 CHUYỂN HƯỚNG TỚI TRANG DETAIL /jobs/[id] */}
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/${job._id}`)}
                    style={{
                      flex: 1,
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      padding: "9px 0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    Xem chi tiết
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenApplyModal(job)}
                    style={{
                      flex: 1,
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      padding: "9px 0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "center",
                      boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    Ứng tuyển ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POPUP FORM MODAL ỨNG TUYỂN */}
      {applyJob && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                  Nộp hồ sơ ứng tuyển
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                  {applyJob.title} - {applyJob.companyId?.name || "Công ty"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyJob(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApply} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Vị trí mong muốn ứng tuyển <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Frontend Developer..."
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Chọn CV từ tài khoản <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {myResumes.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#ef4444", backgroundColor: "#fef2f2", padding: "8px", borderRadius: "6px", margin: 0 }}>
                    Bạn chưa tạo CV nào trong tài khoản. Vui lòng tạo CV trước.
                  </p>
                ) : (
                  <select
                    required
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      outline: "none",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box",
                    }}
                  >
                    {myResumes.map((cv) => (
                      <option key={cv._id} value={cv._id}>
                        📄 {cv.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Thư giới thiệu / Lời nhắn tới Nhà tuyển dụng
                </label>
                <textarea
                  rows={4}
                  placeholder="Giới thiệu ngắn gọn về bản thân..."
                  value={selfIntroduction}
                  onChange={(e) => setSelfIntroduction(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setApplyJob(null)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isApplying || myResumes.length === 0}
                  style={{
                    backgroundColor: isApplying || myResumes.length === 0 ? "#cbd5e1" : "#10b981",
                    color: "#ffffff",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    cursor: isApplying || myResumes.length === 0 ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  {isApplying ? "Đang gửi..." : "Gửi hồ sơ ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}