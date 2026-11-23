export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface UserProfile {
  _id?: string;
  userId?: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface CompanySummary {
  _id?: string;
  name?: string;
  logo?: string;
  address?: string;
}

export interface Job {
  _id: string;
  title: string;
  companyId?: CompanySummary | string;
  categoryId?: Category | string;
  description?: string;
  requirements?: string;
  benefits?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  jobType?: string;
  hiringStatus?: string;
  deadline?: string;
}

export interface ResumeData {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  targetPosition?: string;
  summary?: string;
  technicalSkills?: string;
  softSkills?: string;
  education?: { type?: string; school?: string; major?: string; details?: string }[];
  experience?: { company?: string; position?: string; details?: string }[];
}

export interface Resume {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  cvData?: ResumeData;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  href: string;
  isRead: boolean;
  createdAt: string;
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

export function getApiBaseUrl(): string {
  if (!apiBaseUrl) {
    throw new Error(
      "Chưa cấu hình EXPO_PUBLIC_API_URL. Hãy xem mobile/README.md để kết nối backend."
    );
  }
  return apiBaseUrl;
}

function getMessage(payload: unknown): string | undefined {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH";
    token?: string | null;
    body?: unknown;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new Error("Không thể kết nối máy chủ. Hãy kiểm tra mạng và địa chỉ API.");
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    if (response.ok) return undefined as T;
  }

  if (!response.ok) {
    throw new Error(getMessage(payload) ?? `Yêu cầu thất bại (${response.status}).`);
  }
  return payload as T;
}

export function companyName(job: Job): string {
  return typeof job.companyId === "object" && job.companyId?.name
    ? job.companyId.name
    : "Công ty";
}

export function categoryName(job: Job): string {
  return typeof job.categoryId === "object" && job.categoryId?.name
    ? job.categoryId.name
    : "";
}

export function formatSalary(job: Job): string {
  if (!job.salaryMin && !job.salaryMax) return "Thỏa thuận";
  const format = (amount: number) => `${(amount / 1_000_000).toLocaleString("vi-VN")} triệu`;
  if (job.salaryMin && job.salaryMax) {
    return `${format(job.salaryMin)} - ${format(job.salaryMax)}`;
  }
  return format(job.salaryMin || job.salaryMax || 0);
}
