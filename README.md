# PizzaHub Client

Next.js App Router frontend for the PizzaHub ordering platform.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS 4 and reusable ShadCN-style components (Radix UI + CVA)
- Framer Motion, Recharts, Lucide React, Sonner and next-themes
- Better Auth React client with JWT client plugin

## Local setup (PowerShell)

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Required variables in `.env.local`:

- `NEXT_PUBLIC_SITE_URL` — frontend public URL (local: `http://localhost:3000`)
- `NEXT_PUBLIC_API_URL` — Express API URL (local: `http://localhost:5000`)

The client forwards `/api/auth/*` through a Next.js rewrite to the Express Better Auth handler so the session cookie stays first-party. Business API requests go to Express with a short-lived JWT.

## Build and checks

```powershell
npm run typecheck
npm run lint
npm run build
```

## Deployment

Deploy this directory as its own Vercel project. Set both environment variables to their production URLs. `NEXT_PUBLIC_API_URL` must be available at build time because it is used by the rewrite configuration.

## Related repository

Server repository: `ADD_SERVER_REPOSITORY_URL`

Live website: `ADD_LIVE_WEBSITE_URL`

Do not commit `.env.local` or secret credentials.
