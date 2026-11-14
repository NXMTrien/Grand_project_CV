import { useCallback, useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, colors, Heading, Loading, Screen } from "@/src/components/ui";
import { useAuth } from "@/src/providers/AuthProvider";
import { apiRequest, type ApiEnvelope, type Resume } from "@/src/lib/api";
import useAlertState from "@/src/hooks/useAlertState";

export default function ResumesScreen() {
  const { token, ready } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useAlertState("", (message) => message, false);

  const loadResumes = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await apiRequest<ApiEnvelope<Resume[]>>("/api/resume", { token });
      setResumes(result.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải CV.");
    } finally {
      setLoading(false);
    }
  }, [setError, token]);

  useEffect(() => {
    if (ready) void Promise.resolve().then(loadResumes);
  }, [ready, loadResumes]);

  if (!ready || loading) return <Loading label="Đang tải CV..." />;
  if (!token) {
    return (
      <Screen>
        <Heading title="CV của tôi" subtitle="Đăng nhập để quản lý hồ sơ ứng tuyển." />
        <Button title="Đăng nhập" onPress={() => router.push("/login")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Heading title="CV của tôi" subtitle="Tạo và cập nhật hồ sơ dùng khi ứng tuyển." />
        <Button title="+ Tạo CV" onPress={() => router.push("/resume/new")} />
      </View>
      {error ? (
        <Card><Button title="Tải lại danh sách" onPress={() => void loadResumes()} secondary /></Card>
      ) : resumes.length === 0 ? (
        <Card>
          <Text style={styles.empty}>Bạn chưa có CV. Tạo CV đầu tiên để bắt đầu ứng tuyển.</Text>
          <Button title="Tạo CV mới" onPress={() => router.push("/resume/new")} secondary />
        </Card>
      ) : (
        resumes.map((resume) => (
          <Pressable key={resume._id} onPress={() => router.push(`/resume/${resume._id}`)}>
            <Card>
              <Text style={styles.title}>{resume.title}</Text>
              <Text style={styles.meta}>Cập nhật {new Date(resume.updatedAt).toLocaleDateString("vi-VN")}</Text>
              <Text style={styles.status}>{resume.isPublic ? "Đang công khai" : "Bản nháp"} · Chạm để chỉnh sửa</Text>
            </Card>
          </Pressable>
        ))
      )}
      <Link href="/contact" style={styles.contact}>Liên hệ & phản ánh</Link>
      <Pressable onPress={() => void loadResumes()}><Text style={styles.refresh}>Làm mới danh sách</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 12 },
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 12 },
  status: { color: colors.greenDark, fontSize: 12, fontWeight: "600" },
  empty: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  contact: { textAlign: "center", color: colors.greenDark, fontWeight: "700", paddingVertical: 6 },
  refresh: { textAlign: "center", color: colors.muted, fontSize: 12, paddingVertical: 5 },
});
