import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/providers/AuthProvider";
import { colors } from "@/src/components/ui";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Đăng nhập" }} />
          <Stack.Screen name="register" options={{ title: "Tạo tài khoản" }} />
          <Stack.Screen name="forgot-password" options={{ title: "Khôi phục mật khẩu" }} />
          <Stack.Screen name="jobs/[id]" options={{ title: "Chi tiết việc làm" }} />
          <Stack.Screen name="jobs/[id]/apply" options={{ title: "Ứng tuyển" }} />
          <Stack.Screen name="notifications" options={{ title: "Thông báo" }} />
          <Stack.Screen name="resume/new" options={{ title: "Tạo CV" }} />
          <Stack.Screen name="resume/[id]" options={{ title: "Cập nhật CV" }} />
          <Stack.Screen name="contact" options={{ title: "Liên hệ & phản ánh" }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
