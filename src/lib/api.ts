
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

let cachedToken: CachedToken | null = null;
let tokenPromise: Promise<string> | null = null;

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

  // Current server JWT lifetime is 15 minutes.
  return Date.now() + 10 * 60 * 1000;
}

export function clearAuthTokenCache() {
  cachedToken = null;
  tokenPromise = null;
}

async function getAuthToken(): Promise<string> {
  // Reuse a valid token, with a 60-second safety margin.
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  // Prevent multiple simultaneous token requests.
  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    try {
      const result = await authClient.token();

      if (result.error || !result.data?.token) {
        throw new Error(
          result.error?.message || "Authentication token is unavailable."
        );
      }

      const token = result.data.token;

      cachedToken = {
        token,
        expiresAt: decodeTokenExpiry(token),
      };

      return token;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}

function isPublicRequest(path: string, method: string): boolean {
  const cleanPath = path.split("?")[0];

  // Public menu listing and individual approved menu details.
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

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message || `Request failed (${response.status}).`
    );
  }

  return payload as T;
}
