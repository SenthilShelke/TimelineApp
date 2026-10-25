import { API_BASE_URL } from "@env";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "./tokenStore";

// Base URL of the backend API. Set API_BASE_URL in .env.
// Dev note: a phone/simulator can't reach "localhost" — use your machine's LAN
// IP (e.g. http://192.168.1.50:4000). iOS simulator can use http://localhost:4000.
const BASE_URL = API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean; // attach bearer token (default true)
  _retried?: boolean; // internal: prevents infinite refresh loops
};

async function rawRequest(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (opts.auth !== false) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

// Attempt to refresh the access token using the stored refresh token.
async function tryRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;

  const data = await res.json();
  if (!data.accessToken) return false;
  // Keep the existing refresh token; only the access token rotates here.
  await saveTokens(data.accessToken, refreshToken);
  return true;
}

/**
 * Central request helper.
 * - injects the bearer token
 * - on 401, tries one refresh and retries the request
 * - throws ApiError on non-2xx, returns parsed JSON (or undefined for 204)
 */
export async function apiRequest<T = unknown>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  let res = await rawRequest(path, opts);

  if (res.status === 401 && opts.auth !== false && !opts._retried) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await rawRequest(path, { ...opts, _retried: true });
    } else {
      await clearTokens(); // refresh failed → force re-login
    }
  }

  if (res.status === 204) return undefined as T;

  let data: any = undefined;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = data?.error ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export { BASE_URL };
