"use client";
import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  // Đồng bộ tên hệ thống mới tương ứng với Header
  const systemNameLeft = "Grand";
  const systemNameRight = "Job";

  // State để quản lý hiệu ứng Hover cho từng đường link
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Style cho các thẻ con bên trong danh sách
  const linkStyle = (id: string) => ({
    color: hoveredId === id ? "#ffffff" : "#94a3b8",
    textDecoration: "none",
    transition: "color 0.2s ease",
    fontSize: "14px",
  });

  return (
    <footer style={{ backgroundColor: "#0f172a", color: "#94a3b8", fontSize: "14px", borderTop: "1px solid #1e293b", fontFamily: "sans-serif" }}>
      
      {/* KHỐI LAYOUT CHÍNH (GRID 4 CỘT) */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px" }}>
        
        {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU */}
        <div>
          <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: "700", marginBottom: "16px", marginTop: 0 }}>
            <span style={{ color: "#10b981" }}>{systemNameLeft}</span>{systemNameRight}
          </h3>
          <p style={{ lineHeight: "1.6", color: "#94a3b8", margin: 0 }}>
            Nền tảng kết nối cơ hội việc làm chất lượng cao ứng dụng công nghệ Next.js hiện đại.
          </p>
        </div>

        {/* CỘT 2: VỀ HỆ THỐNG */}
        <div>
          <h4 style={{ color: "#ffffff", fontWeight: "600", marginBottom: "16px", marginTop: 0 }}>Về {systemNameLeft}{systemNameRight}</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>
              <Link href="#" id="about" onMouseEnter={() => setHoveredId("about")} onMouseLeave={() => setHoveredId(null)} style={linkStyle("about")}>
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link href="#" id="recruit" onMouseEnter={() => setHoveredId("recruit")} onMouseLeave={() => setHoveredId(null)} style={linkStyle("recruit")}>
                Tuyển dụng
              </Link>
            </li>
            <li>
              <Link href="#" id="contact" onMouseEnter={() => setHoveredId("contact")} onMouseLeave={() => setHoveredId(null)} style={linkStyle("contact")}>
                Liên hệ báo giá
              </Link>
            </li>
          </ul>
        </div>

        {/* CỘT 3: DÀNH CHO ỨNG VIÊN */}
        <div>
          <h4 style={{ color: "#ffffff", fontWeight: "600", marginBottom: "16px", marginTop: 0 }}>Dành cho ứng viên</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>
              <Link href="/resume" id="f-cv" onMouseEnter={() => setHoveredId("f-cv")} onMouseLeave={() => setHoveredId(null)} style={linkStyle("f-cv")}>
                Mẫu CV online
              </Link>
            </li>
            <li>
              <Link href="/jobs" id="f-jobs" onMouseEnter={() => setHoveredId("f-jobs")} onMouseLeave={() => setHoveredId(null)} style={linkStyle("f-jobs")}>
                Tìm kiếm việc làm
              </Link>
            </li>
            <li>
              <Link href="#" id="handbook" onMouseEnter={() => setHoveredId("handbook")} onMouseLeave={() => setHoveredId(null)} style={linkStyle("handbook")}>
                Cẩm nang nghề nghiệp
              </Link>
            </li>
          </ul>
        </div>

        {/* CỘT 4: QUY ĐỊNH BẢO MẬT */}
        <div>
          <h4 style={{ color: "#ffffff", fontWeight: "600", marginBottom: "16px", marginTop: 0 }}>Quy định bảo mật</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>
              <Link href="#" id="terms" onMouseEnter={() => setHoveredId("terms")} onMouseLeave={() => setHoveredId(null)} style={linkStyle("terms")}>
                Điều khoản dịch vụ
              </Link>
            </li>
            <li>
              <Link href="#" id="privacy" onMouseEnter={() => setHoveredId("privacy")} onMouseLeave={() => setHoveredId(null)} style={linkStyle("privacy")}>
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link href="#" id="complain" onMouseEnter={() => setHoveredId("complain")} onMouseLeave={() => setHoveredId(null)} style={linkStyle("complain")}>
                Giải quyết khiếu nại
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* DÒNG COPYRIGHT PHÍA DƯỚI CÙNG */}
      <div style={{ borderTop: "1px solid #1e293b", textAlign: "center", padding: "24px 0", fontSize: "12px", color: "#64748b" }}>
        © {new Date().getFullYear()} {systemNameLeft}{systemNameRight} Project. Xây dựng dựa trên kiến trúc Next.js App Router.
      </div>

    </footer>
  );
}