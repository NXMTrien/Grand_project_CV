"use client";

import { useState } from "react";

export default function TopCVHomePage() {
  const [searchTitle, setSearchTitle] = useState("");
  const [hoveredJob, setHoveredJob] = useState<number | null>(null);

  // Dữ liệu mẫu danh sách việc làm tốt nhất (Hot Jobs)
  const hotJobs = [
    { id: 1, title: "Tổng Quản Lý Nhà Hàng - Thu Nhập Đến 40 Triệu", company: "CÔNG TY CỔ PHẦN DỊCH VỤ & ẨM THỰC P...", salary: "20 - 40 triệu", location: "Hồ Chí Minh" },
    { id: 2, title: "Nhân Viên Tư Vấn Tải Chính/Telesales/Call Center", company: "CÔNG TY TÀI CHÍNH TNHH NGÂN HÀNG VI...", salary: "10 - 30 triệu", location: "Hồ Chí Minh" },
    { id: 3, title: "Nhân Viên Kinh Doanh - Tư Vấn Nhà Phố - Tự Do", company: "CHI NHÁNH SỐ 2 CÔNG TY CỔ PHẦN TẬP Đ...", salary: "30.5 - 100 triệu", location: "Hồ Chí Minh" },
    { id: 4, title: "Trưởng Phòng Kinh Doanh Dự Án BCONS CITY LIFE", company: "CÔNG TY TNHH XÂY DỰNG B-ONE TECH", salary: "20 - 100 triệu", location: "Hồ Chí Minh" },
    { id: 5, title: "Kỹ Sư Xây Dựng (Giám Sát Hiện Trường Civil)", company: "CÔNG TY TNHH BAROCK VINA", salary: "Thỏa thuận", location: "Hồ Chí Minh" },
    { id: 6, title: "Trưởng Phòng Kỹ Thuật Sản Xuất (Ngành May)", company: "CÔNG TY CP ĐẦU TƯ THƯƠNG MẠI SMC", salary: "Thỏa thuận", location: "Hồ Chí Minh" },
    { id: 7, title: "Chuyên Viên Kinh Doanh Bất Động Sản (Quận 2)", company: "CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VẠ...", salary: "Thỏa thuận", location: "Hồ Chí Minh" },
    { id: 8, title: "Chuyên Viên Giải Phóng Mặt Bằng Thu Nhập Cao", company: "CÔNG TY CỔ PHẦN ĐẦU TƯ FECON", salary: "18 - 23 triệu", location: "Bắc Ninh" },
  ];

  return (
    <div style={{ backgroundColor: "#f4f6f9", minHeight: "100vh", fontFamily: "'Segoe UI', Roboto, sans-serif", color: "#334155" }}>
      
      {/* SECTION 1: HERO SEARCH BACKGROUND (MÀU XANH ĐẬM ĐẶC TRƯNG TOPCV) */}
      <div style={{ background: "linear-gradient(180deg, #004d33 0%, #006644 100%)", padding: "40px 20px 60px 20px", textAlign: "center" }}>
        <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: "700", marginBottom: "8px", margin: 0 }}>
          Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
        </h1>
        <p style={{ color: "#a7f3d0", fontSize: "14px", marginBottom: "24px", marginTop: 0 }}>
          Tiếp cận 80.000+ tin tuyển dụng việc làm mới mỗi ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
        </p>

        {/* THANH TÌM KIẾM BAO GỒM CÁC Ô LỰC CHỌN */}
        <div style={{ maxWidth: "940px", margin: "0 auto", backgroundColor: "#ffffff", padding: "8px", borderRadius: "32px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}>
          
          {/* Ô nhập từ khóa */}
          <div style={{ flex: 2, display: "flex", alignItems: "center", paddingLeft: "16px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#94a3b8" style={{ width: "18px", height: "18px", marginRight: "8px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.601Z" />
            </svg>
            <input 
              type="text" 
              placeholder="Vị trí tuyển dụng, tên công ty..." 
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              style={{ width: "100%", border: "none", outline: "none", fontSize: "14px", color: "#1e293b" }}
            />
          </div>

          {/* Ngăn cách vạch đứng */}
          <div style={{ width: "1px", height: "24px", backgroundColor: "#e2e8f0" }}></div>

          {/* Chọn địa điểm */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", cursor: "pointer" }}>
            <span style={{ fontSize: "14px", color: "#475569" }}>Tất cả địa điểm</span>
            <span style={{ fontSize: "10px", color: "#64748b" }}>▼</span>
          </div>

          {/* Nút Tìm Kiếm màu xanh lá */}
          <button style={{ backgroundColor: "#00b14f", color: "#ffffff", border: "none", padding: "10px 28px", borderRadius: "24px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#009843")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00b14f")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: "16px", height: "16px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.601Z" />
            </svg>
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* SECTION 2: GRID NỘI DUNG (BANNER CHẠY + DANH MỤC NGÀNH NGHỀ) */}
      <div style={{ maxWidth: "1200px", margin: "-30px auto 40px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 3fr", gap: "20px" }}>
        
        {/* Menu danh mục bên trái */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          {["Kinh doanh / Bán hàng", "Marketing / PR / Quảng cáo", "Chăm sóc khách hàng", "Nhân sự / Hành chính", "Công nghệ Thông tin", "Lao động phổ thông"].map((item, idx) => (
            <div key={idx} style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", cursor: "pointer", borderRadius: "6px" }}
                 onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                 onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
              <span>{item}</span>
              <span style={{ color: "#94a3b8" }}>❯</span>
            </div>
          ))}
        </div>

        {/* Khu vực Banner quảng cáo lớn bên phải */}
        <div style={{ position: "relative", backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "294px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg, #e0f2fe 0%, #f0fdf4 100%)" }}>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <span style={{ background: "#00b14f", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>TIN TIÊU BIỂU</span>
            <h2 style={{ fontSize: "28px", color: "#0f172a", fontWeight: "800", marginTop: "12px" }}>TUYỂN DỤNG TOÀN QUỐC 2026</h2>
            <p style={{ color: "#475569" }}>Cơ hội gia nhập tập đoàn tài chính hàng đầu với mức thu nhập vượt trội &gt; 30 Triệu/Tháng</p>
            <button style={{ background: "#0f172a", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", marginTop: "10px" }}>Ứng tuyển ngay</button>
          </div>
        </div>
      </div>

      {/* SECTION 3: DANH SÁCH VIỆC LÀM TỐT NHẤT (HOT JOBS) */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 60px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <div style={{ width: "4px", height: "24px", backgroundColor: "#00b14f", borderRadius: "2px" }}></div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Việc làm tốt nhất</h2>
          <span style={{ backgroundColor: "#e0fdf4", color: "#00b14f", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px" }}>TOPPY AI GỢI Ý</span>
        </div>

        {/* GRID CHỨA BÀI ĐĂNG VIỆC LÀM (2 CỘT HOẶC 3 CỘT) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {hotJobs.map((job) => (
            <div 
              key={job.id}
              onMouseEnter={() => setHoveredJob(job.id)}
              onMouseLeave={() => setHoveredJob(null)}
              style={{ 
                backgroundColor: "#ffffff", 
                padding: "16px", 
                borderRadius: "12px", 
                boxShadow: hoveredJob === job.id ? "0 10px 15px -3px rgba(0, 177, 79, 0.15)" : "0 4px 6px -1px rgba(0,0,0,0.03)", 
                border: hoveredJob === job.id ? "1px solid #00b14f" : "1px solid #e2e8f0",
                transition: "all 0.2s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "140px"
              }}
            >
              <div>
                {/* Tiêu đề công việc */}
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: hoveredJob === job.id ? "#00b14f" : "#1e293b", margin: "0 0 6px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                  {job.title}
                </h3>
                {/* Tên doanh nghiệp */}
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {job.company}
                </p>
              </div>

              {/* Phần chân của Thẻ chứa lương và địa điểm */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                <span style={{ color: "#00b14f", fontWeight: "700", backgroundColor: "#f0fdf4", padding: "4px 8px", borderRadius: "4px" }}>
                  {job.salary}
                </span>
                <span style={{ color: "#64748b", backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "4px" }}>
                  {job.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}