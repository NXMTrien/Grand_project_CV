"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Users,
  ShieldCheck,
  UserCheck,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  Calendar,
  FilterX,
  Shield,
  UserX,
} from "lucide-react";

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "CANDIDATE" | "USER" | string;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt: string;
}

export default function UserManagerPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bộ lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modal Chi Tiết người dùng
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Tải danh sách người dùng từ API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

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
        throw new Error(
          "Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại!"
        );
      }

      const res = await fetch("/api/users/profile?all=true", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        }
        if (res.status === 403) {
          throw new Error(
            result.message ||
              "Bạn không có quyền truy cập danh sách tất cả người dùng!"
          );
        }
        throw new Error(
          result.message || `Lỗi tải dữ liệu (Mã lỗi: ${res.status})`
        );
      }

      let rawData: any[] = [];
      if (Array.isArray(result)) rawData = result;
      else if (Array.isArray(result.data)) rawData = result.data;
      else if (Array.isArray(result.users)) rawData = result.users;

      const mappedUsers: UserItem[] = rawData.map((item: any) => ({
        id: item._id?.toString() || item.userId || item.id || "N/A",
        fullName:
          item.fullName || item.name || item.username || "Chưa cập nhật",
        email: item.email || "N/A",
        phone: item.phone || item.phoneNumber || "N/A",
        role: (item.role || "USER").toUpperCase(),
        status: item.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("vi-VN")
          : "N/A",
      }));

      setUsers(mappedUsers);
    } catch (error: any) {
      console.error("Lỗi fetchUsers:", error);
      setErrorMsg(
        error.message || "Đã xảy ra lỗi khi tải danh sách người dùng."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Đóng modal bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset về trang 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // Reset các bộ lọc
  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  // Lọc danh sách người dùng
  const filteredUsers = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !cleanSearch ||
        user.fullName.toLowerCase().includes(cleanSearch) ||
        user.email.toLowerCase().includes(cleanSearch) ||
        user.phone.includes(cleanSearch) ||
        user.id.toLowerCase().includes(cleanSearch);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Phân trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Thống kê
  const totalUsers = users.length;
  const adminCount = useMemo(
    () => users.filter((u) => u.role === "ADMIN").length,
    [users]
  );
  const activeUsers = useMemo(
    () => users.filter((u) => u.status === "ACTIVE").length,
    [users]
  );

  // Style badge vai trò
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "MANAGER":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "STAFF":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "CANDIDATE":
        return "bg-teal-100 text-teal-700 border-teal-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Quản Lý Người Dùng
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                System Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Theo dõi, phân quyền và quản lý tài khoản người dùng hệ thống
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>{loading ? "Đang đồng bộ..." : "Làm mới dữ liệu"}</span>
          </button>
        </div>

        {/* THÔNG BÁO LỖI */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-rose-900">Có lỗi xảy ra!</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={fetchUsers}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* CARD THỐNG KÊ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Tổng Số Tài Khoản
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {totalUsers}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-all">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                Quản Trị Viên (Admin)
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1">
                {adminCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all">
            <div>
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                Đang Hoạt Động
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
                {activeUsers}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KHUNG DỮ LIỆU & BỘ LỌC */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* BỘ LỌC VÀ TÌM KIẾM */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-3 justify-between items-center">
            {/* Input Tìm Kiếm */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder-slate-400 font-medium"
                placeholder="Tìm tên, email, SĐT, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Lọc */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
              <select
                className="w-full sm:w-auto px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-semibold text-slate-700 transition"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="CANDIDATE">CANDIDATE</option>
                <option value="USER">USER</option>
                <option value="STAFF">STAFF</option>
              </select>

              <select
                className="w-full sm:w-auto px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-semibold text-slate-700 transition"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Khóa / Tạm dừng</option>
              </select>

              {(searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL") && (
                <button
                  onClick={resetFilters}
                  title="Xóa bộ lọc"
                  className="p-2.5 border border-slate-200 bg-white hover:bg-slate-100 hover:text-rose-600 text-slate-500 rounded-xl transition cursor-pointer shrink-0 active:scale-95"
                >
                  <FilterX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* BẢNG NGƯỜI DÙNG */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-24 text-center text-slate-400 text-sm flex flex-col justify-center items-center gap-3">
                <RefreshCw className="animate-spin text-indigo-600 w-8 h-8" />
                <span className="font-semibold text-slate-600">
                  Đang đồng bộ dữ liệu người dùng...
                </span>
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm font-medium flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700 mt-1">
                  Không tìm thấy người dùng phù hợp.
                </span>
                <p className="text-xs text-slate-400">
                  Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-2 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
                    <th className="px-5 py-3.5 whitespace-nowrap">Họ & Tên</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Email</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">SĐT</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Vai trò</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Trạng thái</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Ngày tạo</th>
                    <th className="px-5 py-3.5 whitespace-nowrap text-right">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {user.fullName}
                            </div>
                            <div className="font-mono text-xs text-slate-400">
                              ID:{" "}
                              {user.id.length > 8
                                ? `${user.id.substring(0, 8)}...`
                                : user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                        {user.email}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-slate-500">
                        {user.phone}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === "ACTIVE"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          ></span>
                          {user.status === "ACTIVE" ? "Hoạt động" : "Tạm khóa"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 text-xs font-medium">
                        {user.createdAt}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* PHÂN TRANG */}
          {!loading && filteredUsers.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50 text-xs text-slate-500">
              <span className="font-medium">
                Hiển thị{" "}
                <strong className="text-slate-800 font-bold">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredUsers.length
                  )}
                </strong>{" "}
                -{" "}
                <strong className="text-slate-800 font-bold">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredUsers.length
                  )}
                </strong>{" "}
                trong tổng số{" "}
                <strong className="text-slate-800 font-bold">
                  {filteredUsers.length}
                </strong>{" "}
                người dùng
              </span>
              <div className="flex gap-2 items-center">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl disabled:opacity-40 transition font-bold text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trước</span>
                </button>
                <span className="px-3.5 py-1.5 font-bold text-slate-800 bg-white border border-slate-200 rounded-xl">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl disabled:opacity-40 transition font-bold text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL CHI TIẾT */}
        {selectedUser && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedUser(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 relative border border-slate-100 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {selectedUser.fullName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      ID: {selectedUser.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl w-8 h-8 flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Email
                    </span>
                  </div>
                  <span className="text-slate-800 font-semibold text-xs break-all block">
                    {selectedUser.email}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      SĐT
                    </span>
                  </div>
                  <span className="text-slate-800 font-semibold text-xs font-mono block">
                    {selectedUser.phone}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Vai trò
                    </span>
                  </div>
                  <span className="font-bold text-indigo-600 text-xs block">
                    {selectedUser.role}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    {selectedUser.status === "ACTIVE" ? (
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <UserX className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Trạng thái
                    </span>
                  </div>
                  <span
                    className={`font-bold text-xs block ${
                      selectedUser.status === "ACTIVE"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {selectedUser.status === "ACTIVE"
                      ? "Hoạt động"
                      : "Tạm khóa"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Ngày tạo tài khoản
                  </span>
                </div>
                <span className="text-slate-800 font-semibold text-xs block">
                  {selectedUser.createdAt}
                </span>
              </div>

              {/* Footer Modal */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}