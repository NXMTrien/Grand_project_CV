"use client";

import { useState } from "react";
import { useAlert } from "@/src/components/AlertProvider";

export default function CreateManagerPage() {
  const { showAlert } = useAlert();

  // State quản lý Form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    birthYear: "",
    companyId: "",
  });

  // State trạng thái UI
  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.name === "birthYear"
        ? e.target.value.replace(/\D/g, "").slice(0, 4)
        : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      await showAlert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        birthYear: formData.birthYear,
        companyId: formData.companyId.trim() ? formData.companyId.trim() : null,
      };

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

      await showAlert(data.message || "Tạo tài khoản Manager và gửi email thành công!");

      setFormData({
        fullName: "",
        email: "",
        birthYear: "",
        companyId: "",
      });
    } catch (err: unknown) {
      await showAlert(
        err instanceof Error ? err.message : "Không thể kết nối đến máy chủ!"
      );
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

          {/* Năm sinh */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Năm sinh <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="birthYear"
              required
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              title="Vui lòng nhập năm sinh gồm 4 chữ số"
              placeholder="Ví dụ: 1995"
              value={formData.birthYear}
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