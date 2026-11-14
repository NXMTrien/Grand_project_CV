import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { apiRequest } from "@/src/lib/api";
import { Button, Card, colors, Field, Heading, Notice, Screen } from "@/src/components/ui";
import useAlertState from "@/src/hooks/useAlertState";

interface CompanyOption {
  _id: string;
  name: string;
}

export default function ContactScreen() {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useAlertState("", (message) => message);
  const [success, setSuccess] = useAlertState("", (message) => message);

  useEffect(() => {
    let active = true;
    void apiRequest<CompanyOption[]>("/api/companies")
      .then((result) => { if (active) setCompanies(result); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Không thể tải công ty.");
      })
      .finally(() => { if (active) setLoadingCompanies(false); });
    return () => { active = false; };
  }, [setError]);

  const submit = async () => {
    setError("");
    setSuccess("");
    if (!companyName.trim()) {
      setError("Vui lòng nhập tên công ty được phản ánh.");
      return;
    }
    if (content.trim().length < 10 || content.trim().length > 5000) {
      setError("Nội dung phản ánh cần từ 10 đến 5.000 ký tự.");
      return;
    }
    if (!isAnonymous && (!contactName.trim() || (!contactEmail.trim() && !contactPhone.trim()))) {
      setError("Nhập họ tên và email hoặc số điện thoại, hoặc chọn gửi ẩn danh.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiRequest<{ message?: string }>("/api/feedback", {
        method: "POST",
        body: { companyName: companyName.trim(), isAnonymous, contactName: isAnonymous ? "" : contactName.trim(), contactEmail: isAnonymous ? "" : contactEmail.trim(), contactPhone: isAnonymous ? "" : contactPhone.trim(), content: content.trim() },
      });
      setSuccess(result.message || "Cảm ơn bạn đã gửi phản ánh.");
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContent("");
      setIsAnonymous(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi phản ánh.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Heading title="Liên hệ & phản ánh" subtitle="Ban quản trị sẽ kiểm tra thông tin bạn gửi. Bạn có thể chọn gửi ẩn danh." />
      {error ? <Notice message={error} /> : null}
      {success ? <Notice message={success} kind="success" /> : null}
      <Card>
        <Field label="Công ty được phản ánh" value={companyName} onChangeText={setCompanyName} maxLength={160} placeholder="Nhập hoặc chọn tên công ty" />
        {companies.length ? (
          <View style={styles.suggestions}>
            {companies.slice(0, 8).map((company) => (
              <Pressable key={company._id} onPress={() => setCompanyName(company.name)} style={styles.suggestion}>
                <Text style={styles.suggestionText}>{company.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : loadingCompanies ? (
          <Text style={styles.hint}>Đang tải danh sách công ty...</Text>
        ) : (
          <Text style={styles.hint}>Bạn vẫn có thể nhập tên công ty trực tiếp.</Text>
        )}

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Gửi phản ánh ẩn danh</Text>
          <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{ true: colors.green }} />
        </View>
        {!isAnonymous ? (
          <>
            <Field label="Họ và tên" value={contactName} onChangeText={setContactName} maxLength={120} />
            <Field label="Email liên hệ" value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address" autoCapitalize="none" maxLength={254} />
            <Field label="Số điện thoại (nếu có)" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" maxLength={30} />
            <Text style={styles.hint}>Vui lòng cung cấp email hoặc số điện thoại để Ban quản trị phản hồi.</Text>
          </>
        ) : null}
        <Field label={`Nội dung phản ánh (${content.length}/5000)`} value={content} onChangeText={setContent} multiline maxLength={5000} placeholder="Mô tả chi tiết (ít nhất 10 ký tự)" />
        <Button title="Gửi phản ánh" loading={submitting} onPress={() => void submit()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  suggestion: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: colors.greenLight },
  suggestionText: { color: colors.greenDark, fontSize: 11, fontWeight: "600" },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 3 },
  toggleLabel: { color: "#334155", fontSize: 14, fontWeight: "600" },
});
