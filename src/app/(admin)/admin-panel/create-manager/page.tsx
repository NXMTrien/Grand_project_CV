"use client";
import { useState } from "react";

export default function AdminCreateManagerPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");

    try {
      const res = await fetch("/api/admin/create-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, dateOfBirth }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);

      setMessage(data.message);
      setEmail(""); setFullName(""); setDateOfBirth("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-md border mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Cấp tài khoản Nhà Tuyển Dụng (Manager)</h2>
      
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      {message && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{message}</div>}

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên Manager</label>
          <input type="text" required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Công Việc</label>
          <input type="email" required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
          <input type="date" required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300">
          {loading ? "Đang xử lý khởi tạo..." : "Kích hoạt & Gửi thông tin đăng nhập"}
        </button>
      </form>
    </div>
  );
}