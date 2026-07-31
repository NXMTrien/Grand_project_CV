"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const systemNameLeft = "Grand";
  const systemNameRight = "Job";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      console.log("👉 Response từ API Login:", data);

      // Nếu tài khoản bị khóa (status 403) hoặc sai mật khẩu (status 401),
      // data.message từ backend sẽ được ném ra và hiển thị ở khung errorBox
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");

      const token = data.token || data.accessToken || data.data?.token;
      const user = data.user || data.data?.user;

      if (!token) {
        console.error("❌ Không tìm thấy Token trong response API!", data);
        throw new Error("Không nhận được mã xác thực (Token) từ hệ thống");
      }

      // Lưu vào LocalStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert(`Chào mừng quay trở lại, ${user?.fullName || user?.name || "Bạn"}!`);

      // Chuyển hướng trang
      window.location.href = "/";
    } catch (err: any) {
      console.error("❌ Lỗi Đăng Nhập:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName: string) => {
    const isFocused = focusedField === fieldName;
    return {
      width: "100%",
      padding: "12px 16px",
      border: isFocused ? "1.5px solid #10b981" : "1.5px solid #e2e8f0",
      borderRadius: "10px",
      outline: "none",
      fontSize: "14px",
      color: "#0f172a",
      backgroundColor: isFocused ? "#ffffff" : "#f8fafc",
      boxShadow: isFocused ? "0 0 0 4px rgba(16, 185, 129, 0.12)" : "none",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      boxSizing: "border-box" as const,
    };
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        {/* LOGO & TIÊU ĐỀ */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h2 style={styles.title}>
            Đăng nhập{" "}
            <span style={{ color: "#0f172a" }}>
              {systemNameLeft}
              {systemNameRight}
            </span>
          </h2>
          <p style={styles.subtitle}>
            Nhập thông tin tài khoản của bạn để tiếp tục
          </p>
        </div>

        {/* CẢNH BÁO LỖI (Hiển thị khi sai pass hoặc khi bị KHÓA TÀI KHOẢN) */}
        {error && (
          <div style={styles.errorBox}>
            <span style={{ marginRight: "8px", flexShrink: 0 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* INPUT FIELDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={styles.label}>Địa chỉ Email</label>
            <input
              type="email"
              required
              placeholder="nhapemail@example.com"
              style={getInputStyle("email")}
              value={email}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={styles.label}>Mật khẩu</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              style={getInputStyle("password")}
              value={password}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* QUÊN MẬT KHẨU */}
        <div style={{ textAlign: "right", marginTop: "14px" }}>
          <Link
            href="/forgot-password"
            onMouseEnter={() => setIsForgotHovered(true)}
            onMouseLeave={() => setIsForgotHovered(false)}
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: isForgotHovered ? "#047857" : "#10b981",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* NÚT SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          style={{
            width: "100%",
            marginTop: "28px",
            backgroundColor: loading
              ? "#cbd5e1"
              : isButtonHovered
              ? "#059669"
              : "#10b981",
            color: "#ffffff",
            padding: "14px",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "15px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            boxShadow:
              isButtonHovered && !loading
                ? "0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -4px rgba(16, 185, 129, 0.2)"
                : "0 4px 6px -1px rgba(16, 185, 129, 0.1)",
          }}
        >
          {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center", // Sửa từ 'justify' thành 'justifyContent'
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    padding: "20px 16px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    padding: "40px 32px",
    borderRadius: "20px",
    boxShadow:
      "0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.02)",
    border: "1px solid #f1f5f9",
    margin: "auto",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#10b981",
    marginBottom: "6px",
    marginTop: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "8px",
  },
  errorBox: {
    marginBottom: "20px",
    padding: "12px 16px",
    fontSize: "13.5px",
    color: "#991b1b",
    backgroundColor: "#fef2f2",
    borderRadius: "10px",
    border: "1px solid #fee2e2",
    display: "flex",
    alignItems: "center",
    lineHeight: "1.4",
  },
};