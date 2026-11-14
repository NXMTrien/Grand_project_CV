"use client";

import { useCallback, useEffect, useState } from "react";
import useAlertState from "@/src/lib/useAlertState";

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

type ManagerRequestStatus = "NEW" | "REVIEWING" | "RESOLVED";

interface ManagerRequestItem {
  _id: string;
  fullName: string;
  email: string;
  birthYear: number;
  message: string;
  status: ManagerRequestStatus;
  createdAt: string;
  processedAt: string | null;
}

const statusNames: Record<FeedbackStatus, string> = {
  NEW: "Mới gửi",
  REVIEWING: "Đang kiểm tra",
  RESOLVED: "Đã xử lý",
};

const requestStatusNames: Record<ManagerRequestStatus, string> = {
  NEW: "Mới gửi",
  REVIEWING: "Đang xem xét",
  RESOLVED: "Đã xử lý",
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [managerRequests, setManagerRequests] = useState<ManagerRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useAlertState("", (message) => message);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"feedback" | "manager">("feedback");
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useAlertState("", (message) => message);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);

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
  }, [setError]);

  const fetchManagerRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập tài khoản Admin.");
      const response = await fetch("/api/manager-account-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể tải yêu cầu xin tài khoản.");
      setManagerRequests(result.data || []);
    } catch (requestError) {
      setRequestsError(
        requestError instanceof Error ? requestError.message : "Không thể tải yêu cầu xin tài khoản."
      );
    } finally {
      setRequestsLoading(false);
    }
  }, [setRequestsError]);

  useEffect(() => {
    void Promise.resolve().then(fetchFeedback);
  }, [fetchFeedback]);

  useEffect(() => {
    if (activeTab === "manager") {
      void Promise.resolve().then(fetchManagerRequests);
    }
  }, [activeTab, fetchManagerRequests]);

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

  const updateManagerRequestStatus = async (requestId: string, status: ManagerRequestStatus) => {
    setUpdatingRequestId(requestId);
    setRequestsError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập tài khoản Admin.");
      const response = await fetch("/api/manager-account-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể cập nhật yêu cầu.");
      setManagerRequests((items) =>
        items.map((item) =>
          item._id === requestId
            ? { ...item, status, processedAt: result.data?.processedAt ?? null }
            : item
        )
      );
    } catch (requestError) {
      setRequestsError(
        requestError instanceof Error ? requestError.message : "Không thể cập nhật yêu cầu."
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">Quản trị</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Liên hệ từ người dùng</h1>
            <p className="mt-2 text-slate-600">Quản lý phản ánh và yêu cầu xin tài khoản Manager.</p>
          </div>
          {activeTab === "feedback" && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              {feedback.length} phản ánh
            </span>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Danh sách liên hệ">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "feedback"}
            onClick={() => setActiveTab("feedback")}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
              activeTab === "feedback" ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Phản ánh
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "manager"}
            onClick={() => {
              setActiveTab("manager");
              setShowRequestDetails(false);
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
              activeTab === "manager" ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Yêu cầu tài khoản Manager
          </button>
        </div>

        {activeTab === "feedback" ? (
          <>
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
          </>
        ) : (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div>
                <h2 className="font-bold text-slate-900">Có người dùng muốn xin tài khoản của quản lý</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Yêu cầu đã xử lý được lưu trong 5 ngày kể từ ngày cập nhật.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestDetails((visible) => !visible)}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {showRequestDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
              </button>
            </div>

            {requestsError && <div role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{requestsError}</div>}
            {showRequestDetails && (
              requestsLoading ? (
                <div className="mt-5 rounded-xl border bg-white p-12 text-center text-slate-500">Đang tải yêu cầu...</div>
              ) : managerRequests.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed bg-white p-12 text-center text-slate-500">Chưa có yêu cầu xin tài khoản Manager nào.</div>
              ) : (
                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Họ và tên</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Năm sinh</th>
                        <th className="px-4 py-3 font-semibold">Lời nhắn</th>
                        <th className="px-4 py-3 font-semibold">Ngày gửi</th>
                        <th className="px-4 py-3 font-semibold">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {managerRequests.map((item) => (
                        <tr key={item._id} className="align-top text-slate-700">
                          <td className="px-4 py-4 font-semibold text-slate-900">{item.fullName}</td>
                          <td className="px-4 py-4">
                            <a className="text-emerald-700 hover:underline" href={`mailto:${item.email}`}>{item.email}</a>
                          </td>
                          <td className="px-4 py-4">{item.birthYear}</td>
                          <td className="max-w-sm whitespace-normal px-4 py-4 leading-6">{item.message}</td>
                          <td className="whitespace-nowrap px-4 py-4">{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                          <td className="px-4 py-4">
                            <select
                              aria-label={`Trạng thái yêu cầu của ${item.fullName}`}
                              value={item.status}
                              disabled={updatingRequestId === item._id}
                              onChange={(event) => updateManagerRequestStatus(item._id, event.target.value as ManagerRequestStatus)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-500"
                            >
                              {Object.entries(requestStatusNames).map(([value, name]) => (
                                <option key={value} value={value}>{name}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </section>
        )}
      </div>
    </div>
  );
}
