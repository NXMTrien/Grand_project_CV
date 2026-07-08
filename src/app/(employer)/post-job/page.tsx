"use client";
import { useState } from "react";

export default function PostJobPage() {
  const [form, setForm] = useState({ title: "", company: "", salary: "", location: "", description: "", requirements: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("🎉 " + data.message);
      setForm({ title: "", company: "", salary: "", location: "", description: "", requirements: "" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-950 mb-6 border-l-4 border-green-500 pl-3">Đăng tin tuyển dụng mới</h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Tiêu đề công việc</label>
            <input type="text" placeholder="Ví dụ: Lập trình viên ReactJS (Junior/Middle)" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Tên công ty</label>
              <input type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" required value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Địa điểm làm việc</label>
              <input type="text" placeholder="Hà Nội, TP.HCM, Remote" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Mức lương</label>
            <input type="text" placeholder="Ví dụ: 15 - 25 triệu, Thỏa thuận" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" required value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Mô tả công việc</label>
            <textarea rows={4} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Yêu cầu ứng viên</label>
            <textarea rows={3} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" required value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition shadow-sm disabled:bg-gray-300">
            {loading ? "Đang xử lý đăng tin..." : "Kích hoạt đăng tin tuyển dụng"}
          </button>
        </form>
      </div>
    </div>
  );
}