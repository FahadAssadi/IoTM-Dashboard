using IoTM.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;

namespace IoTM.Tests.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Run the app under a dedicated Testing environment
        builder.UseEnvironment("Testing");
        // Set required env var so Program.cs doesn't throw (kept for completeness; not used in Testing path)
        Environment.SetEnvironmentVariable("SUPABASE_DB_CONNECTION", "Host=localhost;Database=test;Username=test;Password=test");
    Environment.SetEnvironmentVariable("SUPABASE_URL", "http://localhost");
    Environment.SetEnvironmentVariable("SUPABASE_JWT_SECRET", "test_secret_for_integration_tests");

        builder.ConfigureServices(services =>
        {
            // Avoid HTTPS redirection 500 by specifying an HTTPS port
            services.PostConfigure<HttpsRedirectionOptions>(o => o.HttpsPort = 443);

            // In Testing environment, Program.cs already configures InMemory database.
            // No need to override DbContext here to avoid multiple provider registrations.

            // Register a minimal Supabase client to satisfy controller DI via reflection
            try
            {
                var clientType = Type.GetType("Supabase.Client, Supabase");
                var optionsType = Type.GetType("Supabase.SupabaseOptions, Supabase");
                if (clientType != null)
                {
                    object? optionsInstance = null;
                    if (optionsType != null)
                    {
                        optionsInstance = Activator.CreateInstance(optionsType);
                        var prop1 = optionsType.GetProperty("AutoRefreshToken");
                        var prop2 = optionsType.GetProperty("AutoConnectRealtime");
                        prop1?.SetValue(optionsInstance, false);
                        prop2?.SetValue(optionsInstance, false);
                    }

                    var instance = optionsInstance is null
                        ? Activator.CreateInstance(clientType, new object?[] { "http://localhost", "test" })
                        : Activator.CreateInstance(clientType, new object?[] { "http://localhost", "test", optionsInstance });
                    if (instance != null)
                    {
                        services.AddSingleton(clientType, instance);
                    }
                }
            }
            catch
            {
                // If Supabase types aren't available or constructor differs, ignore.
            }
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);
        // Optionally seed data here
        return host;
    }
}
