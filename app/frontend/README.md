# IoTM Dashboard — Frontend

This folder contains the frontend application for the IoTM Dashboard. It's a Next.js (App Router) React application written with TypeScript and Tailwind CSS. The frontend handles user authentication (via Supabase), displays health data visualisations, news, and provides interactive screens for health screenings.

Quick links:

- App root: `app/`
- Pages / routes: `app/*`
- Components: `components/`
- Utilities: `lib/`

## Table of contents

- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Install & run (local)](#install--run-local)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Testing & coverage](#testing--coverage)
- [Linting & formatting](#linting--formatting)
- [Docker](#docker)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Tech stack

- Next.js (App Router) — React 19
- TypeScript
- Tailwind CSS
- Supabase (auth + API)
- Recharts / @visx for charts
- Jest + Testing Library for unit tests

## Prerequisites

- Node.js (recommended >= 18). Confirm with `node -v`.
- npm, pnpm or yarn. This repo uses standard npm scripts; use your preferred package manager.

## Install & run (local)

1. Install dependencies:

```powershell
npm ci
# or
npm install
```

2. Copy env template (create `.env.local` in this folder):

```powershell
cp .env.local.example .env.local
# or manually create .env.local and add the values listed below
```

3. Start development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dev server uses Next's Turbopack for fast refresh.

## Environment variables

Create a `.env.local` in `app/frontend/` (do not commit secrets). Example values used in development:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_BASE_URL=http://localhost:5225
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_NEWS_API_KEY=<news-api-key>
GEMINI_API_KEY=<optional-gemini-or-llm-key>
```

Notes:
- Any variable prefixed with `NEXT_PUBLIC_` becomes available on the client.
- Keep sensitive keys out of git and production secrets stores.

## Available scripts

Scripts are defined in `package.json` — run them from the `app/frontend` folder.

- `npm run dev` — start Next.js in development (Turbopack enabled)
- `npm run build` — build the app for production
- `npm run start` — run built production server (`next start`)
- `npm run lint` — run ESLint
- `npm run test` — run Jest unit tests
- `npm run test:coverage` — run tests with coverage
- `npm run ci-check` — cleans node_modules, installs fresh, builds and runs coverage (useful for CI)

Example:

```powershell
npm run dev
npm run build && npm run start
npm run test:coverage
```

## Project structure

- `app/` — Next.js App Router pages and layout (primary entrypoint)
- `components/` — React components and UI primitives
- `lib/` — application utilities (api wrappers, supabase client, helpers)
- `public/` — static assets
- `types/` — shared TypeScript types
- `__tests__/` — test files
- `next.config.ts` — Next.js configuration
- `tailwind.config.ts` — Tailwind CSS config

Dive into `app/` to see route layouts and server/client components.

## Testing & coverage

This project uses Jest and Testing Library. To run tests and check coverage:

```powershell
npm run test
npm run test:coverage
```

Coverage artifacts (if generated) will be in the standard Jest coverage output directory.

## Linting & formatting

ESLint is configured (see `eslint.config.mjs`). Run lint:

```powershell
npm run lint
```

Consider adding Prettier or a format script if desired.

## Docker

There is a `Dockerfile` in this folder for building a production image of the frontend. Typical flow:

```powershell
docker build -t iotm-frontend:latest .
docker run -p 3000:3000 --env-file .env.local iotm-frontend:latest
```

If you need to connect with the backend container, use a docker-compose file at the repo root (if provided) or adjust networking accordingly.

## Deployment

The frontend is compatible with Vercel (recommended for Next.js) or any Node host that can run `next start` after building.

- Vercel: connect the repo, set environment variables in the Vercel project settings, and deploy.
- Self-host: `npm run build` then `npm run start` on your server (Node.js runtime).

## Troubleshooting

- If assets or fonts fail to load, confirm `public/` contents and `next.config.ts` fonts config.
- If Supabase auth fails, verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- If API calls fail, ensure `NEXT_PUBLIC_API_BASE_URL` points to the running backend (CORS allowed).

Common debug commands:

```powershell
# See build output
npm run build

# Run dev server with verbose logging (if you add custom logging)
npm run dev
```

## Contributing

Please follow repo-wide contribution guidelines. For frontend-specific changes:

1. Branch from `feature/*` or `fix/*` depending on scope.
2. Add/adjust unit tests in `__tests__/` for new logic.
3. Run `npm run lint` and `npm run test` locally.
4. Open a PR describing the change and any required env variables.

## Notes & references

[Vercel Preview](https://previe-ten.vercel.app/)
[Next.js Docs](https://nextjs.org/docs)
[Supabase Docs](https://supabase.com/docs)

---
