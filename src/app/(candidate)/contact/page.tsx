"use client";

import { useEffect, useState } from "react";

interface CompanyOption {
  _id: string;
  name: string;
}

export default function ContactPage() {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/companies")
      .then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải danh sách công ty.");
        const data = await response.json();
        setCompanies(Array.isArray(data) ? data : []);
      })
      .catch((error: unknown) => {
        console.error("Không thể tải danh sách công ty:", error);
      });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedbackMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          isAnonymous,
          contactName,
          contactEmail,
          contactPhone,
          content,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Không thể gửi phản ánh.");

      setFeedbackMessage({ type: "success", text: result.message });
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContent("");
      setIsAnonymous(false);
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Không thể gửi phản ánh.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-emerald-600">GrandJob</p>
          <h1 className="text-3xl font-extrabold text-slate-900">Liên hệ & phản ánh</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Gửi phản ánh về công ty để Ban quản trị kiểm tra. Bạn có thể gửi ẩn danh nếu không muốn cung cấp thông tin liên hệ.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {feedbackMessage && (
            <div
              role="status"
              className={`rounded-lg border p-4 text-sm ${
                feedbackMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {feedbackMessage.text}
            </div>
          )}

          <div>
            <label htmlFor="companyName" className="mb-2 block text-sm font-semibold text-slate-700">
              Công ty được phản ánh
            </label>
            <input
              id="companyName"
              list="company-options"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              maxLength={160}
              required
              placeholder="Nhập hoặc chọn tên công ty"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <datalist id="company-options">
              {companies.map((company) => <option key={company._id} value={company.name} />)}
            </datalist>
          </div>

          <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
            <legend className="px-2 text-sm font-semibold text-slate-700">Thông tin người gửi</legend>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Gửi phản ánh ẩn danh
            </label>
            {!isAnonymous && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactName" className="mb-1.5 block text-sm text-slate-600">Họ và tên</label>
                  <input
                    id="contactName"
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    maxLength={120}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="mb-1.5 block text-sm text-slate-600">Email liên hệ</label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    maxLength={254}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contactPhone" className="mb-1.5 block text-sm text-slate-600">Số điện thoại (nếu có)</label>
                  <input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    maxLength={30}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">Vui lòng cung cấp email hoặc số điện thoại để Ban quản trị có thể phản hồi.</p>
                </div>
              </div>
            )}
          </fieldset>

          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-semibold text-slate-700">
              Nội dung phản ánh
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              minLength={10}
              maxLength={5000}
              required
              rows={7}
              placeholder="Mô tả chi tiết nội dung bạn muốn phản ánh (ít nhất 10 ký tự)"
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-1 text-right text-xs text-slate-500">{content.length}/5000</p>
          </div>

          {!isAnonymous && !contactEmail.trim() && !contactPhone.trim() && (
            <p className="text-sm text-amber-700">Hãy nhập email hoặc số điện thoại, hoặc chọn gửi ẩn danh.</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Đang gửi..." : "Gửi phản ánh"}
          </button>
        </form>
      </div>
    </div>
  );
}
