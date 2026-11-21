"use client";
import { authClient } from "@/lib/auth-client";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token: string | undefined;
  try { const result = await authClient.token(); token = result.data?.token; } catch { /* public endpoint or no active session */ }
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API}${path}`, { ...options, headers, credentials: "include", cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Something went wrong. Please try again.");
  return payload as T;
}
