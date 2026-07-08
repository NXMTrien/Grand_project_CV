import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import "@/app/globals.css"; // Đảm bảo đã import Tailwind
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "TopCV Clone - Nền Tảng Tuyển Dụng Công Nghệ Cao",
  description: "Tạo CV chuẩn SEO, tìm kiếm việc làm nhanh chóng, ứng tuyển dễ dàng.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <Header />
        {/* Thẻ main flex-grow đẩy footer xuống đáy nếu nội dung trang quá ngắn */}
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}