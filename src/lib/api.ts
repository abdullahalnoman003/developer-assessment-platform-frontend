import "server-only";

import { cookies } from "next/headers";
import type { FetchResponse } from "ofetch";
import { ofetch } from "ofetch";
import type { ApiResponse, AuthTokens } from "./types";

const RAW_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");
const API_BASE = `${RAW_BASE}/api/v1`;

function missingBaseMessage(): string | null {
  if (process.env.NEXT_PUBLIC_API_URL) return null;
  if (process.env.NODE_ENV !== "production") return null;
  return `NEXT_PUBLIC_API_URL is not set in this deployment, so every request fell back to ${RAW_BASE}. Set it on the host to the backend origin (no trailing slash, no /api/v1) and redeploy.`;
}

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";

const ACCESS_MAX_AGE = 60 * 60 * 24;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export class UnauthenticatedError extends Error {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

type QueryValue = string | number | boolean | null | undefined;

export function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    const value = raw as QueryValue;
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions {
  method?: Method;
  body?: unknown;
  token?: string | null;
  tags?: string[];
  revalidate?: number | false;
}

function isUnauthenticatedMessage(message: string): boolean {
  return /invalid or expired access token/i.test(message);
}

async function readCookie(name: string): Promise<string | null> {
  const store = await cookies();
  return store.get(name)?.value ?? null;
}

export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

async function getAccessToken(): Promise<string | null> {
  return readCookie(ACCESS_COOKIE);
}

type RawResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
  errors?: string[];
};

async function send<T>(
  path: string,
  options: ApiOptions,
  token: string | null,
): Promise<ApiResponse<T>> {
  const misconfigured = missingBaseMessage();
  if (misconfigured) {
    return {
      success: false,
      statusCode: 503,
      message: misconfigured,
      data: null,
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: FetchResponse<RawResponse>;
  try {
    response = await ofetch.raw<RawResponse>(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      ignoreResponseError: true,
      retry: 0,
      cache: options.tags ? undefined : "no-store",
      ...(options.tags || options.revalidate !== undefined
        ? { next: { tags: options.tags, revalidate: options.revalidate ?? 0 } }
        : {}),
    });
  } catch {
    return {
      success: false,
      statusCode: 503,
      message:
        "Could not reach the CodeArena API. Is the backend running on port 5000?",
      data: null,
    };
  }

  const { status } = response;
  const payload = response._data;
  const body: RawResponse =
    payload && typeof payload === "object" ? payload : {};

  if (status < 200 || status >= 300) {
    return {
      success: false,
      statusCode: status,
      message: body.message ?? `Request failed (HTTP ${status})`,
      data: null,
      errors: body.errors ?? [],
    };
  }

  return {
    success: true,
    statusCode: status,
    message: body.message ?? "Operation successful",
    data: (body.data ?? null) as T,
    errors: body.errors ?? [],
  };
}

async function refreshSession(): Promise<string | null> {
  const refreshToken = await readCookie(REFRESH_COOKIE);
  if (!refreshToken) return null;

  const res = await send<AuthTokens>(
    "/auth/refresh-token",
    { method: "POST", body: { refreshToken } },
    null,
  );
  if (!res.success || !res.data?.accessToken) return null;

  await setAuthCookies(res.data);
  return res.data.accessToken;
}

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> {
  let token = options.token ?? (await getAccessToken());

  const result = await send<T>(path, options, token);

  if (result.statusCode !== 401 || !isUnauthenticatedMessage(result.message)) {
    return result;
  }

  const rotated = await refreshSession().catch(() => null);
  if (!rotated) {
    throw new UnauthenticatedError(result.message);
  }

  token = rotated;
  const retried = await send<T>(path, options, token);
  if (retried.statusCode === 401) {
    throw new UnauthenticatedError(retried.message);
  }
  return retried;
}

export { API_BASE };
