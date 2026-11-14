import { useState } from "react";
import { Link, router } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { apiRequest } from "@/src/lib/api";
import { Button, colors, Field, Heading, Notice, Screen } from "@/src/components/ui";
import useAlertState from "@/src/hooks/useAlertState";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useAlertState("", (message) => message);
  const [success, setSuccess] = useAlertState("", (message) => message);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setSuccess("");
    if (!fullName.trim() || !email.trim() || !dateOfBirth.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setError("Ngày sinh cần đúng định dạng YYYY-MM-DD.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest<{ message?: string }>("/api/auth/register", {
        method: "POST",
        body: { fullName: fullName.trim(), email: email.trim().toLowerCase(), password, dateOfBirth },
      });
      setSuccess(result.message || "Đăng ký thành công. Hãy đăng nhập.");
      setTimeout(() => router.replace("/login"), 900);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Heading title="Tạo tài khoản ứng viên" subtitle="Tài khoản dành cho người tìm việc từ 18 tuổi." />
      {error ? <Notice message={error} /> : null}
      {success ? <Notice message={success} kind="success" /> : null}
      <Field label="Họ và tên" value={fullName} onChangeText={setFullName} autoComplete="name" placeholder="Nguyễn Văn A" />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="email@example.com" />
      <Field label="Mật khẩu (ít nhất 6 ký tự)" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder="Tạo mật khẩu" />
      <Field label="Ngày sinh (YYYY-MM-DD)" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="1995-05-20" keyboardType="numbers-and-punctuation" />
      <Button title="Đăng ký" loading={loading} onPress={() => void submit()} />
      <Text style={styles.footer}>Đã có tài khoản? <Link href="/login" style={styles.link}>Đăng nhập</Link></Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { color: colors.muted, textAlign: "center" },
  link: { color: colors.greenDark, fontWeight: "700" },
});
