"use client";

import { useEffect, useState } from "react";

export default function TopCVHomePage() {
  const [searchTitle, setSearchTitle] = useState("");
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hotJobs, setHotJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  useEffect(() => {
    async function loadHotJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (!res.ok) {
          throw new Error("Không tải được việc làm");
        }
        const json = await res.json();
        setHotJobs(
          (json.data || []).map((job: any) => ({
            id: job._id,
            title: job.title,
            company: job.companyId?.name || "Công ty chưa rõ",
            salary:
              job.salaryMin && job.salaryMax
                ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} đồng`
                : "Thỏa thuận",
            location: job.location || "Chưa rõ",
            logoText: job.companyId?.name?.charAt(0) || "C",
            logoBg: "#f8fafc",
            logoColor: "#0f172a"
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingJobs(false);
      }
    }

    loadHotJobs();
  }, []);

  return (
    <div style={{ backgroundColor: "#f4f6f9", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#334155" }}>
      
      {/* SECTION 1: HERO SEARCH BACKGROUND (GRADIENT XANH ĐẬM SANG TRỌNG) */}
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)", padding: "50px 20px 70px 20px", textAlign: "center", position: "relative" }}>
        <h1 style={{ color: "#ffffff", fontSize: "26px", fontWeight: "700", marginBottom: "12px", margin: 0, letterSpacing: "-0.02em" }}>
          Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
        </h1>
        <p style={{ color: "#a7f3d0", fontSize: "14px", marginBottom: "32px", marginTop: 0, fontWeight: "400" }}>
          Tiếp cận <strong style={{ color: "#ffffff" }}>80.000+</strong> tin tuyển dụng việc làm mới mỗi ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
        </p>

        {/* THANH TÌM KIẾM ĐƯỢC ĐỔ BÓNG TRONG SUỐT NỔI BẬT */}
        <div style={{ 
          maxWidth: "960px", 
          margin: "0 auto", 
          backgroundColor: "#ffffff", 
          padding: "10px", 
          borderRadius: "100px", 
          display: "flex", 
          alignItems: "center", 
          gap: "12px", 
          boxShadow: isSearchFocused ? "0 20px 25px -5px rgba(0,0,0,0.4), 0 0 0 4px rgba(16, 185, 129, 0.3)" : "0 10px 25px -5px rgba(0,0,0,0.25)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
          
          {/* Ô nhập từ khóa */}
          <div style={{ flex: 2, display: "flex", alignItems: "center", paddingLeft: "20px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#10b981" style={{ width: "20px", height: "20px", marginRight: "10px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.601Z" />
            </svg>
            <input 
              type="text" 
              placeholder="Vị trí tuyển dụng, từ khóa công việc hoặc tên doanh nghiệp..." 
              value={searchTitle}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => setSearchTitle(e.target.value)}
              style={{ width: "100%", border: "none", outline: "none", fontSize: "14px", color: "#1e293b", fontWeight: "500" }}
            />
          </div>

          {/* Thanh vạch đứng phân tách */}
          <div style={{ width: "1px", height: "28px", backgroundColor: "#e2e8f0" }}></div>

          {/* Dropdown địa điểm mô phỏng */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", cursor: "pointer", color: "#475569" }}
               onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
               onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>Tất cả địa điểm</span>
            </div>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>▼</span>
          </div>

          {/* Nút Tìm Kiếm bo tròn lớn */}
          <button style={{ backgroundColor: "#10b981", color: "#ffffff", border: "none", padding: "12px 36px", borderRadius: "100px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#047857")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}>
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* SECTION 2: CONTAINER CHÍNH */}
      <div style={{ maxWidth: "1240px", margin: "-35px auto 40px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
        
        {/* Menu danh mục ngành nghề tinh tế */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "16px", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", padding: "0 8px 12px 8px", margin: 0, borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#10b981" }}>☰</span> Danh mục ngành nghề
          </h3>
          <div style={{ marginTop: "8px" }}>
            {["Kinh doanh / Bán hàng", "Marketing / PR / Quảng cáo", "Chăm sóc khách hàng", "Nhân sự / Hành chính", "Công nghệ Thông tin", "Lao động phổ thông"].map((item, idx) => (
              <div key={idx} style={{ padding: "12px 12px", fontSize: "13px", fontWeight: "600", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderRadius: "8px", color: "#475569", transition: "all 0.15s" }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.backgroundColor = "#f0fdf4";
                     e.currentTarget.style.color = "#10b981";
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.backgroundColor = "transparent";
                     e.currentTarget.style.color = "#475569";
                   }}>
                <span>{item}</span>
                <span style={{ color: "#cbd5e1", fontSize: "11px" }}>❯</span>
              </div>
            ))}
          </div>
        </div>

        {/* Banner lớn thời thượng */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)", height: "320px", display: "flex", alignItems: "center", background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)", border: "1px solid #e2e8f0", padding: "40px" }}>
          <div style={{ maxWidth: "550px", textAlign: "left" }}>
            <span style={{ background: "#10b981", color: "#fff", padding: "6px 14px", borderRadius: "30px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em" }}>TIN TUYỂN DỤNG TIÊU BIỂU</span>
            <h2 style={{ fontSize: "30px", color: "#0f172a", fontWeight: "800", marginTop: "16px", marginBottom: "8px", lineHeight: "1.2" }}>CƠ HỘI VIỆC LÀM ĐÓN ĐẦU XU HƯỚNG 2026</h2>
            <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.5", marginBottom: "24px" }}>Gia nhập mạng lưới đối tác chiến lược để nhận gói đặc quyền thu nhập và lộ trình thăng tiến rõ ràng vượt bậc.</p>
            <button style={{ background: "#0f172a", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
              Ứng tuyển ngay ↗
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: GRID DANH SÁCH VIỆC LÀM TỐT NHẤT */}
      <div style={{ maxWidth: "1240px", margin: "0 auto 60px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "4px", height: "24px", backgroundColor: "#10b981", borderRadius: "10px" }}></div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>Việc làm tốt nhất</h2>
            <span style={{ backgroundColor: "#e0fdf4", color: "#10b981", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "6px" }}>🔥 GỢI Ý MỚI NHẤT</span>
          </div>
        </div>

        {/* THIẾT KẾ CARD CHI TIẾT GIỐNG 90% TOPCV */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {isLoadingJobs ? (
            <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "#64748b" }}>
              Đang tải việc làm tốt nhất...
            </div>
          ) : hotJobs.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "#64748b" }}>
              Chưa có dữ liệu việc làm để hiển thị.
            </div>
          ) : (
            hotJobs.map((job) => (
              <div 
                key={job.id}
                onMouseEnter={() => setHoveredJob(job.id)}
                onMouseLeave={() => setHoveredJob(null)}
                style={{ 
                  backgroundColor: "#ffffff", 
                  padding: "20px", 
                  borderRadius: "16px", 
                  boxShadow: hoveredJob === job.id ? "0 12px 25px -5px rgba(16, 185, 129, 0.15)" : "0 4px 6px -1px rgba(0,0,0,0.02)", 
                  border: "1px solid",
                  borderColor: hoveredJob === job.id ? "#10b981" : "#e2e8f0",
                  transform: hoveredJob === job.id ? "translateY(-2px)" : "none",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  display: "flex",
                  gap: "16px"
                }}
              >
                {/* Ảnh đại diện logo giả lập bên trái Card */}
                <div style={{ 
                  width: "52px", 
                  height: "52px", 
                  backgroundColor: job.logoBg, 
                  color: job.logoColor, 
                  borderRadius: "12px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: "20px", 
                  fontWeight: "700",
                  flexShrink: 0,
                  border: "1px solid #f1f5f9"
                }}>
                  {job.logoText}
                </div>

                {/* Khu vực thông tin chi tiết */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flexGrow: 1, minWidth: 0 }}>
                  <div>
                    <h3 style={{ 
                      fontSize: "14.5px", 
                      fontWeight: "700", 
                      color: hoveredJob === job.id ? "#10b981" : "#1e293b", 
                      margin: "0 0 6px 0", 
                      display: "-webkit-box", 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: "vertical", 
                      overflow: "hidden", 
                      lineHeight: "1.4",
                      transition: "color 0.2s"
                    }}>
                      {job.title}
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 14px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "500" }}>
                      {job.company}
                    </p>
                  </div>

                  {/* Phần Tag lương & Địa điểm */}
                  <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
                    <span style={{ color: "#10b981", fontWeight: "700", backgroundColor: "#f0fdf4", padding: "4px 10px", borderRadius: "6px" }}>
                      💵 {job.salary}
                    </span>
                    <span style={{ color: "#475569", backgroundColor: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontWeight: "500" }}>
                      📍 {job.location}
                    </span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}