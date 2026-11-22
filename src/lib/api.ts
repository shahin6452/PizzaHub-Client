
"use client";

import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

type CachedToken = {
  token: string;
  expiresAt: number;
};

type ApiErrorPayload = {
  message?: string;
  errors?: Array<{
    path?: string;
    message?: string;
  }>;
};

let cachedToken: CachedToken | null = null;
let tokenPromise: Promise<string> | null = null;
let tokenGeneration = 0;

function decodeTokenExpiry(token: string): number {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));

    if (typeof decoded.exp === "number") {
      return decoded.exp * 1000;
    }
  } catch {
    // Use a safe fallback if decoding fails.
  }

  return Date.now() + 10 * 60 * 1000;
}

export function clearAuthTokenCache() {
  tokenGeneration++;
  cachedToken = null;
  tokenPromise = null;
}

async function getAuthToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  if (tokenPromise) {
    return tokenPromise;
  }

  const currentGeneration = tokenGeneration;

  const request = (async () => {
    const result = await authClient.token();

    if (result.error || !result.data?.token) {
      throw new Error(
        result.error?.message || "Authentication token is unavailable."
      );
    }

    const token = result.data.token;

    if (currentGeneration === tokenGeneration) {
      cachedToken = {
        token,
        expiresAt: decodeTokenExpiry(token),
      };
    }

    return token;
  })();

  tokenPromise = request;

  try {
    return await request;
  } finally {
    if (tokenPromise === request) {
      tokenPromise = null;
    }
  }
}

function isPublicRequest(path: string, method: string): boolean {
  const cleanPath = path.split("?")[0];

  if (
    method === "GET" &&
    cleanPath.startsWith("/api/menu") &&
    cleanPath !== "/api/menu/mine"
  ) {
    return true;
  }

  return false;
}

export async function api<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    auth: requireAuth,
    ...requestOptions
  } = options;

  const method = (requestOptions.method || "GET").toUpperCase();

  const shouldAuthenticate =
    requireAuth ?? !isPublicRequest(path, method);

  const headers = new Headers(requestOptions.headers);

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (shouldAuthenticate) {
    const token = await getAuthToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API}${path}`, {
    ...requestOptions,
    method,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;

  if (!response.ok) {
    const firstError = payload.errors?.[0];

    if (firstError?.message) {
      const field = firstError.path
        ? `${firstError.path}: `
        : "";

      throw new Error(`${field}${firstError.message}`);
    }

    throw new Error(
      payload.message || `Request failed (${response.status}).`
    );
  }

  return payload as T;
}
