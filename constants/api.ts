import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// ─── Base URL resolution ──────────────────────────────────────────────────────
// Set EXPO_PUBLIC_API_URL in your .env, e.g. http://192.168.1.10:4000
const envUrl = process.env.EXPO_PUBLIC_API_URL;
const debuggerHost = (Constants.expoConfig as any)?.hostUri as string | undefined;
const inferredHost = debuggerHost ? debuggerHost.split(":")[0] : "localhost";

export const API_URL = envUrl || `http://${inferredHost}:4000`;

// ─── Token storage ─────────────────────────────────────────────────────────────
const ACCESS_KEY = "heytenant_access_token";
const REFRESH_KEY = "heytenant_refresh_token";
const USER_KEY = "heytenant_user";

export const TokenStore = {
  async getAccess(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_KEY);
  },
  async getRefresh(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_KEY);
  },
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      [ACCESS_KEY, accessToken],
      [REFRESH_KEY, refreshToken],
    ]);
  },
  async saveUser(user: unknown): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async getUser<T = any>(): Promise<T | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, USER_KEY]);
  },
};

// ─── Response envelope (matches backend `success`/`fail` helpers) ─────────────
// Kept as a single flattened shape (rather than a strict discriminated union) so
// callers can read `.data` / `.error` without needing to narrow on `.success` first.
export type ApiResult<T> = {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
};

// ─── Core request helper ───────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = await TokenStore.getAccess();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: { message: json?.error?.message ?? `Request failed (${res.status})` },
      };
    }
    return json as ApiResult<T>;
  } catch {
    return { success: false, error: { message: "Network error — is the server running?" } };
  }
}

export const api = {
  get: <T = any>(path: string) => request<T>(path, { method: "GET" }),
  post: <T = any>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T = any>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T = any>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ─── Auth is handled entirely by Clerk. ─────────────────────────────────────
// Use @clerk/expo hooks (useSignUp, useSignIn, useAuth, useUser) in components.
// The api/authApi helpers below are kept only for non-auth data endpoints.

// ─── Sync authenticated user to MongoDB ──────────────────────────────────────
// Called after Clerk sign-in / sign-up completes.
// `getToken` is the function returned by Clerk's useAuth() hook.
// Returns the stored user document on success, or null on failure (non-fatal).
export async function syncUserWithDB(
  getToken: () => Promise<string | null>,
  payload: {
    clerkId: string;
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: "LANDLORD" | "RENTER";
    landlordCode?: string; // renter only
  }
): Promise<unknown | null> {
  try {
    const token = await getToken();
    if (!token) return null;

    const endpoint =
      payload.role === "LANDLORD"
        ? "/api/auth/register/landlord"
        : "/api/auth/register/renter";

    const body: Record<string, string> = {
      clerkId: payload.clerkId,
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      password: payload.password,
    };
    if (payload.role === "RENTER" && payload.landlordCode) {
      body.landlordCode = payload.landlordCode;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      console.warn("[syncUserWithDB] backend error:", json?.error?.message ?? res.status);
      return null;
    }
    return json?.data?.user ?? null;
  } catch (err) {
    console.warn("[syncUserWithDB] network error:", err);
    return null;
  }
}
