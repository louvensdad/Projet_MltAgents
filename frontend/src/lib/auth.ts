import { API_BASE } from "@/lib/config";

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
  must_reset_password?: boolean;
  last_login_at?: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  redirect_url?: string;
  user: AuthUser;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  email?: string;
  reset_token?: string;
  reset_url?: string;
  expires_at?: string;
  expires_in_minutes?: number;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  login_url?: string;
}

export interface AuthErrorDetails {
  error_code?: string;
  message?: string;
  details?: string[];
}

async function parseJson(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json().catch(() => null);
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await parseJson(response);
  if (!response.ok || json?.success === false) {
    const message = json?.detail?.message || json?.message || json?.detail || `HTTP ${response.status}`;
    const error = new Error(message);
    (error as Error & { status?: number; details?: AuthErrorDetails }).status = response.status;
    (error as Error & { status?: number; details?: AuthErrorDetails }).details = json?.detail || json;
    throw error;
  }

  return json as T;
}

export function storeAuthSession(response: LoginResponse, persist = true) {
  if (typeof window === "undefined") return;
  const storage = persist ? window.localStorage : window.sessionStorage;
  storage.setItem("ldcn_auth_token", response.access_token);
  storage.setItem("ldcn_refresh_token", response.refresh_token);
  storage.setItem("ldcn_auth_user", JSON.stringify(response.user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ldcn_auth_token");
  localStorage.removeItem("ldcn_refresh_token");
  localStorage.removeItem("ldcn_auth_user");
  sessionStorage.removeItem("ldcn_auth_token");
  sessionStorage.removeItem("ldcn_refresh_token");
  sessionStorage.removeItem("ldcn_auth_user");
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ldcn_auth_token") || sessionStorage.getItem("ldcn_auth_token");
}

export function hasAuthSession(): boolean {
  return Boolean(getAuthToken());
}

export async function loginWithPassword(payload: {
  email: string;
  password: string;
  remember_device?: boolean;
}) {
  return postJson<LoginResponse>("/api/auth/login", payload);
}

export async function requestPasswordReset(payload: { email: string }) {
  return postJson<ForgotPasswordResponse>("/api/auth/forgot-password", payload);
}

export async function resetPassword(payload: { token: string; new_password: string }) {
  return postJson<ResetPasswordResponse>("/api/auth/reset-password", payload);
}
