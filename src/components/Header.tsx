"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const systemNameLeft = "Grand";
  const systemNameRight = "Job";

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // 🔽 State điều khiển Menu thả xuống
  const [showAdminUserDropdown, setShowAdminUserDropdown] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

  // 🔄 TẢI VÀ ĐỒNG BỘ THÔNG TIN USER / TOKEN
  const loadAuthData = () => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setToken(storedToken);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Lỗi parse user từ localStorage:", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadAuthData();

    const handleStorageChange = () => loadAuthData();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleStorageChange);
    };
  }, []);

  // 🚪 XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setShowProfileDropdown(false);

    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/login";
  };

  // 🏷️ ÁP DỤNG ĐỔI TÊN ROLE HIỂN THỊ DỄ HIỂU
  const getRoleDisplayName = (rawRole: string) => {
    if (!rawRole) return "Ứng viên";
    const roleUpper = rawRole.toUpperCase();

    switch (roleUpper) {
      case "ADMIN":
        return "Quản trị viên";
      case "MANAGER":
      case "HR":
      case "COMPANY":
        return "Nhà tuyển dụng";
      case "CANDIDATE":
      default:
        return "Ứng viên";
    }
  };

  // 🎨 Style chung cho nav link
  const navLinkStyle = (id: string) => ({
    color: hoveredLink === id ? "#10b981" : "#4b5563",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 0",
    transition: "all 0.2s ease",
    borderBottom: `2px solid ${hoveredLink === id ? "#10b981" : "transparent"}`,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  });

  // 🛡️ CHUẨN HÓA KIỂM TRA ROLE BÊN TRONG CODE
  const rawRole = user?.role ? String(user.role).toLowerCase() : "";
  const isLoggedIn = Boolean(token && user);
  const roleDisplay = getRoleDisplayName(rawRole);
  const isManagerOrHR = rawRole === "hr" || rawRole === "company" || rawRole === "manager";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f3f4f6",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 32px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", width: "25%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span style={{ fontSize: "24px", fontWeight: "900", color: "#10b981", letterSpacing: "-0.05em" }}>
              {systemNameLeft}<span style={{ color: "#1e293b" }}>{systemNameRight}</span>
            </span>
            <div
              style={{
                backgroundColor: "#10b981",
                color: "#ffffff",
                padding: "6px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* MENU ĐIỀU HƯỚNG THEO ROLE */}
        <nav style={{ display: "flex", gap: "28px", width: "50%", justifyContent: "center", alignItems: "center" }}>
          <Link
            href="/"
            id="home"
            onMouseEnter={() => setHoveredLink("home")}
            onMouseLeave={() => setHoveredLink(null)}
            style={navLinkStyle("home")}
          >
            Trang chủ
          </Link>

          {/* 👑 ROLE: ADMIN */}
          {rawRole === "admin" && (
            <>
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => {
                  setShowAdminUserDropdown(true);
                  setHoveredLink("admin-users");
                }}
                onMouseLeave={() => {
                  setShowAdminUserDropdown(false);
                  setHoveredLink(null);
                }}
              >
                <div style={navLinkStyle("admin-users")}>
                  <span>Quản lý Người dùng</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    style={{
                      width: "14px",
                      height: "14px",
                      transform: showAdminUserDropdown ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

                {showAdminUserDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      backgroundColor: "#ffffff",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      borderRadius: "8px",
                      padding: "8px 0",
                      minWidth: "180px",
                      border: "1px solid #f1f5f9",
                      zIndex: 100,
                    }}
                  >
                    <Link
                      href="/admin-panel/user-manager"
                      style={{
                        display: "block",
                        padding: "8px 16px",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#334155",
                        textDecoration: "none",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0fdf4";
                        e.currentTarget.style.color = "#10b981";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#334155";
                      }}
                    >
                      Quản lý Khách hàng
                    </Link>
                    <Link
                      href="/admin-panel/create-manager"
                      style={{
                        display: "block",
                        padding: "8px 16px",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#334155",
                        textDecoration: "none",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0fdf4";
                        e.currentTarget.style.color = "#10b981";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#334155";
                      }}
                    >
                      Quản lý Manager
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/admin/companies"
                id="admin-companies"
                onMouseEnter={() => setHoveredLink("admin-companies")}
                onMouseLeave={() => setHoveredLink(null)}
                style={navLinkStyle("admin-companies")}
              >
                Quản lý Công ty
              </Link>
            </>
          )}

          {/* 🏢 ROLE: MANAGER / HR / COMPANY */}
          {isManagerOrHR && (
            <>
              <Link
                href="/hr/jobs"
                id="hr-jobs"
                onMouseEnter={() => setHoveredLink("hr-jobs")}
                onMouseLeave={() => setHoveredLink(null)}
                style={navLinkStyle("hr-jobs")}
              >
                Công việc
              </Link>
              <Link
                href="/hr/jobs/create"
                id="hr-create-job"
                onMouseEnter={() => setHoveredLink("hr-create-job")}
                onMouseLeave={() => setHoveredLink(null)}
                style={navLinkStyle("hr-create-job")}
              >
                Tạo công việc
              </Link>
              <Link
                href="/hr/company"
                id="hr-company"
                onMouseEnter={() => setHoveredLink("hr-company")}
                onMouseLeave={() => setHoveredLink(null)}
                style={navLinkStyle("hr-company")}
              >
                Công ty
              </Link>
              <Link
                href="/hr/applicants"
                id="hr-applicants"
                onMouseEnter={() => setHoveredLink("hr-applicants")}
                onMouseLeave={() => setHoveredLink(null)}
                style={navLinkStyle("hr-applicants")}
              >
                Kiểm tra Ứng viên
              </Link>
            </>
          )}

          {/* 🧑‍💼 ROLE: CANDIDATE / USER MẶC ĐỊNH */}
          {!isManagerOrHR && rawRole !== "admin" && (
            <>
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
            </>
          )}
        </nav>

        {/* THÔNG TIN KHÁCH / USER (DROPDOWN AVATAR) */}
        <div style={{ display: "flex", alignItems: "center", width: "25%", justifyContent: "flex-end" }}>
          {isLoggedIn ? (
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              {/* TRIGGER AVATAR & TÊN */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "20px",
                  transition: "background-color 0.2s",
                  backgroundColor: showProfileDropdown ? "#f8fafc" : "transparent",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
                  <span style={{ color: "#1e293b", fontWeight: "600", fontSize: "14px", lineHeight: 1.2 }}>
                    {user?.fullName || user?.name || "Tài khoản"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>
                    {roleDisplay}
                  </span>
                </div>

                {/* KHUNG ANH DAI DIEN */}
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16a34a",
                    border: "2px solid #bbf7d0",
                    overflow: "hidden",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* 🔽 MENU SỔ XUỐNG CỦA USER */}
              {showProfileDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    borderRadius: "12px",
                    padding: "8px 0",
                    minWidth: "210px",
                    border: "1px solid #f1f5f9",
                    zIndex: 100,
                  }}
                >
                  {/* Header trong Dropdown */}
                  <div style={{ padding: "8px 16px", borderBottom: "1px solid #f1f5f9", marginBottom: "4px" }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                      {user?.fullName || user?.name}
                    </p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                      {user?.email || "Chưa cập nhật email"}
                    </p>
                  </div>

                  {/* Link Trang cá nhân */}
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#334155",
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0fdf4";
                      e.currentTarget.style.color = "#10b981";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#334155";
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    Trang cá nhân
                  </Link>

                  {/* Link Tạo công ty mới (Chỉ hiện cho Manager / HR / Company) */}
                  {isManagerOrHR && (
                    <Link
                      href="/hr/company/create"
                      onClick={() => setShowProfileDropdown(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 16px",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#334155",
                        textDecoration: "none",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0fdf4";
                        e.currentTarget.style.color = "#10b981";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#334155";
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5A2.25 2.25 0 0 0 18 8.25H6a2.25 2.25 0 0 0-2.25 2.25V21" />
                      </svg>
                      Tạo công ty mới
                    </Link>
                  )}

                  {/* Nút Đăng xuất */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#ef4444",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fef2f2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                href="/login"
                onMouseEnter={() => setHoveredLink("login")}
                onMouseLeave={() => setHoveredLink(null)}
                style={{
                  color: hoveredLink === "login" ? "#10b981" : "#4b5563",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                style={{
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#047857")}
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