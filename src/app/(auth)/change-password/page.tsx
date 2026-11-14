"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAlertState from "@/src/lib/useAlertState";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useAlertState<
    { type: "success" | "error"; text: string } | null
  >(null, (value) => value?.text || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      try {
        const user: unknown = JSON.parse(storedUser);
        if (
          !user ||
          typeof user !== "object" ||
          !("role" in user) ||
          typeof user.role !== "string" ||
          user.role.toUpperCase() !== "MANAGER" ||
          !("mustChangePassword" in user) ||
          user.mustChangePassword !== true
        ) {
          router.replace("/");
          return;
        }
        setAuthorized(true);
      } catch (error) {
        console.error("Không thể đọc thông tin tài khoản:", error);
        router.replace("/login");
      }
    });
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Không thể đổi mật khẩu.");
      }

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.");
      }
      const user: unknown = JSON.parse(storedUser);
      if (!user || typeof user !== "object") {
        throw new Error("Thông tin tài khoản không hợp lệ. Vui lòng đăng nhập lại.");
      }
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, mustChangePassword: false, isFirstLogin: false })
      );
      window.dispatchEvent(new Event("auth-change"));
      setMessage({ type: "success", text: "Đổi mật khẩu thành công. Đang chuyển về trang chủ..." });
      window.setTimeout(() => router.replace("/"), 800);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Không thể đổi mật khẩu.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!authorized) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 text-slate-500">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">Bảo mật tài khoản</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Đổi mật khẩu lần đầu</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Vì tài khoản được cấp mật khẩu tạm thời, bạn cần đổi mật khẩu trước khi tiếp tục sử dụng.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Mật khẩu tạm thời
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nhập lại mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>
          {message && (
            <p
              role="status"
              className={`rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-rose-50 text-rose-800"
              }`}
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </button>
        </form>
      </section>
    </main>
  );
}
