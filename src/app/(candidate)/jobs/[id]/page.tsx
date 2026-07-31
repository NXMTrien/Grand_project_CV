"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface JobDetail {
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

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params); // Unwrap params cho Next.js 15+
  const jobId = resolvedParams.id;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // STATE QUẢN LÝ ỨNG TUYỂN
  const [myResumes, setMyResumes] = useState<ResumeItem[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [selfIntroduction, setSelfIntroduction] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchJobDetail();
    fetchResumes();
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể lấy thông tin công việc");

      const jobData = data.data || data;
      setJob(jobData);
      setTargetPosition(jobData.title || "");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tải chi tiết công việc");
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
      if (!res.ok) throw new Error(data.message || "Không thể tải danh sách CV");

      const list = data.data || [];
      setMyResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0]._id);
      }
    } catch (err: any) {
      console.error("fetchResumes error:", err);
    }
  };

  const handleOpenApplyModal = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập trước khi ứng tuyển!");
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleSubmitApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!job) return;
    if (!selectedResumeId) {
      alert("Vui lòng chọn 1 chiếc CV phù hợp!");
      return;
    }

    setIsApplying(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập trước khi ứng tuyển");

      const formattedCoverLetter = `Vị trí ứng tuyển: ${targetPosition}\n\nLời giới thiệu:\n${selfIntroduction}`;

      const res = await fetch(`/api/jobs/${job._id}/apply`, {
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
      setIsApplyModalOpen(false);
      setSelfIntroduction("");
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi ứng tuyển");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          color: "#64748b",
          fontSize: "15px",
          fontWeight: "500",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          Đang tải thông tin chi tiết công việc...
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "40px 32px",
            borderRadius: "20px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
            textAlign: "center",
            maxWidth: "420px",
            width: "100%",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>
            Xảy ra lỗi
          </h2>
          <p style={{ color: "#dc2626", fontSize: "14px", margin: "0 0 20px 0" }}>
            {error || "Không tìm thấy công việc này!"}
          </p>
          <button
            onClick={() => router.back()}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            ← Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f1f5f9 0%, #f8fafc 100%)",
        padding: "40px 16px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        
        {/* Nút Back */}
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 0",
            transition: "color 0.2s ease",
          }}
        >
          ← Quay lại danh sách việc làm
        </button>

        {/* THẺ TỔNG QUAN CÔNG VIỆC (HEADER CARD) */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.05)",
            marginBottom: "24px",
            position: "relative",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                fontSize: "12px",
                fontWeight: "700",
                padding: "4px 10px",
                borderRadius: "20px",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Đang tuyển dụng
            </span>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              {job.title}
            </h1>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#475569", marginTop: "10px", margin: "10px 0 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
              🏢 {job.companyId?.name || "Công ty chưa rõ"}
            </p>
          </div>

          {/* HÀNG DƯỚI: BADGES CHI TIẾT & NÚT ỨNG TUYỂN */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  color: "#166534",
                  fontWeight: "700",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                💰 Lương: {job.salaryMin && job.salaryMax ? `${job.salaryMin} - ${job.salaryMax} triệu` : "Thỏa thuận"}
              </div>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  color: "#334155",
                  fontWeight: "600",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                📍 Địa điểm: {job.location || "Chưa xác định"}
              </div>
            </div>

            {/* NÚT ỨNG TUYỂN ĐÃ ĐƯỢC CHUYỂN XUỐNG DƯỚI
            <button
              type="button"
              onClick={handleOpenApplyModal}
              style={{
                backgroundColor: "#10b981",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              🚀 Ứng tuyển ngay
            </button> */}
          </div>
        </div>

        {/* NỘI DUNG CHI TIẾT CÔNG VIỆC */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          {/* MÔ TẢ CÔNG VIỆC */}
          <div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "800",
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>📋</span> Mô tả công việc
            </h3>
            <div
              style={{
                whiteSpace: "pre-line",
                color: "#334155",
                lineHeight: "1.7",
                fontSize: "15px",
                backgroundColor: "#f8fafc",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #f1f5f9",
              }}
            >
              {job.description || "Chưa có thông tin mô tả cho công việc này."}
            </div>
          </div>

          {/* YÊU CẦU ỨNG VIÊN */}
          <div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "800",
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🎯</span> Yêu cầu ứng viên
            </h3>
            <div
              style={{
                whiteSpace: "pre-line",
                color: "#334155",
                lineHeight: "1.7",
                fontSize: "15px",
                backgroundColor: "#f8fafc",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #f1f5f9",
              }}
            >
              {job.requirements || "Chưa có thông tin yêu cầu cho công việc này."}
            </div>
          </div>

          {/* FOOTER NÚT ỨNG TUYỂN DƯỚI CÙNG */}
          <div
            style={{
              paddingTop: "24px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>
                Bạn cảm thấy phù hợp với vị trí này?
              </p>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px" }}>
                Ứng tuyển ngay để Nhà tuyển dụng xem xét hồ sơ của bạn sớm nhất.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenApplyModal}
              style={{
                backgroundColor: "#10b981",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
              }}
            >
              Ứng tuyển ngay
            </button>
          </div>
        </div>
      </div>

      {/* POPUP FORM MODAL ỨNG TUYỂN */}
      {isApplyModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
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
              borderRadius: "20px",
              maxWidth: "520px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "14px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Nộp hồ sơ ứng tuyển
                </h3>
                <p style={{ fontSize: "13px", color: "#2563eb", fontWeight: "600", margin: "4px 0 0 0" }}>
                  {job.title} • {job.companyId?.name || "Công ty"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  fontSize: "14px",
                  color: "#64748b",
                  cursor: "pointer",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApply} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
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
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Chọn CV từ tài khoản <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {myResumes.length === 0 ? (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#ef4444",
                      backgroundColor: "#fef2f2",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      margin: 0,
                      border: "1px solid #fecaca",
                    }}
                  >
                    Bạn chưa tạo CV nào trong tài khoản. Vui lòng tạo CV trước khi nộp.
                  </p>
                ) : (
                  <select
                    required
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "14px",
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
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Thư giới thiệu / Lời nhắn tới Nhà tuyển dụng
                </label>
                <textarea
                  rows={4}
                  placeholder="Giới thiệu ngắn gọn về bản thân, điểm mạnh & lý do bạn phù hợp..."
                  value={selfIntroduction}
                  onChange={(e) => setSelfIntroduction(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    fontSize: "14px",
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
                    padding: "12px 24px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "700",
                    border: "none",
                    cursor: isApplying || myResumes.length === 0 ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
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