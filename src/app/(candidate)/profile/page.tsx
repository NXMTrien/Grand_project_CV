"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Camera,
  ArrowLeft,
  Clock,
  Upload,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string;
  dateOfBirth?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Tab hiện tại: "profile" | "password"
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Ref cho Input File ẩn
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State Form Hồ sơ
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    avatar: "",
  });

  // State Form Đổi mật khẩu
  const [pwdData, setPwdData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdLoading, setPwdLoading] = useState<boolean>(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState<boolean>(false);
  const [showNewPwd, setShowNewPwd] = useState<boolean>(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState<boolean>(false);

  // Thông báo chung
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  // Thông báo riêng cho Đổi mật khẩu
  const [pwdMsg, setPwdMsg] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  // 1. Tải thông tin cá nhân
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setStatusMsg({ type: null, text: "" });

    try {
      if (typeof window === "undefined") return;

      let token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            token = parsed.token || parsed.accessToken;
          } catch (e) {
            console.error("Lỗi parse user storage:", e);
          }
        }
      }

      if (!token) {
        throw new Error("Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại!");
      }

      const res = await fetch("/api/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Không thể lấy thông tin cá nhân.");
      }

      const userData = result.data;
      setUser(userData);

      let formattedDOB = "";
      if (userData.dateOfBirth) {
        formattedDOB = new Date(userData.dateOfBirth)
          .toISOString()
          .split("T")[0];
      }

      setFormData({
        fullName: userData.fullName || "",
        phone: userData.phone || "",
        dateOfBirth: formattedDOB,
        avatar: userData.avatar || "",
      });
    } catch (err: any) {
      console.error("Lỗi fetchProfile:", err);
      setStatusMsg({
        type: "error",
        text: err.message || "Đã xảy ra lỗi khi tải hồ sơ.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 📷 Xử lý chọn và đọc file ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setStatusMsg({
        type: "error",
        text: "Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 3MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, avatar: base64String }));
    };
    reader.readAsDataURL(file);
  };

  // 2. Cập nhật thông tin Hồ sơ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: null, text: "" });

    try {
      let token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          token = parsed.token || parsed.accessToken;
        }
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Cập nhật thông tin thất bại!");
      }

      setUser(result.data);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...parsed, ...result.data })
        );
        window.dispatchEvent(new Event("auth-change"));
      }

      setIsEditing(false);
      setStatusMsg({
        type: "success",
        text: "Cập nhật thông tin cá nhân thành công!",
      });
    } catch (err: any) {
      console.error("Lỗi submit profile:", err);
      setStatusMsg({
        type: "error",
        text: err.message || "Đã xảy ra lỗi khi lưu thông tin.",
      });
    } finally {
      setSaving(false);
    }
  };

  // 🔑 3. Xử lý Đổi Mật Khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg({ type: null, text: "" });

    // Validate mật khẩu phía Client
    if (pwdData.newPassword.length < 6) {
      setPwdMsg({
        type: "error",
        text: "Mật khẩu mới phải chứa ít nhất 6 ký tự!",
      });
      return;
    }

    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdMsg({
        type: "error",
        text: "Xác nhận mật khẩu mới không trùng khớp!",
      });
      return;
    }

    setPwdLoading(true);

    try {
      let token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          token = parsed.token || parsed.accessToken;
        }
      }

      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: pwdData.currentPassword,
          newPassword: pwdData.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Đổi mật khẩu thất bại!");
      }

      setPwdMsg({
        type: "success",
        text: result.message || "Đổi mật khẩu thành công!",
      });

      // Reset form sau khi đổi thành công
      setPwdData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Lỗi changePassword:", err);
      setPwdMsg({
        type: "error",
        text: err.message || "Đã xảy ra lỗi khi đổi mật khẩu.",
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      let formattedDOB = "";
      if (user.dateOfBirth) {
        formattedDOB = new Date(user.dateOfBirth).toISOString().split("T")[0];
      }
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        dateOfBirth: formattedDOB,
        avatar: user.avatar || "",
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <span>Đang tải thông tin hồ sơ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Nút quay lại */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
        </div>

        {/* BỘ CHỌN TABS LỰA CHỌN */}
        <div className="flex bg-slate-200/70 p-1.5 rounded-2xl max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => {
              setActiveTab("profile");
              setPwdMsg({ type: null, text: "" });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Trang cá nhân</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("password");
              setIsEditing(false);
              setStatusMsg({ type: null, text: "" });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "password"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* THÔNG BÁO HỒ SƠ */}
            {statusMsg.type && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs transition ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {statusMsg.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
                <button
                  onClick={() => setStatusMsg({ type: null, text: "" })}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* CARD HỒ SƠ CHÍNH */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Banner Header */}
              <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-700 relative flex justify-end p-4">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="h-fit inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-800 font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer backdrop-blur-xs"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-600" /> Chỉnh sửa
                  </button>
                )}
              </div>

              {/* Avatar & Header Info */}
              <div className="px-6 pb-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-6 gap-4">
                  <div className="relative group self-start sm:self-auto">
                    <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-md relative overflow-hidden">
                      {formData.avatar || user?.avatar ? (
                        <img
                          src={isEditing ? formData.avatar : user?.avatar}
                          alt={user?.fullName || "Avatar"}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-emerald-600 text-white font-bold text-3xl flex items-center justify-center">
                          {user?.fullName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}

                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-1.5 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-90 hover:opacity-100 transition cursor-pointer"
                        >
                          <Camera className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-bold uppercase">
                            Đổi ảnh
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 sm:ml-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {user?.fullName || "Chưa cập nhật"}
                    </h1>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      ID: {user?._id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {user?.role || "USER"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        user?.status === "ACTIVE"
                          ? "bg-slate-50 text-slate-700 border-slate-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {user?.status || "ACTIVE"}
                    </span>
                  </div>
                </div>

                {/* FORM HOẶC HIỂN THỊ THÔNG TIN HỒ SƠ */}
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Họ và tên */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                          Họ và tên
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                          />
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>

                      {/* Số điện thoại */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                          Số điện thoại
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium font-mono"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>

                      {/* Ngày sinh */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                          Ngày sinh
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                              })
                            }
                          />
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>

                      {/* Tải ảnh từ máy */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                          Ảnh đại diện
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm border border-slate-200 transition cursor-pointer"
                          >
                            <Upload className="w-4 h-4 text-emerald-600" />
                            <span>Tải ảnh từ máy</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
                        <Mail className="w-4 h-4 text-slate-500" /> Email
                      </div>
                      <p className="text-slate-900 font-semibold text-sm break-all">
                        {user?.email || "Chưa cập nhật"}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
                        <Phone className="w-4 h-4 text-slate-500" /> Số điện thoại
                      </div>
                      <p className="text-slate-900 font-semibold text-sm font-mono">
                        {user?.phone || "Chưa cập nhật"}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
                        <Calendar className="w-4 h-4 text-slate-500" /> Ngày sinh
                      </div>
                      <p className="text-slate-900 font-semibold text-sm">
                        {user?.dateOfBirth
                          ? new Date(user.dateOfBirth).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Chưa cập nhật"}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
                        <Clock className="w-4 h-4 text-slate-500" /> Ngày gia nhập
                      </div>
                      <p className="text-slate-900 font-semibold text-sm">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KHU VỰC ĐỔI MẬT KHẨU */}
        {activeTab === "password" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Thiết lập mật khẩu mới
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Cập nhật mật khẩu định kỳ giúp tài khoản của bạn an toàn hơn.
                </p>
              </div>
            </div>

            {/* Thông báo riêng cho phần mật khẩu */}
            {pwdMsg.type && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between mb-6 ${
                  pwdMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {pwdMsg.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{pwdMsg.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPwdMsg({ type: null, text: "" })}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* FORM ĐỔI MẬT KHẨU */}
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-4 max-w-xl">
                {/* Mật khẩu hiện tại */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                      value={pwdData.currentPassword}
                      onChange={(e) =>
                        setPwdData({
                          ...pwdData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                      value={pwdData.newPassword}
                      onChange={(e) =>
                        setPwdData({
                          ...pwdData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nhập lại mật khẩu mới */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                      value={pwdData.confirmPassword}
                      onChange={(e) =>
                        setPwdData({
                          ...pwdData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-start">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {pwdLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  <span>
                    {pwdLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}