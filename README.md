# PizzaHub Client

The frontend application for **PizzaHub --- Pizza Ordering & Delivery
Platform**. It provides responsive Customer, Vendor, and Admin
interfaces for menu discovery, ordering, restaurant management, and
platform administration.

## Live website and repositories

-   **Live website:** `ADD_LIVE_WEBSITE_URL`
-   **Client repository:** `ADD_CLIENT_GITHUB_URL`
-   **Server repository:** `ADD_SERVER_GITHUB_URL`

Replace these placeholders after deployment and confirm the repository
URLs.

## Features

-   Responsive homepage and public menu browsing.
-   Search by item name and description.
-   Filter by category and location; combine filters with search.
-   Sort prices low-to-high and high-to-low, or by newest.
-   Menu details, images, vendor information, ratings, and reviews.
-   Customer ordering, order history, and pending-order cancellation.
-   Favorites and reviews for eligible orders.
-   Role-aware Customer, Vendor, and Admin dashboards.
-   Vendor restaurant profile, menu CRUD, availability, and order
    management.
-   Free-plan limit of three active menu items and Premium subscription
    screens.
-   Admin user management, menu moderation, and transaction views.
-   Better Auth email/password and Google sign-in interfaces.
-   Dark/light theme, dashboard charts, and responsive UI.
-   Stripe Checkout and subscription-management interface for Vendor
    Premium.

## Technology stack

-   Next.js 16 (App Router), React 19, TypeScript
-   Tailwind CSS 4, DaisyUI
-   Better Auth React client and JWT client plugin
-   Lucide React, Recharts
-   Motion / Framer Motion (where used)

See `package.json` and `package-lock.json` for the exact installed
package names and versions.

## Requirements

-   Node.js 22 or later
-   npm
-   Running PizzaHub backend API
-   Google OAuth credentials if Google sign-in is enabled

## Installation and local development

1.  Clone this repository:

    ``` bash
    git clone ADD_CLIENT_GITHUB_URL
    cd YOUR_CLIENT_FOLDER
    ```

2.  Install packages:

    ``` bash
    npm install
    ```

3.  Create `.env.local` from `.env.example`:

    **Windows PowerShell**

    ``` powershell
    Copy-Item .env.example .env.local
    ```

    **macOS / Linux**

    ``` bash
    cp .env.example .env.local
    ```

4.  Configure:

      --------------------------------------------------------------------------
      Variable                 Purpose                 Local example
      ------------------------ ----------------------- -------------------------
      `NEXT_PUBLIC_API_URL`    Express API base URL    `http://localhost:5000`

      `NEXT_PUBLIC_SITE_URL`   Frontend origin used by `http://localhost:3000`
                               Better Auth             
      --------------------------------------------------------------------------

    Check `.env.example` for the authoritative variable list. Never put
    secrets in `NEXT_PUBLIC_*` variables because they are exposed to
    browsers.

5.  Start the development server:

    ``` bash
    npm run dev
    ```

6.  Open http://localhost:3000.

## Available scripts

  Command           Description
  ----------------- ----------------------------------
  `npm run dev`     Start Next.js development server
  `npm run build`   Create production build
  `npm run start`   Run production build
  `npm run lint`    Run ESLint

## Backend and authentication

Business API requests use `NEXT_PUBLIC_API_URL`. Better Auth requests
use the Next.js `/api/auth/*` path so the authentication cookie remains
first-party on the frontend origin. Business API requests use a
short-lived JWT in the Authorization header.

Configure the backend's allowed origins/CORS settings for the exact
frontend origin. In production, set `NEXT_PUBLIC_API_URL` to the
deployed backend URL and `NEXT_PUBLIC_SITE_URL` to the deployed frontend
URL.

## Deployment

Deploy this repository as a separate Vercel project:

1.  Import the client GitHub repository into Vercel.
2.  Set the project root to the repository root.
3.  Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`.
4.  Deploy.
5.  Test landing page, direct route reloads, authentication/session
    persistence, dashboard access, API requests, and Stripe return
    pages.

## Security

-   Never commit `.env`, `.env.local`, API keys, OAuth secrets, or
    credentials.
-   Only browser-safe values should use the `NEXT_PUBLIC_` prefix.
-   Do not publish Admin passwords or private testing credentials.
