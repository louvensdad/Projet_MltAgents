// Centralized API configuration – single source of truth
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

// Alias used by wizard/page.tsx
export { API_BASE as API_URL };

/** Retorna a base URL da API – usar em vez de hardcodar porta */
export function getApiBaseUrl(): string {
  return API_BASE;
}
