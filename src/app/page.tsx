"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSalaryRange, SALARY_RANGES, type SalaryRange } from "@/src/lib/jobSearch";

interface CategoryOption {
  _id: string;
  name: string;
}

interface HomeJob {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  logoText: string;
  logoBg: string;
  logoColor: string;
}

interface ApiJob {
  _id: string;
  title: string;
  companyId?: { name?: string };
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
}

export default function TopCVHomePage() {
  const router = useRouter();
  const [searchTitle, setSearchTitle] = useState("");
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hotJobs, setHotJobs] = useState<HomeJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSalary, setSelectedSalary] = useState<SalaryRange>("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    async function loadHotJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (!res.ok) {
          throw new Error("Không tải được việc làm");
        }
        const json = await res.json();
        const jobs: ApiJob[] = json.data || [];
        setLocations(
          Array.from(
            new Set(
              jobs
                .map((job) => job.location?.trim())
                .filter((location): location is string => Boolean(location))
            )
          )
        );
        setHotJobs(
          jobs.map((job) => ({
            id: job._id,
            title: job.title,
            company: job.companyId?.name || "Công ty chưa rõ",
            salary:
              job.salaryMin && job.salaryMax
                ? `${(job.salaryMin / 1_000_000).toLocaleString()} - ${(job.salaryMax / 1_000_000).toLocaleString()} triệu`
                : "Thỏa thuận",
            location: job.location || "Chưa rõ",
            logoText: job.companyId?.name?.charAt(0) || "C",
            logoBg: "#f8fafc",
            logoColor: "#0f172a"
          }))
          .slice(0, 6)
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingJobs(false);
      }
    }

    loadHotJobs();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) {
          throw new Error("Không tải được danh mục ngành nghề");
        }
        setCategories(await res.json());
      } catch (error) {
        console.error(error);
      }
    }

    loadCategories();
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTitle.trim()) params.set("search", searchTitle.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedSalary) params.set("salary", selectedSalary);
    if (selectedLocation) params.set("location", selectedLocation);

    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs");
  };

  return (
    <div style={{ backgroundColor: "#f4f6f9", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#334155" }}>
      
      {/* SECTION 1: HERO SEARCH BACKGROUND */}
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)", padding: "50px 20px 70px 20px", textAlign: "center", position: "relative" }}>
        <h1 style={{ color: "#ffffff", fontSize: "26px", fontWeight: "700", marginBottom: "12px", margin: 0, letterSpacing: "-0.02em" }}>
          Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
        </h1>
        <p style={{ color: "#a7f3d0", fontSize: "14px", marginBottom: "32px", marginTop: 0, fontWeight: "400" }}>
          Tiếp cận <strong style={{ color: "#ffffff" }}>80.000+</strong> tin tuyển dụng việc làm mới mỗi ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
        </p>

        {/* THANH TÌM KIẾM HERO */}
        <form onSubmit={handleSearch} style={{
          maxWidth: "960px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "10px",
          borderRadius: "18px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center", 
          gap: "12px", 
          boxShadow: isSearchFocused ? "0 20px 25px -5px rgba(0,0,0,0.4), 0 0 0 4px rgba(16, 185, 129, 0.3)" : "0 10px 25px -5px rgba(0,0,0,0.25)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
          
          {/* Ô nhập từ khóa */}
          <div style={{ flex: "2 1 240px", display: "flex", alignItems: "center", paddingLeft: "12px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#10b981" style={{ width: "20px", height: "20px", marginRight: "10px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.601Z" />
            </svg>
            <input 
              type="text" 
              placeholder="Vị trí tuyển dụng, từ khóa công việc hoặc tên doanh nghiệp..." 
              value={searchTitle}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => setSearchTitle(e.target.value)}
              aria-label="Từ khóa hoặc tên công ty"
              style={{ width: "100%", border: "none", outline: "none", fontSize: "14px", color: "#1e293b", fontWeight: "500" }}
            />
          </div>

          <select
            aria-label="Vị trí"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ flex: "1 1 150px", minWidth: 0, padding: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", backgroundColor: "#fff", color: "#475569", fontSize: "14px" }}
          >
            <option value="">Tất cả vị trí</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>

          <select
            aria-label="Mức lương"
            value={selectedSalary}
            onChange={(e) => setSelectedSalary(isSalaryRange(e.target.value) ? e.target.value : "")}
            style={{ flex: "1 1 150px", minWidth: 0, padding: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", backgroundColor: "#fff", color: "#475569", fontSize: "14px" }}
          >
            <option value="">Mọi mức lương</option>
            {SALARY_RANGES.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          <select
            aria-label="Khu vực làm việc"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ flex: "1 1 150px", minWidth: 0, padding: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", backgroundColor: "#fff", color: "#475569", fontSize: "14px" }}
          >
            <option value="">Tất cả khu vực</option>
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <button type="submit" style={{ backgroundColor: "#10b981", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#047857")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}>
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* SECTION 2: CONTAINER CHÍNH */}
      <div style={{ maxWidth: "1240px", margin: "30px auto 40px auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* 🌟 CẢI TIẾN: THANH DROPDOWN DANH MỤC NGÀNH NGHỀ HIỆN ĐẠI */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "700" }}>
              📂
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Khám phá theo ngành nghề
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
                Lựa chọn ngành nghề phù hợp để xem các việc làm tuyển dụng hàng đầu
              </p>
            </div>
          </div>

          {/* DROPDOWN SELECT DANH MỤC */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 300px", maxWidth: "450px" }}>
            <select
              aria-label="Chọn danh mục ngành nghề"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: "#f8fafc",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1e293b",
                outline: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
            >
              <option value="">-- Tất cả ngành nghề ({categories.length}) --</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  💼 {category.name}
                </option>
              ))}
            </select>

            {selectedCategory && (
              <button type="button"
                onClick={() => setSelectedCategory("")}
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  border: "none",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Xóa lọc ✕
              </button>
            )}
          </div>
        </div>

        {/* BANNER NỔI BẬT */}
        <div style={{ minWidth: 0, boxSizing: "border-box", backgroundColor: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)", minHeight: "260px", display: "flex", alignItems: "center", background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)", border: "1px solid #e2e8f0", padding: "clamp(20px, 4vw, 40px)" }}>
          <div style={{ maxWidth: "600px", minWidth: 0, textAlign: "left" }}>
            <span style={{ background: "#10b981", color: "#fff", padding: "6px 14px", borderRadius: "30px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em" }}>TIN TUYỂN DỤNG TIÊU BIỂU</span>
            <h2 style={{ fontSize: "28px", color: "#0f172a", fontWeight: "800", marginTop: "16px", marginBottom: "8px", lineHeight: "1.2" }}>CƠ HỘI VIỆC LÀM ĐÓN ĐẦU XU HƯỚNG 2026</h2>
            <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.5", marginBottom: "24px" }}>Gia nhập mạng lưới đối tác chiến lược để nhận gói đặc quyền thu nhập và lộ trình thăng tiến rõ ràng vượt bậc.</p>
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              style={{ background: "#0f172a", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              Ứng tuyển ngay ↗
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: GRID DANH SÁCH VIỆC LÀM TỐT NHẤT */}
      <div style={{ maxWidth: "1240px", margin: "0 auto 60px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "4px", height: "24px", backgroundColor: "#10b981", borderRadius: "10px" }}></div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>Việc làm tốt nhất</h2>
            <span style={{ backgroundColor: "#e0fdf4", color: "#10b981", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "6px" }}>🔥 GỢI Ý MỚI NHẤT</span>
          </div>
        </div>

        {/* GRID CARD CÔNG VIỆC */}
        <div className="home-job-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px", minWidth: 0 }}>
          {isLoadingJobs ? (
            <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "#64748b" }}>
              Đang tải việc làm tốt nhất...
            </div>
          ) : hotJobs.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "#64748b" }}>
              Chưa có dữ liệu việc làm để hiển thị.
            </div>
          ) : (
            hotJobs.map((job) => (
              <div 
                key={job.id}
                onMouseEnter={() => setHoveredJob(job.id)}
                onMouseLeave={() => setHoveredJob(null)}
                onClick={() => router.push(`/jobs/${job.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/jobs/${job.id}`);
                  }
                }}
                role="link"
                tabIndex={0}
                aria-label={`Xem công việc ${job.title}`}
                style={{ 
                  boxSizing: "border-box",
                  minWidth: 0,
                  backgroundColor: "#ffffff", 
                  padding: "20px", 
                  borderRadius: "16px", 
                  boxShadow: hoveredJob === job.id ? "0 12px 25px -5px rgba(16, 185, 129, 0.15)" : "0 4px 6px -1px rgba(0,0,0,0.02)", 
                  border: "1px solid",
                  borderColor: hoveredJob === job.id ? "#10b981" : "#e2e8f0",
                  transform: hoveredJob === job.id ? "translateY(-2px)" : "none",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  display: "flex",
                  gap: "16px"
                }}
              >
                {/* Logo công ty giả lập */}
                <div style={{ 
                  width: "52px", 
                  height: "52px", 
                  backgroundColor: job.logoBg, 
                  color: job.logoColor, 
                  borderRadius: "12px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: "20px", 
                  fontWeight: "700",
                  flexShrink: 0,
                  border: "1px solid #f1f5f9"
                }}>
                  {job.logoText}
                </div>

                {/* Chi tiết công việc */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flexGrow: 1, minWidth: 0 }}>
                  <div>
                    <h3 style={{ 
                      fontSize: "14.5px", 
                      fontWeight: "700", 
                      color: hoveredJob === job.id ? "#10b981" : "#1e293b", 
                      margin: "0 0 6px 0", 
                      display: "-webkit-box", 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: "vertical", 
                      overflow: "hidden", 
                      lineHeight: "1.4",
                      transition: "color 0.2s"
                    }}>
                      {job.title}
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 14px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "500" }}>
                      {job.company}
                    </p>
                  </div>

                  {/* Lương & Địa điểm */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "12px" }}>
                    <span style={{ minWidth: 0, color: "#10b981", fontWeight: "700", backgroundColor: "#f0fdf4", padding: "4px 10px", borderRadius: "6px" }}>
                      💵 {job.salary}
                    </span>
                    <span style={{ color: "#475569", backgroundColor: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontWeight: "500", overflowWrap: "anywhere" }}>
                      📍 {job.location}
                    </span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {!isLoadingJobs && hotJobs.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "28px" }}>
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              style={{ backgroundColor: "#10b981", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(16,185,129,0.2)" }}
            >
              Xem thêm công việc
            </button>
          </div>
        )}
      </div>

    </div>
  );
}