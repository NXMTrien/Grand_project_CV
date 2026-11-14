import User from "@/src/models/User";
import { getAuthPayload } from "@/src/lib/auth";

type AdminAuthResult =
  | { admin: true }
  | { error: string; status: 401 | 403 };

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const auth = getAuthPayload(request.headers);
  if (!auth?.userId) {
    return { error: "Vui lòng đăng nhập tài khoản Admin.", status: 401 };
  }

  const admin = await User.findById(auth.userId).select("role isBlocked");
  if (!admin || admin.role !== "ADMIN" || admin.isBlocked) {
    return { error: "Bạn không có quyền truy cập chức năng này.", status: 403 };
  }
  return { admin: true };
}
