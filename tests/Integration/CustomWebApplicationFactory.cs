using IoTM.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace IoTM.Tests.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Set required env var so Program.cs doesn't throw
        builder.UseEnvironment("Development");
        Environment.SetEnvironmentVariable("SUPABASE_DB_CONNECTION", "Host=localhost;Database=test;Username=test;Password=test");

        builder.ConfigureServices(services =>
        {
            // Replace the real DB with InMemory
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase($"IoTM_IntTest_{Guid.NewGuid()}");
            });
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);
        // Optionally seed data here
        return host;
    }
}
