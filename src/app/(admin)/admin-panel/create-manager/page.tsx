"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateManagerPage() {
  const router = useRouter();

  // State quản lý Form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    companyId: "",
  });

  // State trạng thái UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 1. LẤY TOKEN TỪ LOCALSTORAGE
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage({
        type: "error",
        text: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
      });
      setLoading(false);
      return;
    }

    try {
      // Chuẩn hóa dữ liệu: Làm sạch khoảng trắng và chuyển companyId trống thành null
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        companyId: formData.companyId.trim() ? formData.companyId.trim() : null,
      };

      // 2. GỬI YÊU CẦU API VỚI HEADER AUTHORIZATION
      const response = await fetch("/api/admin/create-manager", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra khi tạo tài khoản!");
      }

      // Thông báo thành công và reset form
      setMessage({
        type: "success",
        text: data.message || "Tạo tài khoản Manager và gửi email thành công!",
      });

      setFormData({
        fullName: "",
        email: "",
        dateOfBirth: "",
        companyId: "",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Không thể kết nối đến máy chủ!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid #f1f5f9",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
          Cấp Tài Khoản Manager
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
          Hệ thống sẽ tự động tạo mật khẩu ngẫu nhiên và gửi thông tin đăng nhập đến email của Quản lý.
        </p>

        {/* Thông báo Thành công / Thất bại */}
        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
              color: message.type === "success" ? "#15803d" : "#b91c1c",
              border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Họ và tên */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Họ và tên <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Địa chỉ Email <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="manager@company.com"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Ngày sinh */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Ngày sinh <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              required
              value={formData.dateOfBirth}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Mã Công ty - CÓ THỂ BỎ TRỐNG */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Mã Công ty (Company ID){" "}
              <span style={{ color: "#94a3b8", fontWeight: "400", fontSize: "12px" }}>
                (Không bắt buộc - Có thể bỏ trống)
              </span>
            </label>
            <input
              type="text"
              name="companyId"
              placeholder="Nhập Mã công ty nếu có (Để trống nếu chưa có)"
              value={formData.companyId}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "10px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: loading ? "#9ca3af" : "#10b981",
              color: "#ffffff",
              border: "none",
              fontWeight: "600",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "Đang xử lý..." : "Tạo Tài Khoản & Gửi Mail"}
          </button>
        </form>
      </div>
    </div>
  );
}