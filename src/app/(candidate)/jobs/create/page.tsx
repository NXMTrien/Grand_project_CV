"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Company {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function CreateJobPage() {
  const router = useRouter();

  // State lưu danh sách chọn
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchingInitialData, setFetchingInitialData] = useState(true);

  // State Form khớp 100% với Backend Route
  const [formData, setFormData] = useState({
    title: "",
    companyId: "",
    categoryId: "",
    jobType: "Full-time",
    location: "",
    salaryType: "Negotiable", // "Negotiable" | "Range"
    salaryMin: "",
    salaryMax: "",
    experience: "1-3 năm",
    deadline: "",
    description: "",
    requirements: "",
    benefits: "",
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // 1. Kiểm tra Token từ localStorage và Tải danh sách Công ty + Danh mục
  const fetchInitialData = useCallback(async (token: string) => {
    try {
      setFetchingInitialData(true);

      const [resCompanies, resCategories] = await Promise.all([
        fetch("/api/companies/my-company", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/categories"),
      ]);

      const dataCompanies = await resCompanies.json();
      const dataCategories = await resCategories.json();

      if (resCompanies.ok && dataCompanies.success) {
        const compList = dataCompanies.data || [];
        setCompanies(compList);
        if (compList.length > 0) {
          setFormData((prev) => ({ ...prev, companyId: compList[0]._id }));
        }
      }

      if (resCategories.ok) {
        const catList = Array.isArray(dataCategories)
          ? dataCategories
          : dataCategories.data || [];
        setCategories(catList);
        if (catList.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: catList[0]._id }));
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu cấu hình:", err);
    } finally {
      setFetchingInitialData(false);
    }
  }, []);

  // 2. Auth Check khi Render
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      alert("Vui lòng đăng nhập trước khi thực hiện thao tác này!");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "MANAGER") {
        alert("Quyền truy cập bị từ chối! Chỉ Nhà tuyển dụng (MANAGER) mới được đăng tin.");
        router.push("/");
        return;
      }
      fetchInitialData(token);
    } catch {
      router.push("/login");
    }
  }, [router, fetchInitialData]);

  // Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 3. Xử lý Gửi Form lên Backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      return;
    }

    // Validation bổ sung ở Frontend
    if (
      !formData.title ||
      !formData.companyId ||
      !formData.categoryId ||
      !formData.location ||
      !formData.deadline ||
      !formData.description ||
      !formData.requirements ||
      !formData.benefits
    ) {
      setError("Vui lòng nhập đầy đủ tất cả các trường có đánh dấu (*)");
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị Payload chính xác theo Backend Schema
      const payload = {
        title: formData.title,
        companyId: formData.companyId,
        categoryId: formData.categoryId,
        jobType: formData.jobType,
        location: formData.location,
        experience: formData.experience,
        deadline: formData.deadline,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        salaryMin: formData.salaryType === "Range" ? Number(formData.salaryMin) || 0 : 0,
        salaryMax: formData.salaryType === "Range" ? Number(formData.salaryMax) || 0 : 0,
      };

      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Tạo bài đăng thất bại!");
      }

      setSuccess(data.message || "Đăng tin thành công! Bài viết đang chờ duyệt.");

      // Reset Form
      setFormData({
        title: "",
        companyId: companies[0]?._id || "",
        categoryId: categories[0]?._id || "",
        jobType: "Full-time",
        location: "",
        salaryType: "Negotiable",
        salaryMin: "",
        salaryMax: "",
        experience: "1-3 năm",
        deadline: "",
        description: "",
        requirements: "",
        benefits: "",
      });

      // Điều hướng chuyển trang sau 1.5s
      setTimeout(() => {
        router.push("/jobs");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName: string) => ({
    width: "100%",
    padding: "12px 16px",
    border: focusedField === fieldName ? "1.5px solid #10b981" : "1.5px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: focusedField === fieldName ? "#ffffff" : "#f8fafc",
    boxShadow: focusedField === fieldName ? "0 0 0 4px rgba(16, 185, 129, 0.12)" : "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box" as const,
  });

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h2 style={styles.title}>Đăng tin tuyển dụng mới</h2>
            <p style={styles.subtitle}>
              Hoàn tất thông tin chi tiết bên dưới để tạo bài tuyển dụng gửi kiểm duyệt
            </p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={{ marginRight: "8px", flexShrink: 0 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.successBox}>
              <span style={{ marginRight: "8px", flexShrink: 0 }}>✅</span>
              <span>{success}</span>
            </div>
          )}

          {fetchingInitialData ? (
            <p style={{ textAlign: "center", color: "#64748b", padding: "20px 0" }}>
              Đang tải danh mục dữ liệu...
            </p>
          ) : companies.length === 0 ? (
            <div style={styles.warningBox}>
              ⚠️ <strong>Chưa có công ty nào!</strong> Bạn cần sở hữu hoặc tạo công ty trước khi đăng bài tuyển dụng.
              <button
                type="button"
                onClick={() => router.push("/company/create")}
                style={styles.createCompanyBtn}
              >
                + Tạo công ty ngay
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Chọn Công ty & Danh mục */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={styles.label}>
                    Công ty tuyển dụng <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="companyId"
                    required
                    style={getInputStyle("companyId")}
                    value={formData.companyId}
                    onFocus={() => setFocusedField("companyId")}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                  >
                    {companies.map((comp) => (
                      <option key={comp._id} value={comp._id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.label}>
                    Danh mục ngành nghề <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="categoryId"
                    required
                    style={getInputStyle("categoryId")}
                    value={formData.categoryId}
                    onFocus={() => setFocusedField("categoryId")}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tiêu đề công việc */}
              <div>
                <label style={styles.label}>
                  Tiêu đề bài đăng <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="VD: Senior Node.js / React Developer"
                  style={getInputStyle("title")}
                  value={formData.title}
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                />
              </div>

              {/* Loại hình & Kinh nghiệm */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={styles.label}>Hình thức làm việc</label>
                  <select
                    name="jobType"
                    style={getInputStyle("jobType")}
                    value={formData.jobType}
                    onFocus={() => setFocusedField("jobType")}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                  >
                    <option value="Full-time">Toàn thời gian (Full-time)</option>
                    <option value="Part-time">Bán thời gian (Part-time)</option>
                    <option value="Remote">Làm việc từ xa (Remote)</option>
                    <option value="Hybrid">Linh hoạt (Hybrid)</option>
                    <option value="Internship">Thực tập sinh (Internship)</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>
                    Yêu cầu kinh nghiệm <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="experience"
                    required
                    style={getInputStyle("experience")}
                    value={formData.experience}
                    onFocus={() => setFocusedField("experience")}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                  >
                    <option value="Không yêu cầu">Không yêu cầu kinh nghiệm</option>
                    <option value="Dưới 1 năm">Dưới 1 năm</option>
                    <option value="1-3 năm">1 - 3 năm</option>
                    <option value="3-5 năm">3 - 5 năm</option>
                    <option value="Trên 5 năm">Trên 5 năm</option>
                  </select>
                </div>
              </div>

              {/* Địa điểm & Hạn nộp */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={styles.label}>
                    Địa điểm làm việc <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                    style={getInputStyle("location")}
                    value={formData.location}
                    onFocus={() => setFocusedField("location")}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Hạn nộp hồ sơ <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    style={getInputStyle("deadline")}
                    value={formData.deadline}
                    onFocus={() => setFocusedField("deadline")}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Mức lương */}
              <div>
                <label style={styles.label}>Mức lương tuyển dụng</label>
                <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="salaryType"
                      value="Negotiable"
                      checked={formData.salaryType === "Negotiable"}
                      onChange={handleChange}
                    />
                    Thỏa thuận
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="salaryType"
                      value="Range"
                      checked={formData.salaryType === "Range"}
                      onChange={handleChange}
                    />
                    Cụ thể (VNĐ)
                  </label>
                </div>

                {formData.salaryType === "Range" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <input
                      type="number"
                      name="salaryMin"
                      placeholder="Mức lương tối thiểu (VD: 15000000)"
                      style={getInputStyle("salaryMin")}
                      value={formData.salaryMin}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="salaryMax"
                      placeholder="Mức lương tối đa (VD: 25000000)"
                      style={getInputStyle("salaryMax")}
                      value={formData.salaryMax}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              {/* Mô tả công việc */}
              <div>
                <label style={styles.label}>
                  Mô tả công việc <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Mô tả công việc hàng ngày, nhiệm vụ cần đảm nhận..."
                  style={{ ...getInputStyle("description"), resize: "vertical" }}
                  value={formData.description}
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                />
              </div>

              {/* Yêu cầu ứng viên */}
              <div>
                <label style={styles.label}>
                  Yêu cầu ứng viên <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="requirements"
                  required
                  rows={3}
                  placeholder="Kỹ năng chuyên môn, trình độ học vấn, kinh nghiệm yêu cầu..."
                  style={{ ...getInputStyle("requirements"), resize: "vertical" }}
                  value={formData.requirements}
                  onFocus={() => setFocusedField("requirements")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                />
              </div>

              {/* Quyền lợi được hưởng */}
              <div>
                <label style={styles.label}>
                  Quyền lợi & Phụ cấp <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="benefits"
                  required
                  rows={3}
                  placeholder="Chế độ đãi ngộ, bảo hiểm, thưởng KPI, môi trường làm việc..."
                  style={{ ...getInputStyle("benefits"), resize: "vertical" }}
                  value={formData.benefits}
                  onFocus={() => setFocusedField("benefits")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  backgroundColor: loading ? "#cbd5e1" : "#10b981",
                  color: "#ffffff",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "15px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Đang gửi dữ liệu..." : "Tạo bài đăng tuyển dụng"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    alignItems: "flex-start",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    padding: "40px 16px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  wrapper: {
    width: "100%",
    maxWidth: "680px",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: "36px 32px",
    borderRadius: "20px",
    boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.02)",
    border: "1px solid #f1f5f9",
    boxSizing: "border-box" as const,
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "6px",
    marginTop: 0,
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
    marginBottom: "6px",
  },
  radioLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13.5px",
    color: "#475569",
    cursor: "pointer",
  },
  errorBox: {
    marginBottom: "18px",
    padding: "12px 16px",
    fontSize: "13.5px",
    color: "#991b1b",
    backgroundColor: "#fef2f2",
    borderRadius: "10px",
    border: "1px solid #fee2e2",
    display: "flex",
    alignItems: "center",
  },
  successBox: {
    marginBottom: "18px",
    padding: "12px 16px",
    fontSize: "13.5px",
    color: "#065f46",
    backgroundColor: "#ecfdf5",
    borderRadius: "10px",
    border: "1px solid #a7f3d0",
    display: "flex",
    alignItems: "center",
  },
  warningBox: {
    padding: "16px",
    backgroundColor: "#fff7ed",
    color: "#c2410c",
    borderRadius: "12px",
    border: "1px solid #ffedd5",
    fontSize: "14px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    alignItems: "flex-start",
  },
  createCompanyBtn: {
    backgroundColor: "#ea580c",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
};