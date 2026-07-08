"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1: Nhập email, Step 2: Nhập OTP & Mật khẩu mới
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xác thực OTP và đặt mật khẩu mới
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

      alert("Đặt lại mật khẩu thành công! Hãy đăng nhập lại.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
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
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác thực OTP (6 số)</label>
              <input type="text" required placeholder="Nhập 6 số OTP" maxLength={6} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-center font-bold tracking-widest text-lg"
                value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input type="password" required placeholder="Nhập mật khẩu mới" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-300">
              {loading ? "Đang xác thực..." : "Xác nhận đổi mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}