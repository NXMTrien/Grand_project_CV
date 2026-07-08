"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  // Đồng bộ tên hệ thống
  const systemNameLeft = "Grand";
  const systemNameRight = "Job";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State quản lý hiệu ứng giao diện
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isForgotHovered, setIsForgotHovered] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");

      // Lưu Token vào LocalStorage để duy trì trạng thái đăng nhập
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(`Chào mừng quay trở lại, ${data.user.fullName}!`);
      
      // Điều hướng về trang chủ sau khi đăng nhập thành công
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm tạo style cho các ô input khi được focus
  const inputStyle = (fieldName: string) => ({
    width: "100%",
    padding: "10px 14px",
    border: focusedField === fieldName ? "1px solid #10b981" : "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    color: "#1e293b",
    boxShadow: focusedField === fieldName ? "0 0 0 3px rgba(16, 185, 129, 0.15)" : "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box" as const,
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "0 16px", fontFamily: "sans-serif" }}>
      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "440px", backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", border: "1px solid #f1f5f9" }}>
        
        {/* TIÊU ĐỀ FORM */}
        <h2 style={{ fontSize: "24px", fontWeight: "700", textAlign: "center", color: "#10b981", marginBottom: "24px", marginTop: 0 }}>
          Đăng nhập <span style={{ color: "#1e293b" }}>{systemNameLeft}{systemNameRight}</span>
        </h2>

        {/* HIỂN THỊ THÔNG BÁO LỖI */}
        {error && (
          <div style={{ marginBottom: "16px", padding: "12px", fontSize: "14px", color: "#b91c1c", backgroundColor: "#fef2f2", borderRadius: "8px", border: "1px solid #fee2e2" }}>
            {error}
          </div>
        )}

        {/* KHU VỰC Ô NHẬP LIỆU */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Ô Email */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Email</label>
            <input 
              type="email" 
              required 
              style={inputStyle("email")}
              value={email} 
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {/* Ô Mật khẩu */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Mật khẩu</label>
            <input 
              type="password" 
              required 
              style={inputStyle("password")}
              value={password} 
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </div>

        {/* QUÊN MẬT KHẨU */}
        <div style={{ textAlign: "right", marginTop: "12px" }}>
          <Link 
            href="/forgot-password" 
            onMouseEnter={() => setIsForgotHovered(true)}
            onMouseLeave={() => setIsForgotHovered(false)}
            style={{ 
              fontSize: "13px", 
              color: isForgotHovered ? "#059669" : "#10b981", 
              textDecoration: isForgotHovered ? "underline" : "none",
              transition: "color 0.2s" 
            }}
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* NÚT ĐĂNG NHẬP */}
        <button 
          type="submit" 
          disabled={loading} 
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          style={{ 
            width: "100%", 
            marginTop: "24px", 
            backgroundColor: loading ? "#cbd5e1" : (isButtonHovered ? "#059669" : "#10b981"), 
            color: "#ffffff", 
            padding: "12px", 
            borderRadius: "8px", 
            fontWeight: "600", 
            fontSize: "16px", 
            border: "none", 
            cursor: loading ? "not-allowed" : "pointer", 
            transition: "background-color 0.2s ease",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
          }}
        >
          {loading ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}