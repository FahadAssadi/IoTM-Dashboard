# IoTM Dashboard — Backend

This folder contains the ASP.NET Core Web API backend for the IoTM Dashboard. The API provides endpoints for users, screenings, guidelines and health metric processing and is backed by a PostgreSQL (Supabase) database. The app includes Swagger for interactive API exploration during development and uses JWT (Supabase) for authentication.

## Quick facts

- Framework: .NET 8 (TargetFramework: net8.0)
- ORM: Entity Framework Core with Npgsql (Postgres)
- Auth: JWT (Supabase JWT secret)
- Swagger UI available in Development mode

## Table of contents

- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Install, build & run (local)](#install-build--run-local)
- [Database & Migrations](#database--migrations)
- [Swagger / API explorer](#swagger--api-explorer)
- [Docker / containerization](#docker--containerization)
- [Configuration reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing and notes](#contributing-and-notes)

## Prerequisites

- .NET 8 SDK — download from [Microsoft .NET](https://dotnet.microsoft.com/)
- A PostgreSQL instance (Supabase or local) and a valid connection string
- (Optional) Docker if you plan to run the database or the service in containers

Verify SDK with:

```powershell
dotnet --version
```

## Environment variables

This project uses DotNetEnv to load `.env` from the backend project root. Create a file named `.env` in `app/backend/` and set the following variables (example names):

```bash
SUPABASE_DB_CONNECTION=Host=...;Username=...;Password=...;Database=...;Port=5432;Pooling=true
SUPABASE_URL=https://<your-supabase>.supabase.co
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>
NEWSAPI_API_KEY=<optional-news-api-key>

# Any other secrets expected by your environment
```

Notes:
- `SUPABASE_DB_CONNECTION` is used to configure the Entity Framework Npgsql connection.
- `SUPABASE_JWT_SECRET` is used to validate JWT tokens issued by your Supabase project.
- Keep `.env` out of source control. Use your preferred secrets manager for production.

## Install, build & run (local)

From the `app/backend` folder:

1. Restore packages:

```powershell
dotnet restore
```

2. (Optional) Apply database migrations (see next section).

3. Run the app:

```powershell
dotnet run
```

By default the app will start and, when running in the Development environment, host the Swagger UI at the application root (see Swagger section). The Program.cs file is configured to load `.env` and configure services such as EF Core, authentication, CORS and Swagger.

## Database & Migrations

This project uses EF Core Migrations. The csproj includes EF tools packages. Typical workflow:

Install EF tools (if not already available):

```powershell
dotnet tool install --global dotnet-ef
```

Create a migration (if you change the model):

```powershell
dotnet ef migrations add <MigrationName> --project IoTM.csproj
```

Apply migrations to your database:

```powershell
dotnet ef database update --project IoTM.csproj
```

If you prefer running migrations programmatically, look at `ApplicationDbContextFactory` and `Migrations/` folder.

## Swagger / API explorer

When the application runs in Development mode, Swagger UI is enabled and routed at the app root ("/").

Open your browser to:

[http://localhost](http://localhost):<port>/

(If HTTPS is enforced `https://localhost:<port>/`.) Swagger shows available endpoints and allows you to issue test requests.

## Docker / containerization

There isn't an explicit `Dockerfile` in this folder, but you can containerize the backend easily. Example (simple):

Dockerfile (example):

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . ./
RUN dotnet restore "IoTM.csproj"
RUN dotnet publish "IoTM.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "IoTM.dll"]
```

When running containers, supply environment variables via an env-file or your orchestration platform.

If you have a root-level `docker-compose.yml` in the repository, it can be adapted to run the API together with Postgres/Supabase emulator and the frontend.

## Configuration reference

- `appsettings.json` contains configuration like `Logging`, `NewsAPI.ApiKey` and `HealthThresholds` defaults (see the `HealthThresholds` section in `appsettings.json`).
- Environment variables override configuration when loaded via DotNetEnv and the standard ASP.NET Core configuration pipeline.

Important configuration keys:

- `SUPABASE_DB_CONNECTION` — Postgres connection string
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_JWT_SECRET` — JWT signing key for validating tokens
- `NewsAPI:ApiKey` — optional API key used by news scraping components

## Troubleshooting

- Database connection errors: ensure `SUPABASE_DB_CONNECTION` is correct, Postgres is reachable, and the DB user has permissions.
- JWT authentication failures: check `SUPABASE_JWT_SECRET` matches the Supabase project's JWT secret.
- EF Core migration issues: confirm the EF tools version and that the connection string points to the intended DB.
- CORS errors from the frontend: Program.cs registers a CORS policy named `AllowFrontend` allowing `http://localhost:3000`; add additional origins if required.

Logs and diagnostic data are produced via ASP.NET Core logging; check console output while running.

## Contributing and notes

- Follow the repository contribution guidelines (branch from `feature/*` or `fix/*`).
- Add unit/integration tests and update migrations when changing the schema.
- Consider adding a `.env.example` (without secrets) to show required environment variables.

---