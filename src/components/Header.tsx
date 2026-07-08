"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  // 💡 ĐỔI TÊN HỆ THỐNG TẠI ĐÂY (Thay 'Grand' và 'Job' bằng tên bạn muốn)
  const systemNameLeft = "Grand";
  const systemNameRight = "Job";

  const [user, setUser] = useState<any>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage khi đã đăng nhập thành công
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  // Style chung cho các link menu điều hướng
  const navLinkStyle = (id: string) => ({
    color: hoveredLink === id ? "#10b981" : "#4b5563",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 0",
    transition: "all 0.2s ease",
    borderBottom: `2px solid ${hoveredLink === id ? "#10b981" : "transparent"}`,
  });

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#ffffff", borderBottom: "1px solid #f3f4f6", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* KHỐI 1 (PHÍA BÊN TRÁI): LOGO VÀ TÊN TRANG ĐÃ ĐỔI TÊN */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", width: "25%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span style={{ fontSize: "24px", fontWeight: "900", color: "#10b981", letterSpacing: "-0.05em" }}>
              {systemNameLeft}<span style={{ color: "#1e293b" }}>{systemNameRight}</span>
            </span>
            {/* Biểu tượng logo hình tờ CV thu nhỏ */}
            <div style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* KHỐI 2 (Ở GIỮA): GIỮ NGUYÊN ĐIỀU HƯỚNG MENU CHÍNH */}
        <nav style={{ display: "flex", gap: "32px", width: "50%", justifyContent: "center" }}>
          <Link 
            href="/" 
            id="home"
            onMouseEnter={() => setHoveredLink("home")}
            onMouseLeave={() => setHoveredLink(null)}
            style={navLinkStyle("home")}
          >
            Trang chủ
          </Link>
          <Link 
            href="/jobs" 
            id="jobs"
            onMouseEnter={() => setHoveredLink("jobs")}
            onMouseLeave={() => setHoveredLink(null)}
            style={navLinkStyle("jobs")}
          >
            Việc làm
          </Link>
          <Link 
            href="/resume" 
            id="resume"
            onMouseEnter={() => setHoveredLink("resume")}
            onMouseLeave={() => setHoveredLink(null)}
            style={navLinkStyle("resume")}
          >
            Tạo CV
          </Link>
        </nav>

        {/* KHỐI 3 (PHÍA BÊN PHẢI): KHU VỰC ĐĂNG NHẬP / ĐĂNG KÝ / TÀI KHOẢN CHUYỂN QUA ĐÂY */}
        <div style={{ display: "flex", alignItems: "center", width: "25%", justifyContent: "flex-end" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
                <span style={{ color: "#1e293b", fontWeight: "600", fontSize: "14px", lineHeight: 1.2 }}>{user.fullName}</span>
                <button onClick={handleLogout} style={{ background: "none", border: "none", padding: 0, fontSize: "12px", color: "#ef4444", textDecoration: "underline", cursor: "pointer", textAlign: "right", marginTop: "2px" }}>
                  Đăng xuất
                </button>
              </div>
              {/* Icon hình người đại diện */}
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link 
                href="/login" 
                onMouseEnter={() => setHoveredLink("login")}
                onMouseLeave={() => setHoveredLink(null)}
                style={{ color: hoveredLink === "login" ? "#10b981" : "#4b5563", textDecoration: "none", fontSize: "14px", fontWeight: "600", padding: "8px 12px", borderRadius: "8px", transition: "all 0.2s" }}
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                style={{ backgroundColor: "#10b981", color: "#ffffff", textDecoration: "none", fontSize: "14px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", transition: "background-color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}