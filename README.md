# PizzaHub Client

The frontend application for **PizzaHub — Pizza Ordering & Delivery Platform**. It provides responsive Customer, Vendor, and Admin interfaces for menu discovery, ordering, restaurant management, and platform administration.

## Live website and repositories

- **Live website:** https://pizzahub6452.vercel.app
- **Client repository:** https://github.com/shahin6452/PizzaHub-Client
- **Server repository:** https://github.com/shahin6452/PizzaHub-Server
- **Backend API:** https://pizzahub-server-tibd.onrender.com

## Features

- Responsive homepage and public menu browsing.
- Search by item name and description.
- Filter by category and location; combine filters with search.
- Sort prices low-to-high and high-to-low, or by newest.
- Menu details, images, vendor information, ratings, and reviews.
- Customer ordering, order history, and pending-order cancellation.
- Favorites and reviews for eligible orders.
- Role-aware Customer, Vendor, and Admin dashboards.
- Vendor restaurant profile, menu CRUD, availability, and order management.
- Free-plan limit of three active menu items and Premium subscription screens.
- Admin user management, menu moderation, and transaction views.
- Better Auth email/password and Google sign-in interfaces.
- Dark/light theme, dashboard charts, and responsive UI.
- Stripe Checkout and subscription-management interface for Vendor Premium.

## Technology stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, DaisyUI
- Better Auth React client and JWT client plugin
- Lucide React, Recharts
- Motion / Framer Motion (where used)

See `package.json` and `package-lock.json` for the exact installed package names and versions.

## Requirements

- Node.js 22 or later
- npm
- A running PizzaHub backend API
- Google OAuth credentials if Google sign-in is enabled

## Installation and local development

1. Clone the client repository:

   ```bash
   git clone https://github.com/shahin6452/PizzaHub-Client.git
   cd PizzaHub-Client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env.local` from `.env.example`.

   **Windows PowerShell:**

   ```powershell
   Copy-Item .env.example .env.local
   ```

   **macOS / Linux:**

   ```bash
   cp .env.example .env.local
   ```

4. Configure the environment variables:

   | Variable | Purpose | Local development value |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | Express API base URL | `http://localhost:5000` |
   | `NEXT_PUBLIC_SITE_URL` | Frontend origin used by Better Auth | `http://localhost:3000` |

   For local development, run the backend at `http://localhost:5000` as well. Check `.env.example` for the authoritative list of variable names.

   **Production values:**

   | Variable | Production value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://pizzahub-server-tibd.onrender.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://pizzahub6452.vercel.app` |

   Never put secrets in `NEXT_PUBLIC_*` variables because values with this prefix are exposed to browsers.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

## Backend and authentication

Business API requests use `NEXT_PUBLIC_API_URL`. Better Auth requests use the Next.js `/api/auth/*` path so the authentication cookie remains first-party on the frontend origin. Business API requests use a short-lived JWT in the `Authorization` header.

Configure the backend's allowed origins/CORS settings for the exact frontend origin:

`https://pizzahub6452.vercel.app`

In production:

- Set `NEXT_PUBLIC_API_URL` to `https://pizzahub-server-tibd.onrender.com`.
- Set `NEXT_PUBLIC_SITE_URL` to `https://pizzahub6452.vercel.app`.

The backend also needs its production authentication and Google OAuth settings configured for the deployed frontend. The Google OAuth callback URL is:

`https://pizzahub6452.vercel.app/api/auth/callback/google`

## Deployment

The client is deployed as a separate Vercel project.

1. Import the [PizzaHub Client GitHub repository](https://github.com/shahin6452/PizzaHub-Client) into Vercel.
2. Set the project root to the repository root.
3. Add these Production environment variables:

   ```env
   NEXT_PUBLIC_API_URL=https://pizzahub-server-tibd.onrender.com
   NEXT_PUBLIC_SITE_URL=https://pizzahub6452.vercel.app
   ```

4. Deploy the project.
5. After changing environment variables, trigger a new deployment so the updated values are applied.
6. Test the landing page, direct route reloads, authentication and session persistence, dashboard access, API requests, and Stripe return pages.

## Security

- Never commit `.env`, `.env.local`, API keys, OAuth secrets, or credentials.
- Only browser-safe values should use the `NEXT_PUBLIC_` prefix.
- Do not publish Admin passwords or private testing credentials.
- Keep private API keys and OAuth client secrets on the backend; do not add them to frontend environment variables.
