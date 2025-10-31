# Tests

This directory contains the backend test suite for the IoTM Dashboard. It includes unit tests and higher‑level integration tests that boot the ASP.NET Core app in a test host.

## Structure

- `Unit/`
  - Focused tests for individual services and helpers.
  - Example: `UserScreeningsServiceTests.cs` covers core scheduling and visibility logic.
- `Integration/`
  - End‑to‑end API tests using a real ASP.NET Core host with an in‑memory database.
  - `CustomWebApplicationFactory.cs` sets up the test host and environment variables.
- `TestUtils/`
  - Reusable test helpers and factories for creating DbContexts and seeded data.
- `IoTM.Tests.csproj`
  - Test project configuration.

## How to run

- Run all tests (from the repo root or the `tests` folder):

```bash
# From repo root
dotnet test tests/IoTM.Tests.csproj

# Or simply
dotnet test
```

- Run a single test file:

```bash
dotnet test --filter FullyQualifiedName~IoTM.Tests.Integration.UserScreeningsControllerTests
```

- Run a specific test method:

```bash
dotnet test --filter "FullyQualifiedName=IoTM.Tests.Integration.UserScreeningsControllerTests.GetUserScreenings_Should_Return_OK"
```

## Integration test host and environment

Integration tests use `WebApplicationFactory<Program>` to spin up a test server. The factory configures a clean, isolated host:

- Environment: `Development`
- Database: EF Core InMemory database (per test run)
- HTTPS redirection: disabled via `HttpsRedirectionOptions` to avoid 500s
- Supabase environment variables: set to safe dummy values so `Program.cs` can boot without secrets
  - `SUPABASE_DB_CONNECTION=Host=localhost;Database=test;Username=test;Password=test`
  - `SUPABASE_URL=http://localhost`
  - `SUPABASE_JWT_SECRET=test_secret_for_integration_tests`

See `Integration/CustomWebApplicationFactory.cs` for details.

## CI notes

- Tests are expected to run with no external services.
- If you add new required environment variables in `Program.cs`, mirror safe defaults in `CustomWebApplicationFactory.cs`.

## Frontend tests (separate)

Frontend tests live under `app/frontend/` and use Jest + Testing Library.

- Run frontend tests:

```bash
npm --prefix app/frontend test -- --ci
```

- If you see `Cannot find module '@testing-library/dom'` in CI, ensure `@testing-library/dom` is present in `devDependencies` and the lockfile is updated.
