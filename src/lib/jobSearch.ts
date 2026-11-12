export type SalaryRange = "" | "under-10" | "10-20" | "20-30" | "30-plus";

export const SALARY_RANGES: { value: SalaryRange; label: string }[] = [
  { value: "under-10", label: "Dưới 10 triệu" },
  { value: "10-20", label: "10 - 20 triệu" },
  { value: "20-30", label: "20 - 30 triệu" },
  { value: "30-plus", label: "Từ 30 triệu" },
];

export function isSalaryRange(value: string | null): value is SalaryRange {
  return value === "" || SALARY_RANGES.some((range) => range.value === value);
}

export function matchesSalaryRange(
  salaryMin: number | undefined,
  salaryMax: number | undefined,
  range: SalaryRange
) {
  if (!range) return true;

  const minimum = salaryMin ?? 0;
  const maximum = salaryMax || minimum;
  if (maximum <= 0) return false;

  switch (range) {
    case "under-10":
      return minimum < 10_000_000;
    case "10-20":
      return maximum >= 10_000_000 && minimum < 20_000_000;
    case "20-30":
      return maximum >= 20_000_000 && minimum < 30_000_000;
    case "30-plus":
      return maximum >= 30_000_000;
  }
}
