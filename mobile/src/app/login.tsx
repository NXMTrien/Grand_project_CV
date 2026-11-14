import { useState } from "react";
import { Link, router } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { Button, colors, Field, Heading, Notice, Screen } from "@/src/components/ui";
import { useAuth } from "@/src/providers/AuthProvider";
import useAlertState from "@/src/hooks/useAlertState";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useAlertState("", (message) => message);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Heading title="Chào mừng trở lại" subtitle="Đăng nhập tài khoản ứng viên GrandJob." />
      {error ? <Notice message={error} /> : null}
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="email@example.com" />
      <Field label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Nhập mật khẩu" />
      <Button title="Đăng nhập" loading={loading} onPress={() => void submit()} />
      <Link href="/forgot-password" style={styles.link}>Quên mật khẩu?</Link>
      <Text style={styles.footer}>Chưa có tài khoản? <Link href="/register" style={styles.link}>Đăng ký ứng viên</Link></Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.greenDark, fontSize: 14, fontWeight: "700", textAlign: "center", paddingVertical: 5 },
  footer: { color: colors.muted, textAlign: "center", marginTop: 10 },
});
