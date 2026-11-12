"use client";

import { useEffect, useState } from "react";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  skills: string[];
  createdAt?: string;
}

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [name, setName] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Lấy danh sách danh mục hiện có
  const fetchCategories = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Xử lý gửi Form tạo Danh mục
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 1. Tải Token từ localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập tài khoản Admin!" });
      return;
    }

    if (!name.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập tên danh mục!" });
      return;
    }

    // Chuyển chuỗi kỹ năng cách nhau bằng dấu phẩy thành mảng
    const skillsArray = skillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    try {
      setLoading(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Gửi Token qua Authorization Header
        },
        body: JSON.stringify({
          name: name.trim(),
          skills: skillsArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Tạo danh mục thất bại!");
      }

      setMessage({ type: "success", text: "Thêm danh mục thành công!" });
      setName("");
      setSkillsInput("");
      fetchCategories(); // Tải lại danh sách
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 24px", fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
          Quản lý Danh mục Ngành nghề
        </h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
          Thêm danh mục nghề nghiệp mới và thiết lập các kỹ năng gợi ý liên quan.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "32px", alignItems: "start" }}>
        {/* FORM THÊM DANH MỤC */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>
            Tạo danh mục mới
          </h2>

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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
                Tên danh mục <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Công Nghệ Thông Tin"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
                Kỹ năng liên quan (cách nhau bởi dấu phẩy)
              </label>
              <textarea
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="VD: ReactJS, Node.js, TypeScript, MongoDB"
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: loading ? "#9ca3af" : "#10b981",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "14px",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {loading ? "Đang xử lý..." : "Tạo danh mục"}
            </button>
          </form>
        </div>

        {/* DANH SÁCH DANH MỤC HIỆN CÓ */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>
            Danh sách danh mục ({categories.length})
          </h2>

          {fetching ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>Đang tải danh sách...</p>
          ) : categories.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>Chưa có danh mục nào trên hệ thống.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                      {cat.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "12px",
                        backgroundColor: "#e2e8f0",
                        color: "#475569",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {cat.slug}
                    </span>
                  </div>

                  {cat.skills && cat.skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                      {cat.skills.map((skill, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: "12px",
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                            padding: "3px 10px",
                            borderRadius: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}