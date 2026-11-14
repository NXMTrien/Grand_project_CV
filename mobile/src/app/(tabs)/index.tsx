import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  apiRequest,
  categoryName,
  companyName,
  formatSalary,
  type ApiEnvelope,
  type Category,
  type Job,
} from "@/src/lib/api";
import { Button, Card, colors, Heading, Loading, Screen } from "@/src/components/ui";
import useAlertState from "@/src/hooks/useAlertState";

const salaryFilters = [
  { label: "Mọi mức lương", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Dưới 10 triệu", min: 0, max: 10_000_000 },
  { label: "10–20 triệu", min: 10_000_000, max: 20_000_000 },
  { label: "20–30 triệu", min: 20_000_000, max: 30_000_000 },
  { label: "Trên 30 triệu", min: 30_000_000, max: Number.POSITIVE_INFINITY },
];

interface FilterOption {
  label: string;
  value: string;
}

interface AppliedFilters {
  search: string;
  location: string;
  categoryId: string;
  salaryFilter: number;
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [salaryFilter, setSalaryFilter] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useAlertState("", (message) => message, false);

  const loadData = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [jobResult, categoryResult] = await Promise.all([
        apiRequest<ApiEnvelope<Job[]>>("/api/jobs"),
        apiRequest<Category[]>("/api/categories"),
      ]);
      setJobs(jobResult.data ?? []);
      setCategories(categoryResult);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải việc làm.");
    } finally {
      setLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const locationOptions = useMemo<FilterOption[]>(() => {
    const locations = Array.from(
      new Set(jobs.map((job) => job.location?.trim()).filter((value): value is string => Boolean(value))),
    ).sort((left, right) => left.localeCompare(right, "vi"));
    return [
      { label: "Tất cả khu vực", value: "" },
      ...locations.map((value) => ({ label: value, value })),
    ];
  }, [jobs]);

  const categoryOptions = useMemo<FilterOption[]>(
    () => [
      { label: "Tất cả ngành nghề", value: "" },
      ...categories.map((category) => ({ label: category.name, value: category._id })),
    ],
    [categories],
  );

  const filteredJobs = useMemo(() => {
    if (!appliedFilters) return jobs.slice(0, 6);

    const query = appliedFilters.search.trim().toLocaleLowerCase("vi");
    const place = appliedFilters.location.toLocaleLowerCase("vi");
    const salary = salaryFilters[appliedFilters.salaryFilter];
    return jobs.filter((job) => {
      const text = `${job.title} ${companyName(job)} ${categoryName(job)}`.toLocaleLowerCase("vi");
      const jobLocation = (job.location ?? "").toLocaleLowerCase("vi");
      const jobCategoryId = typeof job.categoryId === "object" ? job.categoryId?._id : job.categoryId;
      const categoryMatches = !appliedFilters.categoryId || jobCategoryId === appliedFilters.categoryId;
      const salaryMatches =
        appliedFilters.salaryFilter === 0 ||
        ((job.salaryMax ?? 0) >= salary.min && (job.salaryMin ?? 0) <= salary.max);
      return (
        (!query || text.includes(query)) &&
        (!place || jobLocation === place) &&
        categoryMatches &&
        salaryMatches
      );
    });
  }, [appliedFilters, jobs]);

  const handleSearch = () => {
    setAppliedFilters({ search, location, categoryId, salaryFilter });
  };

  const clearSearch = () => {
    setSearch("");
    setLocation("");
    setCategoryId("");
    setSalaryFilter(0);
    setAppliedFilters(null);
  };

  return (
    <Screen>
      <View style={styles.brandRow}>
        <View>
          <Text style={styles.brand}>
            Grand<Text style={styles.brandLight}>Job</Text>
          </Text>
          <Text style={styles.brandCaption}>Công việc phù hợp, cơ hội mới</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push("../notifications")} style={styles.contactButton}>
            <Text style={styles.contactText}>Thông báo</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/contact")} style={styles.contactButton}>
            <Text style={styles.contactText}>Phản ánh</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>CƠ HỘI NGHỀ NGHIỆP MỖI NGÀY</Text>
        <Text style={styles.heroTitle}>Tìm việc làm phù hợp với bạn</Text>
        <Text style={styles.heroSubtitle}>
          Khám phá việc làm mới từ các nhà tuyển dụng và bắt đầu bước tiếp theo trong sự nghiệp.
        </Text>
      </View>

      <Card>
        <Text style={styles.searchTitle}>Tìm kiếm công việc</Text>
        <TextInput
          accessibilityLabel="Tìm vị trí hoặc công ty"
          value={search}
          onChangeText={setSearch}
          placeholder="Vị trí, kỹ năng hoặc công ty"
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          returnKeyType="search"
        />
        <FilterDropdown
          label="Ngành nghề"
          placeholder="Chọn ngành nghề"
          options={categoryOptions}
          value={categoryId}
          onSelect={setCategoryId}
        />
        <FilterDropdown
          label="Nơi muốn làm việc"
          placeholder="Chọn khu vực làm việc"
          options={locationOptions}
          value={location}
          onSelect={setLocation}
        />

        <View style={styles.filterGroup}>
          <Text style={styles.filterTitle}>Mức lương</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {salaryFilters.map((filter, index) => (
              <FilterChip
                key={filter.label}
                label={filter.label}
                selected={salaryFilter === index}
                onPress={() => setSalaryFilter(index)}
              />
            ))}
          </ScrollView>
        </View>

        <Button title="Tìm kiếm công việc" onPress={handleSearch} />
      </Card>

      <View style={styles.featuredBanner}>
        <Text style={styles.featuredLabel}>GRANDJOB GỢI Ý</Text>
        <Text style={styles.featuredTitle}>Cơ hội mới đang chờ bạn</Text>
        <Text style={styles.featuredText}>
          Chọn ngành nghề và khu vực mong muốn để khám phá công việc phù hợp.
        </Text>
        <Pressable onPress={clearSearch} style={styles.featuredButton}>
          <Text style={styles.featuredButtonText}>Khám phá việc làm</Text>
        </Pressable>
      </View>

      <View style={styles.resultsHeader}>
        <Heading
          title={appliedFilters ? "Kết quả tìm kiếm" : "Việc làm tốt nhất"}
          subtitle={
            appliedFilters
              ? `${filteredJobs.length} công việc phù hợp`
              : "Một số cơ hội mới nhất dành cho bạn"
          }
        />
        {appliedFilters ? (
          <Pressable accessibilityRole="button" onPress={clearSearch}>
            <Text style={styles.refreshText}>Xóa lọc</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => void loadData()}>
            <Text style={styles.refreshText}>Làm mới</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <Loading label="Đang tải việc làm..." />
      ) : error ? (
        <Card>
          <Button title="Thử lại" onPress={() => void loadData()} />
        </Card>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>Không tìm thấy việc làm phù hợp. Hãy thử thay đổi bộ lọc.</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {filteredJobs.map((job) => (
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
      )}
    </Screen>
  );
}

function FilterDropdown({
  label,
  placeholder,
  options,
  value,
  onSelect,
}: {
  label: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onSelect: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  const selectOption = (optionValue: string) => {
    onSelect(optionValue);
    setVisible(false);
  };

  return (
    <View style={styles.dropdownGroup}>
      <Text style={styles.filterTitle}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedLabel || placeholder}`}
        onPress={() => setVisible(true)}
        style={styles.dropdownButton}
      >
        <Text style={[styles.dropdownValue, !selectedLabel && styles.dropdownPlaceholder]}>
          {selectedLabel || placeholder}
        </Text>
        <Text style={styles.dropdownChevron}>⌄</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng danh sách lựa chọn"
            onPress={() => setVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Đóng"
                onPress={() => setVisible(false)}
                hitSlop={10}
              >
                <Text style={styles.modalClose}>Đóng</Text>
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(option) => option.value || "all"}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => selectOption(item.value)}
                    style={[styles.option, selected && styles.selectedOption]}
                  >
                    <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                      {item.label}
                    </Text>
                    {selected ? <Text style={styles.checkmark}>✓</Text> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selectedChip]}
    >
      <Text style={[styles.chipText, selected && styles.selectedChipText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  brand: { color: colors.greenDark, fontSize: 23, fontWeight: "900" },
  brandLight: { color: colors.text },
  brandCaption: { color: colors.muted, fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 6 },
  contactButton: { paddingHorizontal: 10, paddingVertical: 9, backgroundColor: colors.greenLight, borderRadius: 10 },
  contactText: { color: colors.greenDark, fontSize: 11, fontWeight: "700" },
  hero: { padding: 20, borderRadius: 16, backgroundColor: "#064e3b", gap: 8 },
  heroEyebrow: { color: "#a7f3d0", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  heroTitle: { color: colors.white, fontSize: 24, lineHeight: 31, fontWeight: "800" },
  heroSubtitle: { color: "#d1fae5", fontSize: 13, lineHeight: 19 },
  searchTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  searchInput: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
    paddingHorizontal: 13,
    color: colors.text,
    fontSize: 14,
  },
  dropdownGroup: { gap: 7 },
  filterGroup: { gap: 9 },
  filterTitle: { color: colors.text, fontSize: 13, fontWeight: "700" },
  dropdownButton: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dropdownValue: { color: colors.text, fontSize: 14, flex: 1 },
  dropdownPlaceholder: { color: "#94a3b8" },
  dropdownChevron: { color: colors.greenDark, fontSize: 20, fontWeight: "700" },
  chips: { gap: 8, paddingRight: 20 },
  chip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  selectedChip: { borderColor: colors.green, backgroundColor: colors.greenLight },
  chipText: { color: "#475569", fontSize: 12, fontWeight: "600" },
  selectedChipText: { color: colors.greenDark },
  featuredBanner: { padding: 18, borderRadius: 16, backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#a7f3d0", gap: 8 },
  featuredLabel: { color: colors.greenDark, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  featuredTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  featuredText: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  featuredButton: { alignSelf: "flex-start", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 9, backgroundColor: colors.greenDark },
  featuredButtonText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  resultsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6, gap: 8 },
  refreshText: { color: colors.greenDark, fontSize: 13, fontWeight: "700" },
  list: { gap: 10 },
  jobTitle: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 22 },
  company: { color: "#475569", fontSize: 13, fontWeight: "600" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  meta: { color: colors.greenDark, fontSize: 12, fontWeight: "700" },
  category: { alignSelf: "flex-start", color: "#475569", backgroundColor: "#f1f5f9", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, fontSize: 11 },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.45)" },
  modalSheet: { maxHeight: "78%", paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: colors.white },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  modalClose: { color: colors.greenDark, fontSize: 14, fontWeight: "700" },
  option: { minHeight: 48, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  selectedOption: { backgroundColor: colors.greenLight },
  optionText: { color: colors.text, fontSize: 14, flex: 1 },
  selectedOptionText: { color: colors.greenDark, fontWeight: "700" },
  checkmark: { color: colors.greenDark, fontSize: 16, fontWeight: "800" },
});
