"use client";

import { useState, useEffect } from "react";

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
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [myResumes, setMyResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchResumes();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được danh sách việc làm");
      setJobs(data.data || []);
      if ((data.data || []).length > 0) {
        setSelectedJob(data.data[0]);
      }
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
      setMyResumes(data.data || []);
    } catch (err: any) {
      console.error("fetchResumes error", err);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    if (!selectedResumeId) {
      alert("Vui lòng chọn 1 chiếc CV phù hợp để nộp bài!");
      return;
    }
    setIsApplying(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập trước khi ứng tuyển");

      const res = await fetch(`/api/jobs/${selectedJob._id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeId: selectedResumeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ứng tuyển thất bại");
      alert(data.message || "Ứng tuyển thành công");
      setSelectedResumeId("");
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
        
        {/* THANH TÌM KIẾM TỐI GIẢN */}
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* DANH SÁCH CÔNG VIỆC (CỘT TRÁI) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "82vh",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            <div style={{ paddingBottom: "4px", paddingLeft: "4px" }}>
              <h2
                style={{
                  fontSize: "11px",
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

            {filteredJobs.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px dashed #cbd5e1",
                  padding: "32px",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#475569", fontSize: "14px", fontWeight: "500", margin: 0 }}>
                  Không tìm thấy công việc phù hợp
                </p>
                <p style={{ color: "#94a3b8", fontSize: "11px", marginTop: "4px", margin: 0 }}>
                  Thử thay đổi từ khóa tìm kiếm của bạn xem sao
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?._id === job._id;
                return (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(job)}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#ffffff",
                      border: isSelected ? "1px solid #10b981" : "1px solid #e2e8f0",
                      boxShadow: isSelected ? "0 0 0 1px #10b981" : "0 1px 2px rgba(0,0,0,0.02)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: isSelected ? "#059669" : "#1e293b",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {job.title}
                    </h3>

                    <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", marginBottom: 0, fontWeight: "500" }}>
                      {job.companyId?.name || "Công ty chưa rõ"}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px", fontSize: "11px" }}>
                      {/* Lương */}
                      <span
                        style={{
                          color: "#047857",
                          fontWeight: "600",
                          backgroundColor: "#ecfdf5",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: "1px solid #a7f3d0",
                        }}
                      >
                        {job.salaryMin && job.salaryMax ? `${job.salaryMin} - ${job.salaryMax} triệu` : "Thỏa thuận"}
                      </span>

                      {/* Địa điểm */}
                      <span
                        style={{
                          color: "#475569",
                          backgroundColor: "#f1f5f9",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {job.location || "Chưa xác định"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CHI TIẾT CÔNG VIỆC (CỘT PHẢI) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "24px",
              position: "sticky",
              top: "24px",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            {selectedJob ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Header công việc */}
                <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "10px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#059669",
                      backgroundColor: "#ecfdf5",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      marginBottom: "8px",
                    }}
                  >
                    Tuyển dụng trực tiếp
                  </span>
                  <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0, lineHeight: 1.3 }}>
                    {selectedJob.title}
                  </h1>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#475569", marginTop: "4px", margin: 0 }}>
                    {selectedJob.companyId?.name || "Công ty chưa rõ"}
                  </p>
                </div>

                {/* Box nộp hồ sơ */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "16px",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <h3 style={{ fontWeight: "700", color: "#1e293b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Ứng tuyển công việc này
                  </h3>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <select
                      style={{
                        flex: "1 1 200px",
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                    >
                      <option value="">-- Chọn 1 CV từ tài khoản của bạn --</option>
                      {myResumes.map((cv) => (
                        <option key={cv._id} value={cv._id}>{cv.title}</option>
                      ))}
                    </select>

                    <button
                      onClick={handleApply}
                      disabled={isApplying}
                      style={{
                        backgroundColor: isApplying ? "#cbd5e1" : "#10b981",
                        color: "#ffffff",
                        padding: "8px 20px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "12px",
                        border: "none",
                        cursor: isApplying ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                      }}
                    >
                      {isApplying ? "Đang gửi..." : "Ứng tuyển ngay"}
                    </button>
                  </div>
                </div>

                {/* Mô tả công việc */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h3 style={{ fontWeight: "700", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Mô tả công việc
                  </h3>
                  <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <p style={{ whiteSpace: "pre-line", color: "#334155", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                      {selectedJob.description || "Chưa có thông tin mô tả chi tiết."}
                    </p>
                  </div>
                </div>

                {/* Yêu cầu công việc */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h3 style={{ fontWeight: "700", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Yêu cầu ứng viên
                  </h3>
                  <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <p style={{ whiteSpace: "pre-line", color: "#334155", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                      {selectedJob.requirements || "Chưa có thông tin yêu cầu chi tiết."}
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "500", margin: 0 }}>
                  Vui lòng chọn một công việc bên trái để xem thông tin chi tiết
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}