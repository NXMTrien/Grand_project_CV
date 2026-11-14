import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { Button, Card, colors, Heading, Loading, Screen } from "@/src/components/ui";
import { useAuth } from "@/src/providers/AuthProvider";
import { apiRequest, type ApiEnvelope, type NotificationItem } from "@/src/lib/api";
import useAlertState from "@/src/hooks/useAlertState";

export default function NotificationsScreen() {
  const { token, ready } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState("");
  const [error, setError] = useAlertState("", (message) => message, false);

  const loadNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await apiRequest<ApiEnvelope<NotificationItem[]>>("/api/notifications", { token });
      setNotifications(result.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải thông báo.");
    } finally {
      setLoading(false);
    }
  }, [setError, token]);

  useEffect(() => {
    if (ready) void Promise.resolve().then(loadNotifications);
  }, [ready, loadNotifications]);

  const openNotification = async (item: NotificationItem) => {
    if (!token) return;
    setError("");
    setOpeningId(item._id);
    try {
      if (!item.isRead) {
        await apiRequest("/api/notifications", {
          method: "PATCH",
          token,
          body: { notificationId: item._id },
        });
        setNotifications((current) =>
          current.map((notification) =>
            notification._id === item._id ? { ...notification, isRead: true } : notification
          )
        );
      }

      if (item.href === "/my-resumes") {
        router.push("/(tabs)/resumes");
      } else {
        const jobMatch = item.href.match(/^\/jobs\/([a-f\d]{24})$/i);
        if (jobMatch) router.push(`/jobs/${jobMatch[1]}`);
      }
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Không thể cập nhật thông báo.");
    } finally {
      setOpeningId("");
    }
  };

  if (!ready || loading) return <Loading label="Đang tải thông báo..." />;
  if (!token) {
    return (
      <Screen>
        <Heading title="Thông báo" subtitle="Đăng nhập để xem phản hồi từ nhà tuyển dụng." />
        <Button title="Đăng nhập" onPress={() => router.push("/login")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Heading title="Thông báo" subtitle="Cập nhật mới nhất về hồ sơ ứng tuyển của bạn." />
      {error ? (
        <Card><Button title="Tải lại thông báo" onPress={() => void loadNotifications()} secondary /></Card>
      ) : notifications.length === 0 ? (
        <Card><Text style={styles.empty}>Bạn chưa có thông báo mới.</Text></Card>
      ) : (
        notifications.map((item) => (
          <Pressable key={item._id} disabled={openingId === item._id} onPress={() => void openNotification(item)}>
            <Card>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.meta}>
                {new Date(item.createdAt).toLocaleString("vi-VN")} · {item.isRead ? "Đã đọc" : "Chưa đọc"}
              </Text>
              {openingId === item._id ? <Text style={styles.action}>Đang cập nhật...</Text> : null}
            </Card>
          </Pressable>
        ))
      )}
      <Button title="Làm mới" secondary onPress={() => void loadNotifications()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, fontSize: 14 },
  title: { color: colors.text, fontSize: 15, fontWeight: "800" },
  message: { color: "#475569", fontSize: 13, lineHeight: 20 },
  meta: { color: colors.muted, fontSize: 11 },
  action: { color: colors.greenDark, fontSize: 12, fontWeight: "700" },
});
