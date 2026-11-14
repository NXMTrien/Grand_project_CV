import { useCallback, useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { Button, Card, colors, Field, Heading, Loading, Notice, Screen } from "@/src/components/ui";
import { useAuth } from "@/src/providers/AuthProvider";
import { apiRequest, type ApiEnvelope, type UserProfile } from "@/src/lib/api";
import useAlertState from "@/src/hooks/useAlertState";

export default function ProfileScreen() {
  const { token, user, ready, signOut, setUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useAlertState("", (message) => message);
  const [success, setSuccess] = useAlertState("", (message) => message);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await apiRequest<ApiEnvelope<UserProfile>>("/api/users/profile", { token });
      if (!result.data) throw new Error("Máy chủ không trả về thông tin hồ sơ.");
      setProfile(result.data);
      setFullName(result.data.fullName ?? "");
      setPhone(result.data.phone ?? "");
      setAvatar(result.data.avatar ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải hồ sơ.");
    } finally {
      setLoading(false);
    }
  }, [setError, token]);

  useEffect(() => {
    if (ready) void Promise.resolve().then(loadProfile);
  }, [ready, loadProfile]);

  const saveProfile = async () => {
    if (!token) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const result = await apiRequest<ApiEnvelope<UserProfile>>("/api/users/profile", {
        method: "PUT",
        token,
        body: { fullName: fullName.trim(), phone: phone.trim(), avatar: avatar.trim() },
      });
      if (!result.data) throw new Error("Máy chủ không trả về hồ sơ đã cập nhật.");
      setProfile(result.data);
      setUser(result.data);
      setSuccess(result.message || "Cập nhật hồ sơ thành công.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!token) return;
    setError("");
    setSuccess("");
    setChangingPassword(true);
    try {
      const result = await apiRequest<{ message?: string }>("/api/users/profile", {
        method: "PATCH",
        token,
        body: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setSuccess(result.message || "Đổi mật khẩu thành công.");
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "Không thể đổi mật khẩu.");
    } finally {
      setChangingPassword(false);
    }
  };

  const logout = async () => {
    setError("");
    try {
      await signOut();
      router.replace("/(tabs)");
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Không thể đăng xuất.");
    }
  };

  if (!ready || loading) return <Loading label="Đang tải tài khoản..." />;
  if (!token) {
    return (
      <Screen>
        <Heading title="Tài khoản" subtitle="Đăng nhập để quản lý hồ sơ và CV." />
        <Button title="Đăng nhập" onPress={() => router.push("/login")} />
        <Button title="Tạo tài khoản ứng viên" onPress={() => router.push("/register")} secondary />
        <Link href="/contact" style={styles.link}>Liên hệ & phản ánh</Link>
      </Screen>
    );
  }

  return (
    <Screen>
      <Heading title="Tài khoản của bạn" subtitle={profile?.email || user?.email} />
      {error ? <Notice message={error} /> : null}
      {success ? <Notice message={success} kind="success" /> : null}
      <Card>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <Field label="Họ và tên" value={fullName} onChangeText={setFullName} autoComplete="name" />
        <Field label="Email" value={profile?.email || user?.email || ""} editable={false} />
        <Field label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Ảnh đại diện (URL)" value={avatar} onChangeText={setAvatar} autoCapitalize="none" placeholder="https://" />
        <Button title="Lưu hồ sơ" loading={saving} onPress={() => void saveProfile()} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
        <Field label="Mật khẩu hiện tại" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <Field label="Mật khẩu mới (ít nhất 6 ký tự)" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Button title="Cập nhật mật khẩu" loading={changingPassword} secondary onPress={() => void changePassword()} />
      </Card>

      <Pressable onPress={() => router.push("/contact")} style={styles.menuItem}>
        <Text style={styles.menuTitle}>Liên hệ & phản ánh</Text>
        <Text style={styles.menuSubtitle}>Gửi phản ánh về công ty cho Ban quản trị</Text>
      </Pressable>

      <Pressable onPress={() => router.push("../notifications")} style={styles.menuItem}>
        <Text style={styles.menuTitle}>Thông báo ứng tuyển</Text>
        <Text style={styles.menuSubtitle}>Theo dõi phản hồi từ nhà tuyển dụng</Text>
      </Pressable>

      <Button title="Đăng xuất" secondary onPress={() => void logout()} />
      <Pressable onPress={() => void loadProfile()}><Text style={styles.link}>Làm mới hồ sơ</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  menuItem: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 15, gap: 5 },
  menuTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  menuSubtitle: { color: colors.muted, fontSize: 12 },
  link: { color: colors.greenDark, textAlign: "center", fontSize: 13, fontWeight: "700", padding: 8 },
});
