# Cedium Art Gallery

Cedium Art Gallery is a Next.js 14 application for an online art marketplace. The codebase includes public storefront pages, customer accounts, artist application flows, checkout and order handling, admin tooling, image uploads, email utilities, AI chat endpoints, and a browser-based "Cedium OS" workspace.

This repository also contains a separate Python desktop utility in `altrenus-business-manager/`.

## Overview

The main web application is built with:

- Next.js App Router
- React 18 and TypeScript
- Prisma with PostgreSQL
- NextAuth for authentication
- Tailwind CSS
- PayPal checkout integration
- Cloudinary for uploads
- Nodemailer for email sending

High-level areas present in the repo:

- Storefront pages for browsing artworks, artists, policies, support, and editorial content
- Customer signup, login, account, wishlist, favorites, and order pages
- Artist application and artist profile flows
- Admin pages and admin API routes for orders, artworks, artists, reports, settings, and applications
- AI chat endpoints and an OS-style workspace with persistent file APIs

## Prerequisites

- Node.js 18.17+ or Node.js 20+
- npm
- PostgreSQL database access

Optional external services are only needed if you want the related features locally:

- PayPal
- Cloudinary
- SMTP provider
- Anthropic
- Google OAuth
- GitHub OAuth

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file. You can start from the example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Review the environment variables in `.env` and keep only the ones needed for the features you want to run.

4. Generate the Prisma client:

```bash
npx prisma generate
```

5. Push the Prisma schema to your database if you are initializing a local database:

```bash
npx prisma db push
```

## Environment Variables

The repository includes `.env.example`, but it is not fully aligned with the current codebase. Use it as a starting point, then verify values against the sections below.

### Required for Local App Startup

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- `DATABASE_URL` and `DIRECT_URL` are required by Prisma
- `NEXT_PUBLIC_APP_URL` is used in checkout and email links

### Authentication

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

These are only needed if you want Google or GitHub sign-in. The app also includes credential-based signup and login.

### Admin Access

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
ADMIN_ALLOWED_IPS=*
```

- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` are required for the custom admin login flow
- `ADMIN_ALLOWED_IPS` controls IP-based access to admin pages and admin APIs

### PayPal

```env
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
```

These are required for PayPal checkout and webhook verification.

### Cloudinary

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

These are required for upload endpoints.

### Email

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

These are used by the email helper in `src/lib/email.ts`.

### AI and Workspace

```env
AI_PROVIDER=gemini
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
OS_DEMO_USER_ID=
```

- `AI_PROVIDER` is optional and can be `gemini`, `groq`, or `openai`; when omitted, the AI chat route tries Gemini, Groq, then OpenAI
- `OPENAI_API_KEY` is used by `src/app/api/ai-chat/route.ts` when OpenAI is selected or Gemini is not configured
- `OPENAI_MODEL` is optional and defaults to `gpt-4o-mini`
- `ANTHROPIC_API_KEY` is used by `src/app/api/os/ai/route.ts`
- `GEMINI_API_KEY` is used by `src/app/api/ai-chat/route.ts`, `src/app/api/ai-chat/test/route.ts`, and the Python desktop utility
- `GEMINI_MODEL` is optional and defaults to `gemini-3-flash-preview`
- `GROQ_API_KEY` is used by `src/app/api/ai-chat/route.ts` and `src/app/api/ai-chat/test/route.ts`
- `GROQ_MODEL` is optional and defaults to `llama-3.1-8b-instant`
- `OS_DEMO_USER_ID` is an optional fallback for OS file routes when no authenticated session is available

### Optional CEO Password Script

```env
CEO_EMAIL=
CEO_PASSWORD=
```

These are only used by `scripts/set-ceo-password.ts`.

## Running Locally

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Useful setup commands:

```bash
npx prisma generate
npx prisma db push
```

Optional one-off script:

```bash
npx tsx scripts/set-ceo-password.ts
```

## Available Scripts

From `package.json`:

- `npm run dev` starts the Next.js development server
- `npm run build` runs `prisma generate` and then builds the app
- `npm run start` starts the production server
- `npm run lint` runs the Next.js linter

## Project Structure

```text
.
|- src/
|  |- app/                      Next.js pages, layouts, and API routes
|  |- components/               UI and feature components
|  `- lib/                      Auth, Prisma, PayPal, Cloudinary, email, and helpers
|- prisma/
|  `- schema.prisma             Database schema
|- scripts/
|  `- set-ceo-password.ts       One-off CEO password setup script
|- public/                      Static assets
|- altrenus-business-manager/   Separate Python desktop utility
|- .env.example                 Environment template
|- DATABASE_SCHEMA.md           Additional schema documentation
`- package.json                 npm scripts and dependencies
```

## Main Areas In The Web App

Examples of routes and route groups currently present in the repository:

- `/`, `/gallery`, `/gallery/[id]`, `/artists/[id]`, `/checkout`, `/track`
- `/signup`, `/login`, `/account`, `/orders`, `/wishlist`, `/favorites`
- `/apply`
- `/admin/*`
- `/ai`, `/os`, `/workspace/*`
- `/api/auth/*`, `/api/artworks*`, `/api/artists*`, `/api/orders*`, `/api/payments/paypal/*`, `/api/upload`, `/api/admin/*`, `/api/os/*`

## Troubleshooting

### Prisma client or database errors

If the app fails with Prisma initialization or schema-related errors:

```bash
npx prisma generate
npx prisma db push
```

Make sure `DATABASE_URL` and `DIRECT_URL` are set correctly.

### OAuth variables from `.env.example` do not work

The current code reads:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

The example file currently includes `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GITHUB_CLIENT_ID`, which do not match the variables used by `src/lib/auth.ts`.

### PayPal button shows as not configured

Check that `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_ID`, and `PAYPAL_CLIENT_SECRET` are set. The client button and the server-side order routes use different variables.

### AI routes return configuration errors

Check the relevant keys:

- `OPENAI_API_KEY` for the main AI chat route
- `GEMINI_API_KEY` for the main AI chat and AI test routes
- `ANTHROPIC_API_KEY` for the OS AI endpoint

### Admin login is unavailable

Verify:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_ALLOWED_IPS`

Admin access is also filtered in middleware, so an incorrect `ADMIN_ALLOWED_IPS` value can block both admin pages and admin API routes.

## Notes

- `postinstall` runs `prisma generate || true`
- `next.config.mjs` disables ESLint build blocking with `ignoreDuringBuilds: true`
- `DATABASE_SCHEMA.md` exists as supplementary documentation, but `prisma/schema.prisma` is the schema source of truth
