import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/providers/AuthProvider";
import { Button, Card, colors, Heading, Loading, Notice, Screen } from "@/src/components/ui";
import { apiRequest, categoryName, companyName, formatSalary, type ApiEnvelope, type Job } from "@/src/lib/api";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void apiRequest<ApiEnvelope<Job>>(`/api/jobs/${encodeURIComponent(id)}`)
      .then((result) => {
        if (active) setJob(result.data ?? null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Không thể tải việc làm.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  if (loading) return <Loading label="Đang tải chi tiết việc làm..." />;
  if (error || !job) {
    return (
      <Screen>
        <Notice message={error || "Không tìm thấy việc làm."} />
        <Button title="Quay lại danh sách" onPress={() => router.replace("/(tabs)")} secondary />
      </Screen>
    );
  }

  const isClosed = job.hiringStatus === "CLOSED";

  return (
    <Screen>
      <Card>
        <Heading title={job.title} subtitle={companyName(job)} />
        <View style={styles.badges}>
          <Text style={styles.badge}>{formatSalary(job)}</Text>
          <Text style={styles.badge}>{job.location || "Chưa rõ khu vực"}</Text>
          {job.jobType ? <Text style={styles.badge}>{job.jobType}</Text> : null}
          {categoryName(job) ? <Text style={styles.badge}>{categoryName(job)}</Text> : null}
        </View>
        {job.experience ? <Text style={styles.meta}>Kinh nghiệm: {job.experience}</Text> : null}
        {job.deadline ? <Text style={styles.meta}>Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}</Text> : null}
        <Button
          title={isClosed ? "Đã đóng tuyển dụng" : "Ứng tuyển ngay"}
          disabled={isClosed}
          onPress={() => {
            if (!token) router.push("/login");
            else router.push(`/jobs/${job._id}/apply`);
          }}
        />
        {!token && !isClosed ? <Text style={styles.loginHint}>Bạn cần đăng nhập tài khoản ứng viên để ứng tuyển.</Text> : null}
      </Card>

      <JobSection title="Mô tả công việc" content={job.description} />
      <JobSection title="Yêu cầu ứng viên" content={job.requirements} />
      <JobSection title="Quyền lợi" content={job.benefits} />
    </Screen>
  );
}

function JobSection({ title, content }: { title: string; content?: string }) {
  if (!content?.trim()) return null;
  return (
    <Card>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{content}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  badge: { color: colors.greenDark, backgroundColor: colors.greenLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, fontSize: 12, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
  loginHint: { color: colors.muted, fontSize: 12, textAlign: "center" },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  body: { color: "#334155", fontSize: 14, lineHeight: 22 },
});
