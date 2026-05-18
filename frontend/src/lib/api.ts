import { dashboardMockData } from "@/mock/dashboard-data";
import { API_BASE } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";

type ApiStatus = "success" | "partial" | "offline";
export interface ApiEnvelope<T> {
  status: ApiStatus;
  data: T;
  message: string;
}

/** Retorno padronizado de erros do backend */
export interface BackendError {
  success: false;
  error_code: string;
  message: string;
  details: string[];
}

const TIMEOUT_MS = 10000;
const RETRIES = 1;

export const API_URL = API_BASE;

function _devLog(label: string, ...args: unknown[]) {
  if (process.env.NEXT_PUBLIC_APP_ENV === "development" || process.env.NODE_ENV === "development") {
    console.log(`[API] ${label}`, ...args);
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    promise.then((res) => {
      clearTimeout(id);
      resolve(res);
    }).catch((err) => {
      clearTimeout(id);
      reject(err);
    });
  });
}

function normalize<T>(payload: any, fallback: T): ApiEnvelope<T> {
  if (!payload || typeof payload !== "object") {
    return { status: "partial", data: fallback, message: "Invalid payload, fallback applied" };
  }
  if ("status" in payload && "data" in payload) return payload as ApiEnvelope<T>;
  return { status: "success", data: (payload.data ?? payload) as T, message: payload.message ?? "Loaded successfully" };
}

/** GET com fallback e retry */
export async function apiGet<T>(path: string, fallback: T): Promise<ApiEnvelope<T>> {
  const url = `${API_URL}${path}`;
  _devLog("GET", url);
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const token = typeof window === "undefined" ? null : getAuthToken();
      const res = await withTimeout(
        fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        TIMEOUT_MS
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return normalize<T>(json, fallback);
    } catch (err) {
      lastError = err;
    }
  }
  _devLog("GET offline", url, lastError);
  return {
    status: "offline",
    data: fallback,
    message: `Serviço de API indisponível em ${API_URL}`
  };
}

export interface PostResult<T> {
  ok: boolean;
  status?: number;
  data?: T;
  /** Erro de rede (CORS, backend offline) sem resposta HTTP */
  networkError?: string;
  /** Mensagem de erro vinda do backend */
  backendError?: BackendError;
}

/**
 * POST genérico.
 * - Distingue erro de rede (CORS / backend offline) de erro HTTP.
 * - Em dev, loga a URL final no console.
 */
export async function apiPost<TRes = unknown>(
  path: string,
  body: unknown,
  options?: {
    timeoutMs?: number;
    signal?: AbortSignal;
  }
): Promise<PostResult<TRes>> {
  const url = `${API_URL}${path}`;
  _devLog("POST →", url, body);

  let res: Response;
  try {
    const token = typeof window === "undefined" ? null : getAuthToken();
    res = await withTimeout(
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        signal: options?.signal,
      }),
      options?.timeoutMs ?? TIMEOUT_MS
    );
  } catch (err) {
    // Erro de rede: CORS, backend offline, timeout
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API] Network error on POST", url, msg);
    return {
      ok: false,
      networkError: msg,
    };
  }

  _devLog("POST ←", url, "status", res.status);

  const contentType = res.headers.get("content-type") || "";
  const json = contentType.includes("application/json") ? await res.json().catch(() => null) : null;

  if (!res.ok || json?.success === false) {
    return {
      ok: false,
      status: res.status,
      data: json as TRes,
      backendError: {
        success: false,
        error_code: json?.error_code ?? "HTTP_ERROR",
        message: json?.message ?? json?.detail ?? `HTTP ${res.status}`,
        details: Array.isArray(json?.details) ? json.details : [],
      },
    };
  }

  return { ok: true, status: res.status, data: json as TRes };
}

export const apiFallbacks = {
  "/api/documentation": dashboardMockData.documentation.docs,
  "/api/templates": dashboardMockData.templates.data,
  "/api/ai-models": dashboardMockData.aiModels.data,
  "/api/security-status": { security_score: dashboardMockData.securityStatus.security_score, layers: dashboardMockData.securityStatus.layers },
  "/api/billing": dashboardMockData.billing,
  "/api/settings": dashboardMockData.settings.data,
  "/api/system/status": dashboardMockData.systemStatus,
  "/api/health": { status: "ok", service: "saas-factory-api" },
} as const;
