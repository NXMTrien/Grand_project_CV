"use client";

import { useState, useEffect } from "react";

export default function CVBuilderPage() {
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("CV Kỹ Sư Phần Mềm");
  const [loading, setLoading] = useState(false);

  // STATE ĐÃ ĐƯỢC NÂNG CẤP ĐẦY ĐỦ CÁC TRƯỜNG THEO YÊU CẦU
  const [cvData, setCvData] = useState({
    fullName: "Nguyễn Văn A",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    phone: "0912345678",
    email: "nguyenvana@gmail.com",
    address: "Quận 1, TP. Hồ Chí Minh",
    targetPosition: "Fullstack Developer",
    summary: "Tôi là một lập trình viên năng động, mong muốn cống hiến và phát triển các sản phẩm web chất lượng cao...",
    technicalSkills: "ReactJS, Next.js, Node.js, MongoDB, TypeScript",
    softSkills: "Làm việc nhóm, Giải quyết vấn đề, Giao tiếp, Quản lý thời gian",
    education: {
      type: "Đại học",
      school: "Đại học Công nghệ",
      major: "Công nghệ thông tin",
      details: "Tốt nghiệp loại Giỏi, điểm trung bình 3.6/4.0",
    },
    experience: {
      company: "Công ty Công nghệ ABC",
      position: "Fullstack Developer Intern",
      details: "Phát triển và tối ưu hóa giao diện hệ thống Web bằng Next.js.\nPhối hợp cùng đội ngũ Backend để thiết kế API RESTful.",
    },
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCvData((prev) => ({
          ...prev,
          fullName: user.fullName || prev.fullName,
          email: user.email || prev.email,
        }));
      } catch (e) {
        console.error("Lỗi khi đọc dữ liệu user:", e);
      }
    }
  }, []);

  const handleSaveCV = async () => {
    if (!token) {
      alert("Vui lòng đăng nhập tài khoản Ứng viên trước khi lưu CV!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/resume/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, cvData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể lưu CV");
      alert("🎉 " + (data.message || "Lưu CV thành công!"));
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "32px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* TOPBAR ĐIỀU KHIỂN */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            paddingBottom: "16px",
            marginBottom: "24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
              Tên quản lý CV
            </label>
            <input
              type="text"
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#0f172a",
                border: "none",
                borderBottom: "2px dashed #cbd5e1",
                backgroundColor: "transparent",
                outline: "none",
                padding: "2px 0",
                minWidth: "280px",
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <button
            onClick={handleSaveCV}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#cbd5e1" : "#10b981",
              color: "#ffffff",
              border: "none",
              padding: "10px 24px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
            }}
          >
            {loading ? "Đang lưu..." : "Lưu CV lên hệ thống"}
          </button>
        </div>

        {/* CỘT CHÍNH 2 BÊN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* ================= CỘT TRÁI: FORM CHỈNH SỬA CHI TIẾT ================= */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              maxHeight: "85vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#0f172a",
                borderLeft: "4px solid #10b981",
                paddingLeft: "10px",
                margin: 0,
              }}
            >
              Thông tin CV
            </h2>

            {/* Khối 1: Thông tin cơ bản */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                1. Thông tin cá nhân & Liên hệ
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Họ và Tên</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.fullName}
                    onChange={(e) => setCvData({ ...cvData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Vị trí ứng tuyển</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.targetPosition}
                    onChange={(e) => setCvData({ ...cvData, targetPosition: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Số điện thoại</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.phone}
                    onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Email liên hệ</label>
                  <input
                    type="email"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.email}
                    onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Địa chỉ hiện tại</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.address}
                    onChange={(e) => setCvData({ ...cvData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Link Ảnh đại diện (URL)</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.avatar}
                    onChange={(e) => setCvData({ ...cvData, avatar: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Giới thiệu ngắn / Mục tiêu</label>
                <textarea
                  rows={2}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", resize: "vertical" }}
                  value={cvData.summary}
                  onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                />
              </div>
            </div>

            {/* Khối 2: Học vấn & Bằng cấp */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                2. Trình độ học vấn
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Hệ bằng cấp</label>
                  <select
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", backgroundColor: "#fff", boxSizing: "border-box" }}
                    value={cvData.education.type}
                    onChange={(e) => setCvData({ ...cvData, education: { ...cvData.education, type: e.target.value } })}
                  >
                    <option value="Đại học">Đại học</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Khác">Khác (Trung cấp/Chứng chỉ)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Nơi học (Tên trường)</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.education.school}
                    onChange={(e) => setCvData({ ...cvData, education: { ...cvData.education, school: e.target.value } })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Chuyên ngành</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.education.major}
                    onChange={(e) => setCvData({ ...cvData, education: { ...cvData.education, major: e.target.value } })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Mô tả học vấn / Thành tích</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.education.details}
                    onChange={(e) => setCvData({ ...cvData, education: { ...cvData.education, details: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Khối 3: Kinh nghiệm làm việc */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                3. Kinh nghiệm thực tế
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Tên công ty/Tổ chức</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.experience.company}
                    onChange={(e) => setCvData({ ...cvData, experience: { ...cvData.experience, company: e.target.value } })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Vị trí đảm nhiệm</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    value={cvData.experience.position}
                    onChange={(e) => setCvData({ ...cvData, experience: { ...cvData.experience, position: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Chi tiết công việc / Đóng góp chính</label>
                <textarea
                  rows={3}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", resize: "vertical" }}
                  value={cvData.experience.details}
                  onChange={(e) => setCvData({ ...cvData, experience: { ...cvData.experience, details: e.target.value } })}
                />
              </div>
            </div>

            {/* Khối 4: Kỹ năng */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                4. Bộ kỹ năng
              </h3>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Kỹ năng chuyên môn (Cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  value={cvData.technicalSkills}
                  onChange={(e) => setCvData({ ...cvData, technicalSkills: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Kỹ năng mềm (Cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  value={cvData.softSkills}
                  onChange={(e) => setCvData({ ...cvData, softSkills: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI: LIVE PREVIEW CHUẨN TOPCV ================= */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
              position: "sticky",
              top: "24px",
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              minHeight: "650px",
            }}
          >
            {/* SIDEBAR BÊN TRÁI CV (MÀU TỐI) */}
            <div
              style={{
                backgroundColor: "#1e293b",
                color: "#cbd5e1",
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                fontSize: "12px",
              }}
            >
              {/* Ảnh đại diện tròn */}
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid #10b981",
                  backgroundColor: "#334155",
                }}
              >
                <img
                  src={cvData.avatar || "https://via.placeholder.com/200"}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Thông tin liên hệ */}
              <div style={{ width: "100%", borderTop: "1px solid #334155", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <h4 style={{ color: "#34d399", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                  Liên hệ
                </h4>
                <p style={{ margin: 0, wordBreak: "break-all" }}>
                  <strong style={{ color: "#fff" }}>📞 SĐT:</strong><br />{cvData.phone}
                </p>
                <p style={{ margin: 0, wordBreak: "break-all" }}>
                  <strong style={{ color: "#fff" }}>✉️ Email:</strong><br />{cvData.email}
                </p>
                <p style={{ margin: 0, wordBreak: "break-word" }}>
                  <strong style={{ color: "#fff" }}>📍 Địa chỉ:</strong><br />{cvData.address}
                </p>
              </div>

              {/* Kỹ năng mềm */}
              <div style={{ width: "100%", borderTop: "1px solid #334155", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <h4 style={{ color: "#34d399", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                  Kỹ năng mềm
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {cvData.softSkills.split(",").map((s, i) =>
                    s.trim() ? (
                      <span
                        key={i}
                        style={{
                          backgroundColor: "#334155",
                          color: "#f1f5f9",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          width: "fit-content",
                        }}
                      >
                        {s.trim()}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            </div>

            {/* PHẦN NỘI DUNG CHÍNH BÊN PHẢI CV (MÀU TRẮNG) */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                fontSize: "12px",
                color: "#334155",
                lineHeight: "1.6",
              }}
            >
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", textTransform: "uppercase", margin: 0, letterSpacing: "0.02em" }}>
                  {cvData.fullName}
                </h1>
                <p style={{ color: "#059669", fontWeight: "700", fontSize: "13px", margin: "2px 0 0 0" }}>
                  {cvData.targetPosition}
                </p>
                <p style={{ marginTop: "8px", color: "#64748b", fontStyle: "italic", borderLeft: "2px solid #e2e8f0", paddingLeft: "8px", margin: "8px 0 0 0" }}>
                  {cvData.summary}
                </p>
              </div>

              {/* Kinh nghiệm làm việc */}
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#059669",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                    margin: 0,
                  }}
                >
                  💼 Kinh nghiệm làm việc
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", color: "#0f172a" }}>
                  <span>{cvData.experience.company}</span>
                  <span style={{ color: "#94a3b8", fontWeight: "400" }}>Tháng 06/2025 - Hiện tại</span>
                </div>
                <p style={{ fontStyle: "italic", color: "#64748b", fontWeight: "500", margin: "2px 0 6px 0" }}>
                  {cvData.experience.position}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#475569",
                    whiteSpace: "pre-line",
                    backgroundColor: "#f8fafc",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  {cvData.experience.details}
                </p>
              </div>

              {/* Học vấn */}
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#059669",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                    margin: 0,
                  }}
                >
                  🎓 Trình độ học vấn
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", color: "#0f172a" }}>
                  <span>{cvData.education.school}</span>
                  <span
                    style={{
                      backgroundColor: "#ecfdf5",
                      color: "#047857",
                      fontWeight: "600",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "10px",
                    }}
                  >
                    {cvData.education.type}
                  </span>
                </div>
                <p style={{ color: "#475569", fontWeight: "500", margin: "2px 0 0 0" }}>
                  Chuyên ngành: {cvData.education.major}
                </p>
                <p style={{ color: "#94a3b8", fontStyle: "italic", margin: "2px 0 0 0" }}>
                  {cvData.education.details}
                </p>
              </div>

              {/* Kỹ năng chuyên môn */}
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#059669",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                    margin: 0,
                  }}
                >
                  🛠️ Kỹ năng chuyên môn
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                  {cvData.technicalSkills.split(",").map((s, i) =>
                    s.trim() ? (
                      <span
                        key={i}
                        style={{
                          backgroundColor: "#ecfdf5",
                          color: "#047857",
                          border: "1px solid #a7f3d0",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "11px",
                        }}
                      >
                        {s.trim()}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}