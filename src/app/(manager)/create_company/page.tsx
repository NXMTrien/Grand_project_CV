"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface CompanyItem {
  _id: string;
  name: string;
  logo?: string;
  website?: string;
  scale?: string;
  address?: string;
  description?: string;
  images?: string[];
  createdAt?: string;
}

export default function CreateCompanyPage() {
  const router = useRouter();

  // State quản lý danh sách công ty của tôi
  const [myCompanies, setMyCompanies] = useState<CompanyItem[]>([]);
  const [fetchingCompanies, setFetchingCompanies] = useState(true);

  // State Form Tạo công ty mới
  const [formData, setFormData] = useState({
    name: "",
    logo: "", // Base64 String
    website: "",
    address: "",
    scale: "10-50 nhân viên",
    description: "",
  });
  const [imagesList, setImagesList] = useState<string[]>([]); // Mảng chứa Base64 String

  // State Modal Chỉnh Sửa Công Ty
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    logo: "",
    website: "",
    address: "",
    scale: "10-50 nhân viên",
    description: "",
  });
  const [editImagesList, setEditImagesList] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // UI General States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Helper chuyển đổi File sang Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 1. Hàm tải danh sách công ty do Manager tạo
  const fetchMyCompanies = useCallback(async (token: string) => {
    try {
      setFetchingCompanies(true);
      const res = await fetch("/api/companies/my-company", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setMyCompanies(result.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách công ty:", err);
    } finally {
      setFetchingCompanies(false);
    }
  }, []);

  // 2. Kiểm tra Authentication & Role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      alert("Vui lòng đăng nhập trước!");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "MANAGER") {
        alert("Chức năng này chỉ dành cho tài khoản Nhà tuyển dụng (MANAGER)!");
        router.push("/");
        return;
      }
      fetchMyCompanies(token);
    } catch {
      router.push("/login");
    }
  }, [router, fetchMyCompanies]);

  // Handle Input Text Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Upload Logo (Form Tạo)
  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData((prev) => ({ ...prev, logo: base64 }));
      } catch (err) {
        console.error("Lỗi đọc file logo:", err);
      }
    }
  };

  // Handle Upload Multiple Images (Form Tạo)
  const handleImagesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - imagesList.length;
    if (remainingSlots <= 0) {
      alert("Bạn đã tải lên tối đa 5 hình ảnh!");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    try {
      const base64Promises = filesToProcess.map((file) => fileToBase64(file));
      const newImages = await Promise.all(base64Promises);
      setImagesList((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error("Lỗi đọc file hình ảnh:", err);
    }
  };

  const removeImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Form Tạo Công Ty Mới (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          images: imagesList,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tạo công ty thất bại");

      setSuccess("Tạo công ty thành công!");
      setFormData({
        name: "",
        logo: "",
        website: "",
        address: "",
        scale: "10-50 nhân viên",
        description: "",
      });
      setImagesList([]);
      fetchMyCompanies(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- MODAL EDIT & DELETE LOGIC ----------------

  const handleOpenEditModal = (comp: CompanyItem) => {
    setEditingCompany(comp);
    setModalError("");
    setEditFormData({
      name: comp.name || "",
      logo: comp.logo || "",
      website: comp.website || "",
      address: comp.address || "",
      scale: comp.scale || "10-50 nhân viên",
      description: comp.description || "",
    });
    setEditImagesList(comp.images || []);
  };

  const handleCloseModal = () => {
    setEditingCompany(null);
    setModalError("");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Handle Edit Logo Upload
  const handleEditLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setEditFormData((prev) => ({ ...prev, logo: base64 }));
      } catch (err) {
        console.error("Lỗi đọc file logo:", err);
      }
    }
  };

  // Handle Edit Multiple Images Upload
  const handleEditImagesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - editImagesList.length;
    if (remainingSlots <= 0) {
      alert("Bạn đã tải lên tối đa 5 hình ảnh!");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    try {
      const base64Promises = filesToProcess.map((file) => fileToBase64(file));
      const newImages = await Promise.all(base64Promises);
      setEditImagesList((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error("Lỗi đọc file hình ảnh:", err);
    }
  };

  const removeEditImage = (index: number) => {
    setEditImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  // Cập nhật công ty (PATCH)
  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    setEditLoading(true);
    setModalError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setModalError("Phiên đăng nhập hết hạn!");
      setEditLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/companies/my-company?id=${editingCompany._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editFormData,
          images: editImagesList,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại!");

      setSuccess("Cập nhật thông tin công ty thành công!");
      handleCloseModal();
      fetchMyCompanies(token);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Xóa công ty (DELETE)
  const handleDeleteCompany = async () => {
    if (!editingCompany) return;

    const isConfirmed = confirm(
      `Bạn có chắc chắn muốn xóa công ty "${editingCompany.name}"? Hành động này không thể hoàn tác!`
    );
    if (!isConfirmed) return;

    setDeleteLoading(true);
    setModalError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setModalError("Phiên đăng nhập hết hạn!");
      setDeleteLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/companies/my-company?id=${editingCompany._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xóa thất bại!");

      setSuccess("Đã xóa công ty thành công!");
      handleCloseModal();
      fetchMyCompanies(token);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setDeleteLoading(false);
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

  const isMaxLimitReached = myCompanies.length >= 2;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* 1. KHỐI FORM TẠO CÔNG TY */}
        <div style={styles.card}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h2 style={styles.title}>Tạo công ty mới</h2>
            <p style={styles.subtitle}>Thiết lập hồ sơ doanh nghiệp của bạn để bắt đầu đăng tin tuyển dụng</p>
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

          {isMaxLimitReached ? (
            <div style={styles.limitWarningBox}>
              🚫 <strong>Bạn đã đạt giới hạn tối đa 2 công ty.</strong> Nếu muốn thêm công ty mới, vui lòng liên hệ Ban quản trị hoặc xóa bớt công ty cũ bên dưới.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Tên công ty */}
              <div>
                <label style={styles.label}>
                  Tên công ty <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="VD: Tập đoàn Công nghệ GrandJob"
                  style={getInputStyle("name")}
                  value={formData.name}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                />
              </div>

              {/* Quy mô & Website */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={styles.label}>Quy mô nhân sự</label>
                  <select
                    name="scale"
                    style={getInputStyle("scale")}
                    value={formData.scale}
                    onFocus={() => setFocusedField("scale")}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                  >
                    <option value="1-10 nhân viên">1-10 nhân viên</option>
                    <option value="10-50 nhân viên">10-50 nhân viên</option>
                    <option value="50-100 nhân viên">50-100 nhân viên</option>
                    <option value="100-500 nhân viên">100-500 nhân viên</option>
                    <option value="500+ nhân viên">500+ nhân viên</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Website công ty</label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://example.com"
                    style={getInputStyle("website")}
                    value={formData.website}
                    onFocus={() => setFocusedField("website")}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label style={styles.label}>
                  Địa chỉ trụ sở <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="VD: Tầng 5, Tòa nhà Landmark 81, Bình Thạnh, TP.HCM"
                  style={getInputStyle("address")}
                  value={formData.address}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                />
              </div>

              {/* Upload Logo từ máy */}
              <div>
                <label style={styles.label}>Logo công ty</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ ...getInputStyle("logo"), flex: 1, padding: "8px 12px" }}
                  />
                  {formData.logo && (
                    <div style={{ position: "relative" }}>
                      <img
                        src={formData.logo}
                        alt="Logo Preview"
                        style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0" }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                        style={styles.removeSmallBtn}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mô tả công ty */}
              <div>
                <label style={styles.label}>
                  Mô tả chi tiết <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Giới thiệu về tầm nhìn, sứ mệnh và môi trường làm việc..."
                  style={{ ...getInputStyle("description"), resize: "vertical" }}
                  value={formData.description}
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                />
              </div>

              {/* Upload Hình ảnh hoạt động từ máy */}
              <div>
                <label style={styles.label}>
                  Hình ảnh văn phòng / Môi trường ({imagesList.length}/5)
                </label>
                {imagesList.length < 5 && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesUpload}
                    style={{ ...getInputStyle("images"), padding: "8px 12px", marginBottom: "12px" }}
                  />
                )}

                {/* Danh sách ảnh Preview */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginTop: "8px" }}>
                  {imagesList.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", width: "100%", paddingTop: "100%" }}>
                      <img
                        src={img}
                        alt={`Preview ${idx}`}
                        style={{ width: "100%", height: "70px", borderRadius: "8px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={styles.removeSmallBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  marginTop: "12px",
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
                {loading ? "Đang tạo công ty..." : "Tạo công ty ngay"}
              </button>
            </form>
          )}
        </div>

        {/* 2. KHỐI HIỂN THỊ DANH SÁCH CÔNG TY ĐÃ TẠO */}
        <div style={styles.myCompaniesCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>
              Công ty của bạn ({myCompanies.length}/2)
            </h3>
            {isMaxLimitReached && (
              <span style={styles.badgeLimit}>Đã đạt giới hạn tối đa</span>
            )}
          </div>

          {fetchingCompanies ? (
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Đang tải danh sách công ty...</p>
          ) : myCompanies.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Bạn chưa tạo công ty nào. Hãy điền form bên trên để tạo công ty đầu tiên!
            </p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {myCompanies.map((comp) => (
                <div key={comp._id} style={styles.companyItem}>
                  <img
                    src={comp.logo || "https://via.placeholder.com/50?text=Logo"}
                    alt={comp.name}
                    style={styles.companyItemLogo}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#0f172a" }}>{comp.name}</h4>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                      📍 {comp.address || "Chưa cập nhật"} • 👥 {comp.scale}
                    </p>
                  </div>

                  {/* Nút Chỉnh sửa Mở Modal */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(comp)}
                    style={styles.editBtn}
                  >
                    ✏️ Chỉnh sửa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL CHỈNH SỬA & XÓA CÔNG TY */}
      {editingCompany && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>
                Chỉnh sửa công ty
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div style={styles.errorBox}>
                <span style={{ marginRight: "8px" }}>⚠️</span>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCompany} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Tên công ty */}
              <div>
                <label style={styles.label}>Tên công ty *</label>
                <input
                  type="text"
                  name="name"
                  required
                  style={getInputStyle("edit_name")}
                  value={editFormData.name}
                  onChange={handleEditChange}
                />
              </div>

              {/* Quy mô & Website */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={styles.label}>Quy mô nhân sự</label>
                  <select
                    name="scale"
                    style={getInputStyle("edit_scale")}
                    value={editFormData.scale}
                    onChange={handleEditChange}
                  >
                    <option value="1-10 nhân viên">1-10 nhân viên</option>
                    <option value="10-50 nhân viên">10-50 nhân viên</option>
                    <option value="50-100 nhân viên">50-100 nhân viên</option>
                    <option value="100-500 nhân viên">100-500 nhân viên</option>
                    <option value="500+ nhân viên">500+ nhân viên</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Website</label>
                  <input
                    type="url"
                    name="website"
                    style={getInputStyle("edit_website")}
                    value={editFormData.website}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label style={styles.label}>Địa chỉ trụ sở *</label>
                <input
                  type="text"
                  name="address"
                  required
                  style={getInputStyle("edit_address")}
                  value={editFormData.address}
                  onChange={handleEditChange}
                />
              </div>

              {/* Upload Edit Logo */}
              <div>
                <label style={styles.label}>Logo công ty</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditLogoUpload}
                    style={{ ...getInputStyle("edit_logo"), flex: 1, padding: "8px 12px" }}
                  />
                  {editFormData.logo && (
                    <div style={{ position: "relative" }}>
                      <img
                        src={editFormData.logo}
                        alt="Logo Preview"
                        style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0" }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditFormData((prev) => ({ ...prev, logo: "" }))}
                        style={styles.removeSmallBtn}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label style={styles.label}>Mô tả chi tiết *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  style={{ ...getInputStyle("edit_description"), resize: "vertical" }}
                  value={editFormData.description}
                  onChange={handleEditChange}
                />
              </div>

              {/* Upload Edit Hình ảnh văn phòng */}
              <div>
                <label style={styles.label}>
                  Hình ảnh môi trường ({editImagesList.length}/5)
                </label>
                {editImagesList.length < 5 && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditImagesUpload}
                    style={{ ...getInputStyle("edit_images"), padding: "8px 12px", marginBottom: "12px" }}
                  />
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginTop: "8px" }}>
                  {editImagesList.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", width: "100%" }}>
                      <img
                        src={img}
                        alt={`Edit Preview ${idx}`}
                        style={{ width: "100%", height: "70px", borderRadius: "8px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeEditImage(idx)}
                        style={styles.removeSmallBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Action Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                {/* Nút Xóa Công Ty (DELETE) */}
                <button
                  type="button"
                  onClick={handleDeleteCompany}
                  disabled={deleteLoading || editLoading}
                  style={styles.deleteBtn}
                >
                  {deleteLoading ? "Đang xóa..." : "🗑️ Xóa công ty"}
                </button>

                {/* Nút Hủy */}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={styles.cancelBtn}
                >
                  Hủy
                </button>

                {/* Nút Lưu Cập Nhật (PATCH) */}
                <button
                  type="submit"
                  disabled={editLoading || deleteLoading}
                  style={styles.saveBtn}
                >
                  {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    maxWidth: "580px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  myCompaniesCard: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.03)",
  },
  companyItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  companyItemLogo: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    objectFit: "cover" as const,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
  },
  editBtn: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  badgeLimit: {
    fontSize: "12px",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    padding: "4px 8px",
    borderRadius: "6px",
    fontWeight: "600",
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
  limitWarningBox: {
    padding: "16px",
    backgroundColor: "#fff7ed",
    color: "#c2410c",
    borderRadius: "12px",
    border: "1px solid #ffedd5",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    width: "100%",
    maxWidth: "580px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#64748b",
  },
  deleteBtn: {
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fee2e2",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "12px 16px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    marginLeft: "auto",
  },
  saveBtn: {
    padding: "12px 20px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  removeSmallBtn: {
    position: "absolute" as const,
    top: "-6px",
    right: "-6px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};