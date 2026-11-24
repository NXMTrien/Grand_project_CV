"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/src/components/AlertProvider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Gửi yêu cầu mã OTP về Mail
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REQUEST_OTP", email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(data.message);
      setStep(2); // Chuyển sang giao diện nhập mã OTP
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể gửi mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_OTP", email, otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Mã OTP không hợp lệ.");
      setMessage(data.message);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể xác thực mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_PASSWORD", email, otpCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await showAlert("Đặt lại mật khẩu thành công! Hãy đăng nhập lại.");
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-6">Khôi phục mật khẩu</h2>

        {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
        {message && <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-lg">{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <p className="text-sm text-gray-600 mb-4">Nhập email tài khoản của bạn, hệ thống sẽ gửi mã OTP xác thực gồm 6 chữ số về hộp thư.</p>
            <input type="email" required placeholder="Nhập Email của bạn" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none mb-4"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-300">
              {loading ? "Đang gửi mail..." : "Gửi mã OTP"}
            </button>
          </form>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-2" aria-label="Các bước khôi phục mật khẩu">
              <div className={`rounded-lg px-3 py-2 text-center text-sm font-semibold ${step === 2 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                1. Xác nhận OTP
              </div>
              <div className={`rounded-lg px-3 py-2 text-center text-sm font-semibold ${step === 3 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                2. Mật khẩu mới
              </div>
            </div>
            {step === 2 ? (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <p className="text-sm text-gray-600">Nhập mã 6 số đã gửi đến <strong>{email}</strong>. Bạn cần xác nhận mã trước khi tạo mật khẩu mới.</p>
                <div>
                  <label htmlFor="otpCode" className="mb-1 block text-sm font-medium text-gray-700">Mã xác thực OTP</label>
                  <input
                    id="otpCode"
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    autoComplete="one-time-code"
                    placeholder="Nhập 6 số OTP"
                    maxLength={6}
                    className="w-full rounded-lg border p-2.5 text-center text-lg font-bold tracking-widest outline-none focus:ring-2 focus:ring-green-500"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
                <button type="submit" disabled={loading || otpCode.length !== 6} className="w-full rounded-lg bg-green-500 p-3 font-semibold text-white transition hover:bg-green-600 disabled:bg-gray-300">
                  {loading ? "Đang xác nhận OTP..." : "Xác nhận mã OTP"}
                </button>
                <button type="button" onClick={() => { setStep(1); setOtpCode(""); setError(""); setMessage(""); }} className="w-full py-2 text-sm font-medium text-gray-600 hover:text-green-700">
                  Quay lại nhập email
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-green-700">Mã OTP đã được xác nhận. Hãy tạo mật khẩu mới cho tài khoản {email}.</p>
                <div>
                  <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    className="w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-green-500"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading || newPassword.length < 6} className="w-full rounded-lg bg-green-500 p-3 font-semibold text-white transition hover:bg-green-600 disabled:bg-gray-300">
                  {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                </button>
                <button type="button" onClick={() => { setStep(2); setNewPassword(""); setError(""); setMessage(""); }} className="w-full py-2 text-sm font-medium text-gray-600 hover:text-green-700">
                  Quay lại xác nhận OTP
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}