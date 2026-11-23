import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, type UserProfile } from "@/src/lib/api";

interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: UserProfile;
  data?: { token?: string; user?: UserProfile };
  message?: string;
}

interface AuthContextValue {
  token: string | null;
  user: UserProfile | null;
  ready: boolean;
  restoreError: string | null;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  refreshProfile(): Promise<UserProfile>;
  setUser(user: UserProfile): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "grandjob.auth.token";
const USER_KEY = "grandjob.auth.user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (savedToken) setToken(savedToken);
        if (savedUser) {
          const parsed: unknown = JSON.parse(savedUser);
          if (parsed && typeof parsed === "object" && "email" in parsed) {
            setUser(parsed as UserProfile);
          }
        }
      } catch (error) {
        setRestoreError(error instanceof Error ? error.message : "Không thể khôi phục phiên đăng nhập.");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { email: email.trim().toLowerCase(), password },
    });
    const accessToken = result.token ?? result.accessToken ?? result.data?.token;
    const profile = result.user ?? result.data?.user;
    if (!accessToken || !profile) throw new Error("Máy chủ không trả về thông tin đăng nhập hợp lệ.");
    if (profile.role?.toUpperCase() !== "CANDIDATE") {
      throw new Error("Ứng dụng Mobile này dành cho tài khoản ứng viên.");
    }

    try {
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(profile));
    } catch (error) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      throw error;
    }
    setToken(accessToken);
    setUser(profile);
    setRestoreError(null);
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) throw new Error("Vui lòng đăng nhập để tiếp tục.");
    const result = await apiRequest<{ data: UserProfile }>("/api/users/profile", { token });
    setUser(result.data);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.data));
    return result.data;
  }, [token]);

  const value = useMemo(
    () => ({ token, user, ready, restoreError, signIn, signOut, refreshProfile, setUser }),
    [token, user, ready, restoreError, signIn, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth phải được sử dụng bên trong AuthProvider.");
  return value;
}
