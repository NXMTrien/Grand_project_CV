// src/lib/auth.ts
import jwt from "jsonwebtoken";

export interface AuthPayload {
  userId?: string;
  id?: string;
  _id?: string;
  role?: string;
  [key: string]: any;
}

export function getAuthPayload(
  headers: Headers | Record<string, string | string[] | undefined>
): AuthPayload | null {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("❌ Cảnh báo: Biến môi trường JWT_SECRET chưa được cấu hình!");
      return null;
    }

    let authHeader: string | null = null;

    // 1. Lấy Authorization header từ Web Standard Headers hoặc Plain Object
    if (typeof (headers as Headers).get === "function") {
      authHeader = (headers as Headers).get("authorization") || (headers as Headers).get("Authorization");
    } else if (headers) {
      const h = headers as Record<string, string | string[] | undefined>;
      authHeader = (h["authorization"] || h["Authorization"]) as string | null;
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    // 2. Lấy Token và làm sạch chuỗi (xóa khoảng trắng / dấu nháy kép thừa)
    let token = authHeader.split(" ")[1]?.trim();
    if (!token) return null;

    // Loại bỏ dấu nháy kép nếu token bị bọc sai ở Frontend
    token = token.replace(/^"(.*)"$/, "$1");

    // 3. Giải mã và Verify Token
    const decoded = jwt.verify(token, jwtSecret) as AuthPayload;
    return decoded;

  } catch (error) {
    // Không cần log nguyên error object nếu là lỗi hết hạn token thông thường để tránh rác log
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("⚠️ Token đã hết hạn.");
    } else {
      console.error("❌ Lỗi xác thực JWT:", error);
    }
    return null;
  }
}