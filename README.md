# IoTM Dashboard (HealthTrack)

Full-stack dashboard for health and screening data. This repository contains:

- `app/frontend/` — Next.js frontend (React + TypeScript + Tailwind)
- `app/backend/` — ASP.NET Core Web API backend (.NET 8, EF Core, PostgreSQL/Supabase)
- `mobile-wrapper/` — Mobile wrapper (React Native / Expo project)

This README explains how to run the entire project locally, how the pieces fit together, and where to look for more details.

## Table of contents

1. [Architecture overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Quickstart — run locally](#quickstart---run-locally)
4. [Run with Docker Compose](#run-with-docker-compose)
5. [Environment variables](#environment-variables)
6. [Database & migrations](#database--migrations)
7. [Testing](#testing)
8. [Deployment notes](#deployment-notes)
9. [Project layout](#project-layout)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)

## Architecture overview

High level:

- The frontend is a Next.js app that talks to the backend API for authenticated data and to Supabase for auth/storage.
- The backend is an ASP.NET Core Web API using Entity Framework Core and a Postgres database (Supabase).
- Mobile code sits in `mobile-wrapper/` and can talk to the same backend and Supabase endpoints.

## Prerequisites

- Node.js >= 18 for the frontend and mobile wrapper. Verify with `node --version`.
- .NET 8 SDK for the backend. Verify with `dotnet --version`.
- Docker (optional) to run the stack in containers.
- (Optional) `dotnet-ef` CLI tool for migrations: install via `dotnet tool install --global dotnet-ef`.

## Quickstart - run locally

Follow these steps to run frontend and backend locally in two shells.

1. Backend

```powershell
cd app/backend
dotnet restore
# create .env file with required variables (see backend/readme.md)
dotnet run
```

When running in Development the backend exposes a Swagger UI at the app root for exploring endpoints. See `app/backend/readme.md` for details.

2. Frontend

```powershell
cd app/frontend
npm ci
# create .env.local with required variables (see frontend/README.md)
npm run dev
```

Open the frontend at `http://localhost:3000` and the backend Swagger at `http://localhost:5225` .

## Run with Docker Compose

There is an example `docker-compose.yml` in the `app/` folder that can build and run the frontend and backend services together. To run the compose stack from repo root:

```powershell
cd app
docker compose up --build
```

This compose file maps the frontend to port `3000` and backend to `4000` by default. If you prefer the legacy CLI, `docker-compose -f app/docker-compose.yml up --build` also works.

Note: The example compose file does not provide a Postgres container or Supabase; you will still need a database backend. I can add a more complete `docker-compose` that includes Postgres and wiring if you'd like.

## Environment variables

- Frontend: see `app/frontend/README.md` — create `app/frontend/.env.local` and provide `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_BASE_URL`, etc.
- Backend: see `app/backend/readme.md` — create `app/backend/.env` with `SUPABASE_DB_CONNECTION`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, etc.

Do NOT commit secrets to git. Use a `.env.example` if you want to store placeholder keys.

## Database & migrations

The backend uses EF Core migrations located in `app/backend/Migrations/`.

To apply migrations locally (from `app/backend`):

```powershell
dotnet tool install --global dotnet-ef   # if needed
dotnet ef database update --project IoTM.csproj
```

To add a migration after model changes:

```powershell
dotnet ef migrations add <Name> --project IoTM.csproj
```

## Testing

- Frontend unit tests: run from `app/frontend`:

```powershell
cd app/frontend
npm run test
```

- Backend tests: run from `tests`:

```powershell
cd tests
dotnet test
```

- Backend tests: this repository does not include a dedicated test project by default. If you add tests, prefer NUnit/xUnit and a `tests/` or `src/*.Tests` project.

## Deployment notes

- Frontend: recommended deployment on Vercel (see `app/frontend/README.md`). Set environment variables in the Vercel project settings.
- Backend: can be deployed to any container host or Azure/AWS/GCP App Service. Use environment variables or a secret store for DB credentials and JWT secrets.
- Database: use a managed Postgres (Supabase, RDS, etc.) for production.

## Project layout

- `app/` - contains both `frontend/` and `backend/` apps and a sample `docker-compose.yml` for local wiring.
  - `app/frontend/` - Next.js app (see its README)
  - `app/backend/` - ASP.NET Core Web API (see its README)
- `mobile-wrapper/` - mobile app wrapper (React Native / Expo)
- `IoTM-Dashboard.sln` - Visual Studio / .NET solution for the backend

## Troubleshooting

- Ports: verify no other service is using ports 3000 (frontend) or 4000 (backend). Adjust docker-compose or app settings if needed.
- CORS: the backend allows `http://localhost:3000` in development via the `AllowFrontend` CORS policy; add other origins if needed.
- DB connection: ensure `SUPABASE_DB_CONNECTION` uses the correct host/credentials and that the DB accepts incoming connections.

## Contributing

1. Branch from `feature/*` or `fix/*`.
2. Add tests for new logic (frontend in `__tests__` or backend test project).
3. Run linters/tests locally.
4. Open a PR describing the change and environment impacts.

---