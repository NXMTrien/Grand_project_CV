"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 👈 Thêm router
import { isSalaryRange, matchesSalaryRange, SALARY_RANGES, type SalaryRange } from "@/src/lib/jobSearch";
import useAlertState from "@/src/lib/useAlertState";

interface CategoryOption {
  _id: string;
  name: string;
}

interface CategoryReference {
  _id: string;
}

interface JobItem {
  _id: string;
  title: string;
  companyId?: {
    name?: string;
  };
  hiringStatus?: "OPEN" | "CLOSED";
  categoryId?: CategoryReference | string;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  description?: string;
  requirements?: string;
}

interface ResumeItem {
  _id: string;
  title: string;
}

interface JobsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatSalary(salaryMin?: number, salaryMax?: number) {
  if (!salaryMin || !salaryMax) return "Thỏa thuận";

  const formatMillions = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(amount / 1_000_000);

  return `${formatMillions(salaryMin)} – ${formatMillions(salaryMax)} triệu/tháng`;
}

export default function JobsPage({ searchParams }: JobsPageProps) {
  const router = useRouter(); // 👈 Khởi tạo router
  const initialSearchParams = use(searchParams);
  const initialSearch = typeof initialSearchParams.search === "string" ? initialSearchParams.search : "";
  const initialCategory = typeof initialSearchParams.category === "string" ? initialSearchParams.category : "";
  const initialSalary = typeof initialSearchParams.salary === "string" ? initialSearchParams.salary : null;
  const initialLocation = typeof initialSearchParams.location === "string" ? initialSearchParams.location : "";
  const initialPageParam = typeof initialSearchParams.page === "string" ? Number(initialSearchParams.page) : 1;
  const initialPage = Number.isInteger(initialPageParam) && initialPageParam > 0 ? initialPageParam : 1;
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSalary, setSelectedSalary] = useState<SalaryRange>(
    isSalaryRange(initialSalary) ? initialSalary : ""
  );
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [page, setPage] = useState(initialPage);
  const [myResumes, setMyResumes] = useState<ResumeItem[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useAlertState("", (message) => message);

  // STATE QUẢN LÝ MODAL & FORM ỨNG TUYỂN
  const [applyJob, setApplyJob] = useState<JobItem | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [selfIntroduction, setSelfIntroduction] = useState("");

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được danh sách việc làm");
      
      const jobList = data.data || [];
      setJobs(jobList);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Lỗi khi tải việc làm"));
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được danh mục ngành nghề");
      setCategories(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Lỗi khi tải danh mục ngành nghề"));
    }
  };

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/resume", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được danh sách CV");
      
      const list = data.data || [];
      setMyResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0]._id);
      }
    } catch (err) {
      console.error("fetchResumes error", err);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() =>
      Promise.all([fetchJobs(), fetchCategories(), fetchResumes()])
    );
  }, []);

  const handleOpenApplyModal = (job: JobItem) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập trước khi ứng tuyển!");
      return;
    }

    setApplyJob(job);
    setTargetPosition(job.title || "");
  };

  const handleSubmitApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applyJob) return;
    if (!selectedResumeId) {
      alert("Vui lòng chọn 1 chiếc CV phù hợp!");
      return;
    }

    setIsApplying(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập trước khi ứng tuyển");

      const formattedCoverLetter = `Vị trí ứng tuyển: ${targetPosition}\n\nLời giới thiệu:\n${selfIntroduction}`;

      const res = await fetch(`/api/jobs/${applyJob._id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          coverLetter: formattedCoverLetter.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ứng tuyển thất bại");

      alert(data.message || "Ứng tuyển thành công!");
      setApplyJob(null);
      setSelfIntroduction("");
    } catch (err) {
      alert(getErrorMessage(err, "Có lỗi xảy ra khi ứng tuyển"));
    } finally {
      setIsApplying(false);
    }
  };

  const locations = Array.from(
    new Set(jobs.map((job) => job.location?.trim()).filter((location): location is string => Boolean(location)))
  );

  const filteredJobs = jobs.filter((job) => {
    const normalizedSearch = search.trim().toLowerCase();
    const title = job.title?.toLowerCase() || "";
    const company = job.companyId?.name?.toLowerCase() || "";
    const jobCategoryId = typeof job.categoryId === "string" ? job.categoryId : job.categoryId?._id;
    return (
      (!normalizedSearch || title.includes(normalizedSearch) || company.includes(normalizedSearch)) &&
      (!selectedCategory || jobCategoryId === selectedCategory) &&
      matchesSalaryRange(job.salaryMin, job.salaryMax, selectedSalary) &&
      (!selectedLocation || job.location?.toLowerCase() === selectedLocation.toLowerCase())
    );
  });

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers: Array<number | "ellipsis"> =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : currentPage <= 4
        ? [1, 2, 3, 4, 5, "ellipsis", totalPages]
        : currentPage >= totalPages - 3
          ? [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
          : [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedSalary) params.set("salary", selectedSalary);
    if (selectedLocation) params.set("location", selectedLocation);

    const query = params.toString();
    router.replace(query ? `/jobs?${query}` : "/jobs", { scroll: false });
  };

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(nextPage, totalPages));
    setPage(safePage);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedSalary) params.set("salary", selectedSalary);
    if (selectedLocation) params.set("location", selectedLocation);
    if (safePage > 1) params.set("page", String(safePage));

    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs", { scroll: false });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "32px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        {/* THANH TÌM KIẾM */}
        <form
          onSubmit={handleSearch}
          style={{
            backgroundColor: "#ffffff",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm vị trí công việc, tên công ty..."
            style={{
              flex: "1 1 300px",
              padding: "10px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Từ khóa hoặc tên công ty"
          />
          <select
            aria-label="Vị trí"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            style={{
              flex: "1 1 170px",
              padding: "10px 12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#475569",
            }}
          >
            <option value="">Tất cả vị trí</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
          <select
            aria-label="Mức lương"
            value={selectedSalary}
            onChange={(e) => {
              setSelectedSalary(isSalaryRange(e.target.value) ? e.target.value : "");
              setPage(1);
            }}
            style={{
              flex: "1 1 150px",
              padding: "10px 12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#475569",
            }}
          >
            <option value="">Mọi mức lương</option>
            {SALARY_RANGES.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <select
            aria-label="Khu vực làm việc"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setPage(1);
            }}
            style={{
              flex: "1 1 150px",
              padding: "10px 12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#475569",
            }}
          >
            <option value="">Tất cả khu vực</option>
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              backgroundColor: "#10b981",
              color: "#ffffff",
              padding: "10px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
            }}
          >
            Tìm kiếm
          </button>
        </form>

        {errorMessage && (
          <div
            style={{
              marginBottom: "24px",
              padding: "14px",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {errorMessage}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: 0,
            }}
          >
            Cơ hội việc làm ({filteredJobs.length})
          </h2>
        </div>

        {/* DANH SÁCH CÔNG VIỆC */}
        {filteredJobs.length === 0 ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px dashed #cbd5e1",
              padding: "48px 16px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#475569", fontSize: "15px", fontWeight: "500", margin: 0 }}>
              Không tìm thấy công việc phù hợp
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {paginatedJobs.map((job) => (
              <div
                key={job._id}
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1e293b",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {job.title}
                  </h3>

                  <p style={{ fontSize: "13px", color: "#64748b", marginTop: "6px", marginBottom: 0, fontWeight: "500" }}>
                    {job.companyId?.name || "Công ty chưa rõ"}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", fontSize: "12px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#047857",
                        fontWeight: "700",
                        background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
                        padding: "6px 11px",
                        borderRadius: "999px",
                        border: "1px solid #a7f3d0",
                        boxShadow: "0 1px 2px rgba(4, 120, 87, 0.08)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span aria-hidden="true">💰</span>
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </span>

                    <span
                      style={{
                        color: "#475569",
                        backgroundColor: "#f1f5f9",
                        padding: "3px 10px",
                        borderRadius: "6px",
                      }}
                    >
                      {job.location || "Chưa xác định"}
                    </span>
                  </div>
                </div>

                {/* THANH THAO TÁC CỦA THẺ CÔNG VIỆC */}
                <div style={{ display: "flex", gap: "10px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  {/* 🔴 CHUYỂN HƯỚNG TỚI TRANG DETAIL /jobs/[id] */}
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/${job._id}`)}
                    style={{
                      flex: 1,
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      padding: "9px 0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    Xem chi tiết
                  </button>

                  {job.hiringStatus !== "CLOSED" && (
                    <button
                      type="button"
                      onClick={() => handleOpenApplyModal(job)}
                      style={{
                        flex: 1,
                        backgroundColor: "#10b981",
                        color: "#ffffff",
                        padding: "9px 0",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "700",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "center",
                        boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                      }}
                    >
                      Ứng tuyển ngay
                    </button>
                  )}
                  {job.hiringStatus === "CLOSED" && (
                    <span style={{ flex: 1, padding: "9px 0", color: "#b45309", backgroundColor: "#fffbeb", borderRadius: "8px", fontSize: "12px", fontWeight: 700, textAlign: "center" }}>
                      Đã hết tuyển dụng
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredJobs.length > 0 && totalPages > 1 && (
          <nav
            aria-label="Phân trang danh sách việc làm"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "28px",
            }}
          >
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Trang trước"
              style={{
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                backgroundColor: currentPage === 1 ? "#f1f5f9" : "#fff",
                color: currentPage === 1 ? "#94a3b8" : "#334155",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Trước
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <span key={`ellipsis-${index}`} aria-hidden="true" style={{ padding: "0 4px", color: "#64748b" }}>
                  …
                </span>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  aria-label={`Trang ${pageNumber}`}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                  style={{
                    minWidth: "38px",
                    padding: "8px 10px",
                    border: `1px solid ${currentPage === pageNumber ? "#10b981" : "#cbd5e1"}`,
                    borderRadius: "8px",
                    backgroundColor: currentPage === pageNumber ? "#10b981" : "#fff",
                    color: currentPage === pageNumber ? "#fff" : "#334155",
                    fontWeight: currentPage === pageNumber ? "700" : "500",
                    cursor: "pointer",
                  }}
                >
                  {pageNumber}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Trang tiếp theo"
              style={{
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                backgroundColor: currentPage === totalPages ? "#f1f5f9" : "#fff",
                color: currentPage === totalPages ? "#94a3b8" : "#334155",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Sau
            </button>
          </nav>
        )}
      </div>

      {/* POPUP FORM MODAL ỨNG TUYỂN */}
      {applyJob && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                  Nộp hồ sơ ứng tuyển
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                  {applyJob.title} - {applyJob.companyId?.name || "Công ty"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyJob(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApply} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Vị trí mong muốn ứng tuyển <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Frontend Developer..."
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Chọn CV từ tài khoản <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {myResumes.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#ef4444", backgroundColor: "#fef2f2", padding: "8px", borderRadius: "6px", margin: 0 }}>
                    Bạn chưa tạo CV nào trong tài khoản. Vui lòng tạo CV trước.
                  </p>
                ) : (
                  <select
                    required
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      outline: "none",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box",
                    }}
                  >
                    {myResumes.map((cv) => (
                      <option key={cv._id} value={cv._id}>
                        📄 {cv.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Thư giới thiệu / Lời nhắn tới Nhà tuyển dụng
                </label>
                <textarea
                  rows={4}
                  placeholder="Giới thiệu ngắn gọn về bản thân..."
                  value={selfIntroduction}
                  onChange={(e) => setSelfIntroduction(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setApplyJob(null)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isApplying || myResumes.length === 0}
                  style={{
                    backgroundColor: isApplying || myResumes.length === 0 ? "#cbd5e1" : "#10b981",
                    color: "#ffffff",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    cursor: isApplying || myResumes.length === 0 ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  {isApplying ? "Đang gửi..." : "Gửi hồ sơ ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}