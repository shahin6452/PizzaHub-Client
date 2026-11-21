"use client";
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  // Next.js rewrites /api/auth/* to the Express Better Auth handler.
  // This keeps the session cookie first-party on the deployed frontend origin.
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  fetchOptions: { credentials: "include" },
  plugins: [jwtClient()],
});
