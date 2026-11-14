import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { Button, Card, colors, Field, Heading, Loading, Notice, Screen } from "@/src/components/ui";
import { useAuth } from "@/src/providers/AuthProvider";
import { apiRequest, type ApiEnvelope, type Resume } from "@/src/lib/api";
import useAlertState from "@/src/hooks/useAlertState";

export default function ApplyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useAlertState("", (message) => message);
  const [success, setSuccess] = useAlertState("", (message) => message);

  const loadResumes = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await apiRequest<ApiEnvelope<Resume[]>>("/api/resume", { token });
      const list = result.data ?? [];
      setResumes(list);
      setSelectedId((current) => current || list[0]?._id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách CV.");
    } finally {
      setLoading(false);
    }
  }, [setError, token]);

  useEffect(() => {
    void Promise.resolve().then(loadResumes);
  }, [loadResumes]);

  const submitApplication = async () => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!selectedId) {
      setError("Bạn cần chọn CV trước khi ứng tuyển.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const result = await apiRequest<{ message?: string }>(`/api/jobs/${encodeURIComponent(id)}/apply`, {
        method: "POST",
        token,
        body: { resumeId: selectedId, coverLetter: coverLetter.trim() },
      });
      setSuccess(result.message || "Ứng tuyển thành công.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi hồ sơ ứng tuyển.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Screen>
        <Heading title="Đăng nhập để ứng tuyển" />
        <Button title="Đăng nhập" onPress={() => router.push("/login")} />
      </Screen>
    );
  }
  if (loading) return <Loading label="Đang tải CV..." />;

  return (
    <Screen>
      <Heading title="Hoàn tất ứng tuyển" subtitle="Chọn một CV trong tài khoản và thêm lời nhắn nếu cần." />
      {error ? <Notice message={error} /> : null}
      {success ? (
        <Card>
          <Notice message={success} kind="success" />
          <Button title="Tiếp tục tìm việc" onPress={() => router.replace("/(tabs)")} />
        </Card>
      ) : (
        <>
          {resumes.length === 0 ? (
            <Card>
              <Text style={styles.empty}>Bạn chưa có CV để ứng tuyển. Tạo CV trước rồi quay lại trang này.</Text>
              <Button title="Tạo CV mới" onPress={() => router.push("/resume/new")} secondary />
            </Card>
          ) : (
            <Card>
              <Text style={styles.sectionTitle}>Chọn CV</Text>
              {resumes.map((resume) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedId === resume._id }}
                  key={resume._id}
                  onPress={() => setSelectedId(resume._id)}
                  style={[styles.resumeOption, selectedId === resume._id && styles.selectedResume]}
                >
                  <Text style={styles.resumeTitle}>{selectedId === resume._id ? "●" : "○"}  {resume.title}</Text>
                  <Text style={styles.resumeMeta}>{resume.isPublic ? "Đang công khai" : "Bản nháp"}</Text>
                </Pressable>
              ))}
              <Field
                label="Lời nhắn cho nhà tuyển dụng (không bắt buộc)"
                value={coverLetter}
                onChangeText={setCoverLetter}
                multiline
                maxLength={3000}
                placeholder="Giới thiệu ngắn gọn về bản thân..."
              />
              <Button title="Gửi hồ sơ ứng tuyển" loading={submitting} onPress={() => void submitApplication()} />
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  sectionTitle: { color: colors.text, fontWeight: "800", fontSize: 16 },
  resumeOption: { padding: 13, borderRadius: 10, borderWidth: 1, borderColor: colors.line, gap: 5 },
  selectedResume: { borderColor: colors.green, backgroundColor: colors.greenLight },
  resumeTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  resumeMeta: { color: colors.muted, fontSize: 12, marginLeft: 22 },
});
