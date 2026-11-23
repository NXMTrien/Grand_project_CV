import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const colors = {
  green: "#059669",
  greenDark: "#047857",
  greenLight: "#ecfdf5",
  text: "#0f172a",
  muted: "#64748b",
  line: "#e2e8f0",
  background: "#f8fafc",
  white: "#ffffff",
  red: "#b91c1c",
  redLight: "#fef2f2",
};

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      disabled={loading || disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.secondaryButton,
        (loading || disabled) && styles.disabledButton,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.green : colors.white} />
      ) : (
        <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#94a3b8"
        style={[styles.input, props.multiline && styles.multiline, props.style]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Notice({ message, kind = "error" }: { message: string; kind?: "error" | "success" }) {
  return (
    <View style={[styles.notice, kind === "success" ? styles.successNotice : styles.errorNotice]}>
      <Text style={kind === "success" ? styles.successText : styles.errorText}>{message}</Text>
    </View>
  );
}

export function Loading({ label = "Đang tải..." }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.green} size="large" />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 20, gap: 16 },
  heading: { gap: 5, marginBottom: 4 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  secondaryButton: { backgroundColor: colors.greenLight, borderWidth: 1, borderColor: "#a7f3d0" },
  secondaryButtonText: { color: colors.greenDark },
  disabledButton: { opacity: 0.6 },
  field: { gap: 7 },
  label: { color: "#334155", fontSize: 14, fontWeight: "700" },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    color: colors.text,
    fontSize: 15,
  },
  multiline: { minHeight: 105, paddingTop: 12, textAlignVertical: "top" },
  error: { color: colors.red, fontSize: 12 },
  notice: { borderWidth: 1, borderRadius: 10, padding: 12 },
  errorNotice: { backgroundColor: colors.redLight, borderColor: "#fecaca" },
  errorText: { color: colors.red, fontSize: 13, lineHeight: 19 },
  successNotice: { backgroundColor: colors.greenLight, borderColor: "#a7f3d0" },
  successText: { color: colors.greenDark, fontSize: 13, lineHeight: 19 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  muted: { color: colors.muted, fontSize: 13 },
  card: {
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
});
