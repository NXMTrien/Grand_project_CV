import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, colors, Heading, Loading, Notice, Screen } from "@/src/components/ui";
import {
  apiRequest,
  categoryName,
  companyName,
  formatSalary,
  type ApiEnvelope,
  type Job,
} from "@/src/lib/api";

const jobsPerPage = 10;

export default function AllJobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest<ApiEnvelope<Job[]>>("/api/jobs");
      setJobs(result.data ?? []);
      setPage(1);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải việc làm.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadJobs);
  }, [loadJobs]);

  const pageCount = Math.max(1, Math.ceil(jobs.length / jobsPerPage));
  const startIndex = (page - 1) * jobsPerPage;
  const pageJobs = jobs.slice(startIndex, startIndex + jobsPerPage);

  return (
    <Screen>
      <Heading title="Tất cả việc làm" subtitle="Khám phá các cơ hội việc làm mới nhất." />

      {loading ? (
        <Loading label="Đang tải việc làm..." />
      ) : error ? (
        <>
          <Notice message={error} />
          <Button title="Thử lại" onPress={() => void loadJobs()} />
        </>
      ) : jobs.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>Hiện chưa có việc làm nào được đăng.</Text>
        </Card>
      ) : (
        <>
          <Text style={styles.resultCount}>
            Hiển thị {startIndex + 1}–{Math.min(startIndex + jobsPerPage, jobs.length)} trong {jobs.length} việc làm
          </Text>

          <View style={styles.list}>
            {pageJobs.map((job) => (
              <Pressable key={job._id} onPress={() => router.push(`/jobs/${job._id}`)}>
                <Card>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.company}>{companyName(job)}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>{formatSalary(job)}</Text>
                    <Text style={styles.meta}>{job.location || "Chưa rõ khu vực"}</Text>
                  </View>
                  <Text style={styles.category}>{categoryName(job) || job.jobType || "Việc làm"}</Text>
                </Card>
              </Pressable>
            ))}
          </View>

          <View style={styles.pagination}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Trang trước"
              accessibilityState={{ disabled: page === 1 }}
              disabled={page === 1}
              onPress={() => setPage((currentPage) => currentPage - 1)}
              style={[styles.pageButton, page === 1 && styles.disabledPageButton]}
            >
              <Text style={styles.pageButtonText}>Trước</Text>
            </Pressable>
            <Text accessibilityLiveRegion="polite" style={styles.pageLabel}>
              Trang {page} / {pageCount}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Trang tiếp theo"
              accessibilityState={{ disabled: page === pageCount }}
              disabled={page === pageCount}
              onPress={() => setPage((currentPage) => currentPage + 1)}
              style={[styles.pageButton, page === pageCount && styles.disabledPageButton]}
            >
              <Text style={styles.pageButtonText}>Tiếp</Text>
            </Pressable>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  resultCount: { color: colors.muted, fontSize: 13 },
  list: { gap: 10 },
  jobTitle: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 22 },
  company: { color: "#475569", fontSize: 13, fontWeight: "600" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  meta: { color: colors.greenDark, fontSize: 12, fontWeight: "700" },
  category: {
    alignSelf: "flex-start",
    color: "#475569",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 11,
  },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  pagination: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  pageButton: {
    minWidth: 76,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: colors.greenLight,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  disabledPageButton: { opacity: 0.45 },
  pageButtonText: { color: colors.greenDark, fontSize: 13, fontWeight: "700" },
  pageLabel: { color: colors.text, fontSize: 13, fontWeight: "700" },
});
