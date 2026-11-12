"use client";

import { useState } from "react";

export default function TopCVHomePage() {
  const [searchTitle, setSearchTitle] = useState("");
  const [hoveredJob, setHoveredJob] = useState<number | null>(null);
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);
  const [isSearchBtnHovered, setIsSearchBtnHovered] = useState(false);

  // Dữ liệu mẫu việc làm (Hot Jobs)
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

  const categories = [
    "Kinh doanh / Bán hàng",
    "Marketing / PR / Quảng cáo",
    "Chăm sóc khách hàng",
    "Nhân sự / Hành chính",
    "Công nghệ Thông tin",
    "Lao động phổ thông"
  ];

  return (
    <div style={styles.pageWrapper}>
      
      {/* SECTION 1: HERO SEARCH */}
      <div style={styles.heroSection}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={styles.heroTitle}>
            Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
          </h1>
          <p style={styles.heroSubtitle}>
            Tiếp cận 80.000+ tin tuyển dụng việc làm mới mỗi ngày từ hàng nghìn doanh nghiệp uy tín
          </p>
        </div>

        {/* SEARCH BAR */}
        <div style={styles.searchBarContainer}>
          {/* Ô nhập từ khóa */}
          <div style={styles.searchInputGroup}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#94a3b8" style={{ width: "20px", height: "20px", marginRight: "10px", flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.601Z" />
            </svg>
            <input 
              type="text" 
              placeholder="Vị trí tuyển dụng, tên công ty..." 
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.divider}></div>

          {/* Chọn địa điểm */}
          <div style={styles.locationSelector}>
            <span style={{ fontSize: "14px", color: "#334155", fontWeight: "500" }}>Tất cả địa điểm</span>
            <span style={{ fontSize: "10px", color: "#64748b" }}>▼</span>
          </div>

          {/* Nút Tìm Kiếm */}
          <button 
            onMouseEnter={() => setIsSearchBtnHovered(true)}
            onMouseLeave={() => setIsSearchBtnHovered(false)}
            style={{
              ...styles.searchButton,
              backgroundColor: isSearchBtnHovered ? "#059669" : "#10b981",
              boxShadow: isSearchBtnHovered ? "0 6px 16px rgba(16, 185, 129, 0.4)" : "none"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: "16px", height: "16px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.601Z" />
            </svg>
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* SECTION 2: CATEGORIES & BANNER */}
      <div style={styles.contentGrid}>
        
        {/* Menu danh mục */}
        <div style={styles.categoryCard}>
          {categories.map((item, idx) => {
            const isCatHovered = hoveredCat === idx;
            return (
              <div 
                key={idx} 
                onMouseEnter={() => setHoveredCat(idx)}
                onMouseLeave={() => setHoveredCat(null)}
                style={{
                  ...styles.categoryItem,
                  backgroundColor: isCatHovered ? "#f0fdf4" : "transparent",
                  color: isCatHovered ? "#059669" : "#334155",
                }}
              >
                <span>{item}</span>
                <span style={{ color: isCatHovered ? "#059669" : "#cbd5e1", fontSize: "12px", transition: "transform 0.2s" }}>❯</span>
              </div>
            );
          })}
        </div>

        {/* Banner tiêu điểm */}
        <div style={styles.bannerCard}>
          <div style={{ textAlign: "center", padding: "32px", maxWidth: "600px" }}>
            <span style={styles.bannerTag}>TIN TIÊU BIỂU</span>
            <h2 style={styles.bannerTitle}>TUYỂN DỤNG TOÀN QUỐC 2026</h2>
            <p style={styles.bannerDesc}>Cơ hội gia nhập tập đoàn tài chính hàng đầu với mức thu nhập vượt trội &gt; 30 Triệu/Tháng</p>
            <button style={styles.bannerBtn}>Ứng tuyển ngay</button>
          </div>
        </div>
      </div>

      {/* SECTION 3: HOT JOBS */}
      <div style={styles.jobsSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.headerIndicator}></div>
          <h2 style={styles.sectionTitle}>Việc làm tốt nhất</h2>
          <span style={styles.aiBadge}>TOPPY AI GỢI Ý</span>
        </div>

        {/* GRID JOB CARDS */}
        <div style={styles.jobsGrid}>
          {hotJobs.map((job) => {
            const isHovered = hoveredJob === job.id;
            return (
              <div 
                key={job.id}
                onMouseEnter={() => setHoveredJob(job.id)}
                onMouseLeave={() => setHoveredJob(null)}
                style={{
                  ...styles.jobCard,
                  borderColor: isHovered ? "#10b981" : "#f1f5f9",
                  boxShadow: isHovered 
                    ? "0 12px 20px -5px rgba(16, 185, 129, 0.15), 0 4px 6px -2px rgba(0,0,0,0.02)" 
                    : "0 2px 4px rgba(0,0,0,0.02)",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)"
                }}
              >
                <div>
                  <h3 style={{
                    ...styles.jobTitle,
                    color: isHovered ? "#059669" : "#0f172a"
                  }}>
                    {job.title}
                  </h3>
                  <p style={styles.companyName}>
                    {job.company}
                  </p>
                </div>

                <div style={styles.jobCardFooter}>
                  <span style={styles.salaryBadge}>
                    {job.salary}
                  </span>
                  <span style={styles.locationBadge}>
                    {job.location}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// 📦 BỘ STYLES CHUẨN MODERN UI
const styles = {
  pageWrapper: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#334155",
    paddingBottom: "60px",
  },
  heroSection: {
    background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)",
    padding: "50px 20px 80px 20px",
    textAlign: "center" as const,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "10px",
    marginTop: 0,
    letterSpacing: "-0.5px",
    lineHeight: "1.3",
  },
  heroSubtitle: {
    color: "#a7f3d0",
    fontSize: "15px",
    marginBottom: "32px",
    marginTop: 0,
    fontWeight: "400",
  },
  searchBarContainer: {
    maxWidth: "960px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "6px 8px 6px 16px",
    borderRadius: "99px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },
  searchInputGroup: {
    flex: 2,
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    fontWeight: "500",
    backgroundColor: "transparent",
  },
  divider: {
    width: "1px",
    height: "28px",
    backgroundColor: "#e2e8f0",
  },
  locationSelector: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    cursor: "pointer",
  },
  searchButton: {
    color: "#ffffff",
    border: "none",
    padding: "12px 32px",
    borderRadius: "99px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  contentGrid: {
    maxWidth: "1200px",
    margin: "-40px auto 40px auto",
    padding: "0 20px",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "20px",
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "12px",
    boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.05)",
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  categoryItem: {
    padding: "12px 14px",
    fontSize: "13.5px",
    fontWeight: "600",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    borderRadius: "10px",
    transition: "all 0.15s ease",
  },
  bannerCard: {
    position: "relative" as const,
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.05)",
    border: "1px solid #f1f5f9",
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)",
  },
  bannerTag: {
    background: "#10b981",
    color: "#ffffff",
    padding: "4px 14px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  bannerTitle: {
    fontSize: "26px",
    color: "#0f172a",
    fontWeight: "800",
    marginTop: "14px",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  bannerDesc: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "18px",
  },
  bannerBtn: {
    background: "#0f172a",
    color: "#ffffff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.2)",
  },
  jobsSection: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
  },
  headerIndicator: {
    width: "4px",
    height: "22px",
    backgroundColor: "#10b981",
    borderRadius: "99px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  aiBadge: {
    backgroundColor: "#ecfdf5",
    color: "#059669",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "6px",
    border: "1px solid #a7f3d0",
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
    gap: "18px",
  },
  jobCard: {
    backgroundColor: "#ffffff",
    padding: "18px",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    height: "150px",
    boxSizing: "border-box" as const,
  },
  jobTitle: {
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 6px 0",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    lineHeight: "1.4",
    transition: "color 0.2s ease",
  },
  companyName: {
    fontSize: "12.5px",
    color: "#64748b",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  jobCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    marginTop: "12px",
  },
  salaryBadge: {
    color: "#059669",
    fontWeight: "700",
    backgroundColor: "#ecfdf5",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  locationBadge: {
    color: "#475569",
    backgroundColor: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: "500",
  },
};