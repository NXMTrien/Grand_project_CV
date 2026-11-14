import { useState } from "react";
import { router } from "expo-router";
import { Button, Field, Heading, Notice, Screen } from "@/src/components/ui";
import { apiRequest } from "@/src/lib/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await apiRequest<{ message?: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: { action: "REQUEST_OTP", email: email.trim().toLowerCase() },
      });
      setSuccess(result.message || "Nếu email có trong hệ thống, mã OTP đã được gửi.");
      setRequested(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể gửi mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await apiRequest<{ message?: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: { action: "RESET_PASSWORD", email: email.trim().toLowerCase(), otpCode: otpCode.trim(), newPassword },
      });
      setSuccess(result.message || "Đặt lại mật khẩu thành công.");
      setTimeout(() => router.replace("/login"), 900);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Không thể đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Heading title="Khôi phục mật khẩu" subtitle="Mã xác thực OTP có hiệu lực trong 5 phút." />
      {error ? <Notice message={error} /> : null}
      {success ? <Notice message={success} kind="success" /> : null}
      <Field label="Email tài khoản" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="email@example.com" editable={!requested} />
      {!requested ? (
        <Button title="Gửi mã OTP" loading={loading} onPress={() => void requestOtp()} />
      ) : (
        <>
          <Field label="Mã OTP 6 số" value={otpCode} onChangeText={setOtpCode} keyboardType="number-pad" maxLength={6} placeholder="000000" />
          <Field label="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Ít nhất 6 ký tự" />
          <Button title="Đặt lại mật khẩu" loading={loading} onPress={() => void resetPassword()} />
          <Button title="Gửi lại mã OTP" secondary loading={loading} onPress={() => void requestOtp()} />
        </>
      )}
    </Screen>
  );
}
