"use client";

import { useCallback, useEffect, useState } from "react";

type FeedbackStatus = "NEW" | "REVIEWING" | "RESOLVED";

interface FeedbackItem {
  _id: string;
  companyName: string;
  isAnonymous: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  content: string;
  status: FeedbackStatus;
  createdAt: string;
}

const statusNames: Record<FeedbackStatus, string> = {
  NEW: "Mới gửi",
  REVIEWING: "Đang kiểm tra",
  RESOLVED: "Đã xử lý",
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập tài khoản Admin.");
      const response = await fetch("/api/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể tải phản ánh.");
      setFeedback(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải phản ánh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchFeedback);
  }, [fetchFeedback]);

  const updateStatus = async (feedbackId: string, status: FeedbackStatus) => {
    setUpdatingId(feedbackId);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập tài khoản Admin.");
      const response = await fetch("/api/feedback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedbackId, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể cập nhật trạng thái.");
      setFeedback((items) => items.map((item) => item._id === feedbackId ? { ...item, status } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">Quản trị</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Phản ánh từ người dùng</h1>
            <p className="mt-2 text-slate-600">Kiểm tra nội dung phản ánh và cập nhật tiến độ xử lý.</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            {feedback.length} phản ánh
          </span>
        </div>

        {error && <div role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}

        {loading ? (
          <div className="rounded-xl border bg-white p-12 text-center text-slate-500">Đang tải phản ánh...</div>
        ) : feedback.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white p-12 text-center text-slate-500">Chưa có phản ánh nào.</div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <article key={item._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{item.companyName}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Gửi lúc {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <select
                    aria-label={`Trạng thái phản ánh của ${item.companyName}`}
                    value={item.status}
                    disabled={updatingId === item._id}
                    onChange={(event) => updateStatus(item._id, event.target.value as FeedbackStatus)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
                  >
                    {Object.entries(statusNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
                  </select>
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  {item.isAnonymous ? (
                    <span className="font-semibold text-slate-500">Người gửi ẩn danh</span>
                  ) : (
                    <p>
                      <span className="font-semibold">{item.contactName}</span>
                      {item.contactEmail && <> · <a className="text-emerald-700 hover:underline" href={`mailto:${item.contactEmail}`}>{item.contactEmail}</a></>}
                      {item.contactPhone && <> · <a className="text-emerald-700 hover:underline" href={`tel:${item.contactPhone}`}>{item.contactPhone}</a></>}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
